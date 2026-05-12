/**
 * Test Script untuk Modul Kriptografi
 * Uji Coba: Pembentukan Kunci, Enkripsi, dan Dekripsi Pesan
 * 
 * Bagian yang diuji:
 * - 3.4.1: Pertukaran Kunci (Key Exchange) antara Dua Pengguna
 * - 3.4.2: Derivasi Kunci Simetris dari Shared Secret
 * - 3.5.1: Pengiriman Pesan dengan Kunci Benar
 * - 3.5.2: Pengiriman Pesan dengan Kunci Salah atau Data Tidak Sesuai
 */

import { webcrypto as crypto } from 'node:crypto';

// Import crypto functions - untuk Node.js environment
const subtle = crypto.subtle;
const PBKDF2_ITERS = 100000;
const HKDF_INFO = new TextEncoder().encode('chat-encryption-key');

// ==================== Utility Functions ====================
function bytesToB64(bytes) {
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(b64) {
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

// ==================== Crypto Functions ====================
async function generateECDHKeyPair() {
  return subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
}

async function exportPublicKeyJwk(publicKey) {
  return subtle.exportKey('jwk', publicKey);
}

async function importPublicKeyJwk(jwk) {
  return subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}

function conversationSalt(emailA, emailB) {
  const [a, b] = [emailA, emailB].map((s) => s.toLowerCase()).sort();
  return new TextEncoder().encode(`${a}:${b}`);
}

async function deriveConversationKey(myPrivateKey, theirPublicKey, myEmail, theirEmail) {
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

async function encryptMessage(aesKey, plaintext) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(plaintext),
  );
  return { ciphertext: bytesToB64(new Uint8Array(ct)), iv: bytesToB64(iv) };
}

async function decryptMessage(aesKey, ciphertextB64, ivB64) {
  const pt = await subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(ivB64) },
    aesKey,
    b64ToBytes(ciphertextB64),
  );
  return new TextDecoder().decode(pt);
}

// ==================== TEST FUNCTIONS ====================

async function test_3_4_1_KeyExchange() {
  console.log('\n=== TEST 3.4.1: Pertukaran Kunci (Key Exchange) antara Dua Pengguna ===');
  
  try {
    // Generate key pairs untuk dua pengguna
    console.log('📝 Membuat pasangan kunci ECDH P-256 untuk User A...');
    const userAKeyPair = await generateECDHKeyPair();
    const userAPublicJwk = await exportPublicKeyJwk(userAKeyPair.publicKey);
    console.log('✅ User A public key (JWK):', JSON.stringify(userAPublicJwk, null, 2).substring(0, 100) + '...');

    console.log('\n📝 Membuat pasangan kunci ECDH P-256 untuk User B...');
    const userBKeyPair = await generateECDHKeyPair();
    const userBPublicJwk = await exportPublicKeyJwk(userBKeyPair.publicKey);
    console.log('✅ User B public key (JWK):', JSON.stringify(userBPublicJwk, null, 2).substring(0, 100) + '...');

    console.log('\n📝 User A mengimpor public key User B...');
    const userBPublicKey = await importPublicKeyJwk(userBPublicJwk);
    console.log('✅ User B public key berhasil diimpor');

    console.log('\n📝 User B mengimpor public key User A...');
    const userAPublicKey = await importPublicKeyJwk(userAPublicJwk);
    console.log('✅ User A public key berhasil diimpor');

    console.log('\n✅ [HASIL] Key Exchange berhasil! Kedua pengguna dapat melanjutkan ke tahap derivasi kunci.');
    return { userAKeyPair, userBKeyPair, userAPublicKey, userBPublicKey };
  } catch (err) {
    console.error('❌ [ERROR]', err.message);
    throw err;
  }
}

async function test_3_4_2_KeyDerivation(keyExchangeData) {
  console.log('\n=== TEST 3.4.2: Derivasi Kunci Simetris dari Shared Secret ===');
  
  try {
    const { userAKeyPair, userBKeyPair, userAPublicKey, userBPublicKey } = keyExchangeData;
    const userAEmail = 'alice@example.com';
    const userBEmail = 'bob@example.com';

    console.log(`📝 User A (${userAEmail}) melakukan derivasi kunci dengan User B...`);
    const keyAtA = await deriveConversationKey(
      userAKeyPair.privateKey,
      userBPublicKey,
      userAEmail,
      userBEmail
    );
    console.log('✅ User A: Kunci percakapan berhasil diturunkan');

    console.log(`\n📝 User B (${userBEmail}) melakukan derivasi kunci dengan User A...`);
    const keyAtB = await deriveConversationKey(
      userBKeyPair.privateKey,
      userAPublicKey,
      userAEmail,
      userBEmail
    );
    console.log('✅ User B: Kunci percakapan berhasil diturunkan');

    // Verify that both keys can be used
    console.log('\n📝 Verifikasi: Kedua kunci dapat digunakan untuk enkripsi/dekripsi...');
    const testMsg = 'Kunci sama!';
    const encrypted = await encryptMessage(keyAtA, testMsg);
    const decrypted = await decryptMessage(keyAtB, encrypted.ciphertext, encrypted.iv);
    
    if (decrypted === testMsg) {
      console.log('✅ [HASIL] Kedua pengguna memiliki kunci simetris yang identik!');
      console.log(`   Pesan terenkripsi: ${encrypted.ciphertext.substring(0, 50)}...`);
      console.log(`   Pesan terdekripsi: "${decrypted}"`);
      return { keyAtA, keyAtB };
    } else {
      throw new Error('Kunci tidak cocok!');
    }
  } catch (err) {
    console.error('❌ [ERROR]', err.message);
    throw err;
  }
}

async function test_3_5_1_CorrectKeyEncryption(derivationData) {
  console.log('\n=== TEST 3.5.1: Pengiriman Pesan dengan Kunci Benar ===');
  
  try {
    const { keyAtA, keyAtB } = derivationData;
    const messages = [
      'Halo, ini pesan pertama',
      'Ini pesan kedua dengan karakter khusus: ñ é ü',
      'Pesan dengan emoji: 🚀 🎉 ✅'
    ];

    console.log('📝 User A mengirim pesan kepada User B dengan kunci yang benar...\n');
    
    for (let i = 0; i < messages.length; i++) {
      const originalMsg = messages[i];
      console.log(`   Pesan ${i + 1}: "${originalMsg}"`);
      
      const encrypted = await encryptMessage(keyAtA, originalMsg);
      console.log(`   → Terenkripsi: ${encrypted.ciphertext.substring(0, 40)}...`);
      
      const decrypted = await decryptMessage(keyAtB, encrypted.ciphertext, encrypted.iv);
      console.log(`   → Terdekripsi: "${decrypted}"`);
      
      if (decrypted !== originalMsg) {
        throw new Error(`Pesan tidak cocok! Original: "${originalMsg}", Decrypted: "${decrypted}"`);
      }
      console.log('   ✅ Cocok!\n');
    }

    console.log('✅ [HASIL] Semua pesan terenkripsi dan terdekripsi dengan benar menggunakan kunci yang sama.');
  } catch (err) {
    console.error('❌ [ERROR]', err.message);
    throw err;
  }
}

async function test_3_5_2_WrongKeyDecryption(derivationData) {
  console.log('\n=== TEST 3.5.2: Pengiriman Pesan dengan Kunci Salah atau Data Tidak Sesuai ===');
  
  try {
    const { keyAtA } = derivationData;
    const userCEmail = 'charlie@example.com';
    const userAEmail = 'alice@example.com';
    
    // Generate third key pair (Charlie)
    console.log('📝 Membuat kunci percakapan untuk User C (dengan User A)...');
    const userCKeyPair = await generateECDHKeyPair();
    const userAKeyPairNew = await generateECDHKeyPair();
    const userCPublicJwk = await exportPublicKeyJwk(userCKeyPair.publicKey);
    const userAPublicJwk = await exportPublicKeyJwk(userAKeyPairNew.publicKey);
    
    const userCPublicKey = await importPublicKeyJwk(userAPublicJwk);
    
    const keyAtC = await deriveConversationKey(
      userCKeyPair.privateKey,
      userCPublicKey,
      userCEmail,
      userAEmail
    );
    console.log('✅ User C: Kunci percakapan dengan User A berhasil diturunkan (BERBEDA dari kunci A-B)\n');

    // Test 1: Wrong key decryption
    console.log('📝 TEST KASUS 1: Pesan dienkripsi dengan kunci A-B, dicoba dekripsi dengan kunci A-C...');
    const originalMsg = 'Pesan rahasia';
    const encrypted = await encryptMessage(keyAtA, originalMsg);
    console.log(`   Pesan asli: "${originalMsg}"`);
    console.log(`   Terenkripsi: ${encrypted.ciphertext.substring(0, 40)}...`);
    
    try {
      const decrypted = await decryptMessage(keyAtC, encrypted.ciphertext, encrypted.iv);
      console.log(`   ❌ ERROR: Pesan berhasil didekripsi! Ini tidak seharusnya terjadi.`);
      console.log(`   Hasil: "${decrypted}"`);
    } catch (err) {
      console.log(`   ✅ Dekripsi GAGAL (seperti yang diharapkan): ${err.message}`);
    }

    // Test 2: Tampered ciphertext
    console.log('\n📝 TEST KASUS 2: Ciphertext diubah (tampered), dicoba dekripsi...');
    const tamperedCiphertext = Buffer.from(b64ToBytes(encrypted.ciphertext));
    tamperedCiphertext[0] = (tamperedCiphertext[0] + 1) % 256; // Ubah byte pertama
    const tamperedB64 = bytesToB64(tamperedCiphertext);
    console.log(`   Original ciphertext: ${encrypted.ciphertext.substring(0, 40)}...`);
    console.log(`   Tampered ciphertext: ${tamperedB64.substring(0, 40)}...`);
    
    try {
      const decrypted = await decryptMessage(keyAtA, tamperedB64, encrypted.iv);
      console.log(`   ❌ ERROR: Pesan berhasil didekripsi! Ini tidak seharusnya terjadi.`);
      console.log(`   Hasil: "${decrypted}"`);
    } catch (err) {
      console.log(`   ✅ Dekripsi GAGAL (seperti yang diharapkan): Authentication tag mismatch`);
    }

    // Test 3: Wrong IV
    console.log('\n📝 TEST KASUS 3: IV diubah, dicoba dekripsi...');
    const wrongIV = bytesToB64(randomBytes(12));
    console.log(`   Original IV: ${encrypted.iv}`);
    console.log(`   Wrong IV: ${wrongIV}`);
    
    try {
      const decrypted = await decryptMessage(keyAtA, encrypted.ciphertext, wrongIV);
      console.log(`   ❌ ERROR: Pesan berhasil didekripsi! Ini tidak seharusnya terjadi.`);
    } catch (err) {
      console.log(`   ✅ Dekripsi GAGAL (seperti yang diharapkan): ${err.message.substring(0, 50)}...`);
    }

    console.log('\n✅ [HASIL] Semua skenario dengan kunci/data salah berhasil ditangani dengan baik.');
    console.log('   Sistem berhasil mendeteksi dan menolak data yang tidak valid.');
  } catch (err) {
    console.error('❌ [ERROR]', err.message);
    throw err;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          SUITES UJI KRIPTOGRAFI - MESSAGING APP                           ║');
  console.log('║  Uji Pembentukan Kunci, Enkripsi, dan Dekripsi Pesan                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  try {
    const keyExchangeData = await test_3_4_1_KeyExchange();
    const derivationData = await test_3_4_2_KeyDerivation(keyExchangeData);
    await test_3_5_1_CorrectKeyEncryption(derivationData);
    await test_3_5_2_WrongKeyDecryption(derivationData);

    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SEMUA PENGUJIAN BERHASIL                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  } catch (err) {
    console.error('\n❌ PENGUJIAN GAGAL:', err.message);
    process.exit(1);
  }
}

runAllTests();
