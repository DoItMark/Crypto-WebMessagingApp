import { webcrypto } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { sign, verify, pemToKey, base64urlEncode } from './jwt.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const KEY_DIR = process.env.KEY_DIR || './keys';
const PRIV_PATH = `${KEY_DIR}/jwt-private.pem`;
const PUB_PATH = `${KEY_DIR}/jwt-public.pem`;

export const JWT_ALG = 'ES256';
export const JWT_ISS = 'tugas3-chat';
export const JWT_AUD = 'tugas3-chat-client';
export const JWT_TTL_SECONDS = 60 * 60 * 8;

const ECDSA_ALGO = { name: 'ECDSA', namedCurve: 'P-256' };

function bytesToPem(bytes, label) {
  const b64 = Buffer.from(bytes).toString('base64');
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

let signingKey;
let verifyingKey;

export async function initJwtKeys() {
  mkdirSync(KEY_DIR, { recursive: true });
  let privPem, pubPem;

  if (existsSync(PRIV_PATH) && existsSync(PUB_PATH)) {
    privPem = readFileSync(PRIV_PATH, 'utf8');
    pubPem = readFileSync(PUB_PATH, 'utf8');
  } else {
    const kp = await webcrypto.subtle.generateKey(ECDSA_ALGO, true, ['sign', 'verify']);
    const pkcs8 = await webcrypto.subtle.exportKey('pkcs8', kp.privateKey);
    const spki = await webcrypto.subtle.exportKey('spki', kp.publicKey);
    privPem = bytesToPem(new Uint8Array(pkcs8), 'PRIVATE KEY');
    pubPem = bytesToPem(new Uint8Array(spki), 'PUBLIC KEY');
    writeFileSync(PRIV_PATH, privPem);
    writeFileSync(PUB_PATH, pubPem);
    console.log(`[auth] Generated new JWT keypair at ${KEY_DIR}/`);
  }

  signingKey = await pemToKey(privPem, ECDSA_ALGO, ['sign']);
  verifyingKey = await pemToKey(pubPem, ECDSA_ALGO, ['verify']);
}

export async function issueToken(email) {
  const now = Math.floor(Date.now() / 1000);
  const jti = base64urlEncode(webcrypto.getRandomValues(new Uint8Array(12)));
  return sign(
    { alg: JWT_ALG },
    { email },
    { iss: JWT_ISS, aud: JWT_AUD, sub: email, iat: now, nbf: now, exp: now + JWT_TTL_SECONDS, jti },
    signingKey,
  );
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing bearer token' });

  verify(m[1], verifyingKey, { algs: [JWT_ALG], iss: JWT_ISS, aud: JWT_AUD })
    .then(({ payload }) => {
      req.user = { email: payload.sub || payload.email };
      next();
    })
    .catch((err) => res.status(401).json({ error: err.message }));
}
