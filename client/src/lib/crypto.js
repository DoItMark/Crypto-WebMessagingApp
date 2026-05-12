const subtle = crypto.subtle;
const PBKDF2_ITERS = 100000;
const HKDF_INFO = new TextEncoder().encode('chat-encryption-key');

export function bytesToB64(bytes) {
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

export async function generateECDHKeyPair() {
  return subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
}

export async function exportPublicKeyJwk(publicKey) {
  return subtle.exportKey('jwk', publicKey);
}

export async function importPublicKeyJwk(jwk) {
  return subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}

async function exportPrivateKeyPkcs8(privateKey) {
  return new Uint8Array(await subtle.exportKey('pkcs8', privateKey));
}

async function importPrivateKeyPkcs8(bytes) {
  return subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );
}

async function deriveWrapKey(password, saltBytes) {
  const material = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function wrapPrivateKey(password, privateKey) {
  const kdfSalt = randomBytes(16);
  const iv = randomBytes(12);
  const wrapKey = await deriveWrapKey(password, kdfSalt);
  const pkcs8 = await exportPrivateKeyPkcs8(privateKey);
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, pkcs8);
  return {
    encryptedPrivateKey: bytesToB64(new Uint8Array(ct)),
    iv: bytesToB64(iv),
    kdfSalt: bytesToB64(kdfSalt),
  };
}

export async function unwrapPrivateKey(password, { encryptedPrivateKey, iv, kdfSalt }) {
  const wrapKey = await deriveWrapKey(password, b64ToBytes(kdfSalt));
  const pt = await subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(iv) },
    wrapKey,
    b64ToBytes(encryptedPrivateKey),
  );
  return importPrivateKeyPkcs8(new Uint8Array(pt));
}

function conversationSalt(emailA, emailB) {
  const [a, b] = [emailA, emailB].map((s) => s.toLowerCase()).sort();
  return new TextEncoder().encode(`${a}:${b}`);
}

export async function deriveConversationKey(myPrivateKey, theirPublicKey, myEmail, theirEmail) {
  const sharedBits = await subtle.deriveBits(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    256,
  );
  const hkdfMaterial = await subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
  return subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: conversationSalt(myEmail, theirEmail),
      info: HKDF_INFO,
    },
    hkdfMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptMessage(aesKey, plaintext) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(plaintext),
  );
  return { ciphertext: bytesToB64(new Uint8Array(ct)), iv: bytesToB64(iv) };
}

export async function decryptMessage(aesKey, ciphertextB64, ivB64) {
  const pt = await subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(ivB64) },
    aesKey,
    b64ToBytes(ciphertextB64),
  );
  return new TextDecoder().decode(pt);
}
