# LAPORAN PENGUJIAN MODUL KRIPTOGRAFI
Uji Pembentukan Kunci, Enkripsi, dan Dekripsi Pesan

---

## 3.4 Uji Pembentukan Kunci Komunikasi

Bagian ini menjelaskan pengujian untuk proses pembentukan kunci komunikasi antara dua pengguna dalam sistem. Sistem menggunakan algoritma ECDH (Elliptic Curve Diffie-Hellman) dengan kurva P-256 dan HKDF untuk derivasi kunci. Pengujian bertujuan untuk memverifikasi bahwa proses pembentukan kunci berjalan dengan baik sesuai dengan spesifikasi yang telah ditetapkan.

### 3.4.1 Key Exchange antara Dua Pengguna

#### Deskripsi
Pengujian ini memverifikasi bahwa dua pengguna dapat melakukan pertukaran kunci publik dengan aman dan menghasilkan shared secret yang sama.

#### Prosedur Pengujian

**Tahap 1: Pembangkitan Pasangan Kunci**
- Setiap pengguna membangkitkan pasangan kunci ECDH dengan kurva P-256
  - Kunci publik: dapat dibagikan dengan pengguna lain
  - Kunci privat: hanya dipegang oleh pengguna sendiri (tidak pernah ditransmisikan)

**Tahap 2: Pertukaran Kunci Publik**
- User A mengirimkan kunci publik ke User B melalui server
- User B mengirimkan kunci publik ke User A melalui server
- Kunci publik disimpan dalam format JWK (JSON Web Key) untuk kemudahan transportasi

**Tahap 3: Verifikasi**
- Masing-masing pengguna mengimpor kunci publik pihak lain
- Sistem memverifikasi bahwa kunci publik yang diterima valid dan dapat digunakan untuk operasi berikutnya

#### Parameter Pengujian
| Parameter | Nilai |
|-----------|-------|
| Algoritma | ECDH (Elliptic Curve Diffie-Hellman) |
| Kurva | P-256 (secp256r1) |
| Format Kunci Publik | JWK (JSON Web Key) |
| Jumlah Pengguna | 2 (Alice dan Bob) |

#### Hasil yang Diharapkan
- User A berhasil membuat pasangan kunci P-256
- User B berhasil membuat pasangan kunci P-256
- User A berhasil mengimpor kunci publik User B
- User B berhasil mengimpor kunci publik User A
- Kedua pengguna siap untuk melanjutkan ke tahap derivasi kunci

---

### 3.4.2 Derivasi Kunci Simetris dari Shared Secret

#### Deskripsi
Pengujian ini memverifikasi bahwa kedua pengguna dapat menjalankan proses ECDH untuk menghasilkan shared secret, kemudian menggunakan HKDF untuk menjarunkan kunci simetris AES-GCM yang identik.

#### Prosedur Pengujian

**Tahap 1: Derivasi Shared Secret**
- User A menggunakan kunci privatnya dan kunci publik User B untuk melakukan ECDH
- User B menggunakan kunci privatnya dan kunci publik User A untuk melakukan ECDH
- Kedua proses menghasilkan shared secret 256-bit yang identik

**Tahap 2: Key Derivation menggunakan HKDF**
- Shared secret digunakan sebagai input keying material (IKM) untuk HKDF
- HKDF-Expand menggunakan:
  - Hash function: SHA-256
  - Salt: kombinasi email kedua pengguna (diurutkan alfabetis)
  - Info: string konstan `'chat-encryption-key'`
- Output: kunci AES-GCM 256-bit

**Tahap 3: Verifikasi Kecocokan Kunci**
- Pesan dienkripsi menggunakan kunci di User A
- Pesan didekripsi menggunakan kunci di User B
- Jika plaintext cocok, maka kunci identik

#### Parameter Pengujian
| Parameter | Nilai |
|-----------|-------|
| Email User A | alice@example.com |
| Email User B | bob@example.com |
| Ukuran Shared Secret | 256-bit |
| Fungsi Hash HKDF | SHA-256 |
| Ukuran Kunci Output | 256-bit (untuk AES-GCM) |
| Algoritma Output | AES-GCM |

#### Proses ECDH dan HKDF

```
User A:
  Input Privat: private_key_A
  Input Publik: public_key_B
  → ECDH → shared_secret_AB (256-bit)
  → HKDF-SHA256(salt, info) → conversation_key_A (256-bit, AES-GCM)

User B:
  Input Privat: private_key_B
  Input Publik: public_key_A
  → ECDH → shared_secret_BA (256-bit)
  → HKDF-SHA256(salt, info) → conversation_key_B (256-bit, AES-GCM)

Hasil: conversation_key_A ≡ conversation_key_B
```

#### Hasil yang Diharapkan
- User A berhasil melakukan ECDH derivation
- User B berhasil melakukan ECDH derivation
- Kedua pengguna menghasilkan kunci simetris yang identik
- Pesan terenkripsi dengan kunci A dapat didekripsi dengan kunci B

---

## 3.5 Uji Enkripsi dan Dekripsi Pesan

### 3.5.1 Pengiriman Pesan dengan Kunci Benar

#### Deskripsi
Pengujian ini memverifikasi bahwa pesan dapat dienkripsi dengan kunci yang benar pada pengirim, dan terdekripsi dengan kunci yang benar pada penerima.

#### Prosedur Pengujian

**Tahap 1: Persiapan**
- Kedua pengguna telah menjalankan key derivation dan memiliki kunci simetris yang identik
- User A siap mengirimkan pesan kepada User B

**Tahap 2: Enkripsi Pesan**
- User A memilih plaintext yang akan dikirimkan
- Sistem membangkitkan IV (Initialization Vector) 12-byte secara acak
- Pesan dienkripsi menggunakan AES-GCM dengan:
  - Kunci: conversation_key_A
  - IV: random 12-byte
  - Plaintext: pesan dalam format UTF-8
- Output: ciphertext dan IV (kedua-duanya dikonversi ke Base64)

**Tahap 3: Transmisi**
- Ciphertext dan IV dikirimkan ke server
- Server menyimpan ciphertext dan IV di database
- Server mengirimkan pesan kepada User B

**Tahap 4: Dekripsi Pesan**
- User B menerima pesan dari server (ciphertext dan IV)
- User B mendekripsi menggunakan:
  - Kunci: conversation_key_B (identik dengan conversation_key_A)
  - IV: IV yang diterima
  - Ciphertext: ciphertext yang diterima
- Output: plaintext asli dalam format UTF-8

**Tahap 5: Verifikasi**
- Plaintext yang didekripsi dibandingkan dengan plaintext asli
- Jika cocok, enkripsi dan dekripsi berhasil

#### Skenario Pengujian

| No | Pesan | Keterangan |
|----|-------|-----------|
| 1 | "Halo, ini pesan pertama" | Pesan ASCII biasa |
| 2 | "Ini pesan kedua dengan karakter khusus: ñ é ü" | Pesan dengan karakter Unicode |
| 3 | "Pesan dengan emoji: 🚀 🎉 ✅" | Pesan dengan emoji (UTF-8) |

#### Parameter Pengujian
| Parameter | Nilai |
|-----------|-------|
| Algoritma Enkripsi | AES-GCM |
| Ukuran Kunci | 256-bit |
| Ukuran IV | 96-bit (12 byte) |
| Mode IV | Random untuk setiap pesan |
| Tag Length | 128-bit (default untuk AES-GCM) |

#### Alur Enkripsi-Dekripsi
```
User A (Pengirim):
  Plaintext "Halo"
  → Encode UTF-8 → [byte array]
  → AES-GCM Encrypt(key_A, IV, plaintext) → ciphertext
  → Base64 encode → ciphertext_B64
  → Base64 encode IV → IV_B64
  → Kirim (ciphertext_B64, IV_B64) ke server

Server:
  → Simpan di database
  → Kirim ke User B

User B (Penerima):
  ciphertext_B64, IV_B64
  → Base64 decode → ciphertext, IV
  → AES-GCM Decrypt(key_B, IV, ciphertext) → plaintext
  → Decode UTF-8 → "Halo"
```

#### Hasil yang Diharapkan
- Pesan 1 terenkripsi dan terdekripsi dengan benar
- Pesan 2 (Unicode) terenkripsi dan terdekripsi dengan benar
- Pesan 3 (Emoji) terenkripsi dan terdekripsi dengan benar
- Semua karakter dalam plaintext asli terpelihara setelah dekripsi

---

### 3.5.2 Pengiriman Pesan dengan Kunci Salah atau Data Tidak Sesuai

#### Deskripsi
Pengujian ini memverifikasi bahwa sistem mendeteksi dan menolak upaya dekripsi dengan data yang tidak sesuai atau kunci yang salah.

#### Prosedur Pengujian

**Kasus 1: Dekripsi dengan Kunci Salah**
- User A dan User B melakukan key derivation
- User C membangkitkan kunci conversation dengan User A (berbeda dengan kunci A-B)
- Pesan dienkripsi menggunakan kunci A-B
- User C mencoba mendekripsi dengan kunci A-C (salah)
- **Hasil yang diharapkan**: Dekripsi gagal, authentication tag tidak cocok

**Kasus 2: Ciphertext Diubah (Tampered)**
- Pesan dienkripsi dengan benar
- Byte pertama ciphertext diubah (simulating tampering)
- Sistem mencoba mendekripsi dengan data yang sudah diubah
- **Hasil yang diharapkan**: Dekripsi gagal, AES-GCM mendeteksi bahwa authentication tag tidak valid

**Kasus 3: IV Diubah**
- Pesan dienkripsi dengan IV asli
- IV diubah menjadi nilai acak yang berbeda
- Sistem mencoba mendekripsi dengan IV yang salah
- **Hasil yang diharapkan**: Dekripsi gagal, plaintext tidak sesuai atau authentication tag tidak cocok

#### Parameter Pengujian
| Kasus | Skenario | Kondisi Gagal |
|-------|---------|--------------|
| 1 | Kunci berbeda | Authentication tag mismatch |
| 2 | Ciphertext tampered | Authentication tag invalid |
| 3 | IV salah | Plaintext corrupt atau authentication tag invalid |

#### Mekanisme Proteksi AES-GCM

AES-GCM memberikan:
- **Confidentiality**: Plaintext dienkripsi dengan AES
- **Authenticity**: Authentication tag (GCM tag) memastikan ciphertext tidak diubah
- **Integrity**: Setiap bit dari ciphertext diverifikasi sebelum dekripsi

Jika ada perubahan pada ciphertext atau IV atau kunci, GCM tag tidak akan cocok dan dekripsi akan gagal.

#### Hasil yang Diharapkan
```
Kasus 1 - Kunci Salah:

Kasus 1 - Kunci Salah:
- Dekripsi gagal
- Error: "Authentication tag verification failed"

Kasus 2 - Ciphertext Diubah:
- Dekripsi gagal
- Error: "Authentication tag verification failed"

Kasus 3 - IV Salah:
- Dekripsi gagal
- Error: "Decryption failed"

Kesimpulan: Sistem berhasil mendeteksi semua upaya dekripsi yang tidak valid

## 3.7 Analisis Hasil

### Kesimpulan Pengujian

#### 3.7.1 Keberhasilan Key Exchange
✅ **BERHASIL**
Status: BERHASIL

Hasil pengujian menunjukkan bahwa:
- Dua pengguna dapat melakukan pertukaran kunci publik dengan aman
- Kunci publik dapat ditransmisikan melalui channel yang tidak aman (HTTP/HTTPS)
- Sistem dapat mengimpor dan memverifikasi kunci publik dengan benar

#### 3.7.2 Keberhasilan Key Derivation
Status: BERHASIL

Hasil pengujian menunjukkan bahwa:
- Algoritma ECDH + HKDF menghasilkan kunci simetris yang identik untuk kedua pengguna
- Proses bersifat deterministic: hasil derivasi selalu sama untuk pengguna yang sama
- Kunci yang diturunkan dapat digunakan untuk enkripsi dan dekripsi pesan

#### 3.7.3 Keberhasilan Enkripsi-Dekripsi
Status: BERHASIL

Hasil pengujian menunjukkan bahwa:
- Pesan dapat dienkripsi dengan benar menggunakan AES-GCM
- Pesan dapat didekripsi dengan benar oleh penerima yang memiliki kunci yang sama
- Sistem mendukung berbagai jenis plaintext: ASCII, Unicode, dan Emoji

#### 3.7.4 Keberhasilan Deteksi Anomali
Status: BERHASIL

Hasil pengujian menunjukkan bahwa:
- Sistem mendeteksi upaya ciphertext yang telah diubah (tampered)
- Sistem mendeteksi penggunaan IV yang tidak sesuai
- Semua kasus error ditangani dengan mekanisme authentication tag AES-GCM

### Keamanan Kriptografi

#### Algoritma yang Digunakan
| Fungsi | Algoritma | Parameter | Status |
|--------|-----------|-----------|--------|
1. Forward Secrecy
   Setiap percakapan menggunakan kunci simetris yang diturunkan dari ECDH. Jika satu kunci komunikasi terkompromi, kunci komunikasi lain tetap aman. Properti ini terpenuhi pada level percakapan antara dua pengguna.

2. Authentication
   AES-GCM menyediakan authenticity check melalui authentication tag. Server tidak dapat memodifikasi ciphertext tanpa terdeteksi. Properti ini terpenuhi.

3. Confidentiality
   Plaintext dienkripsi dengan AES-256. Brute force attack memerlukan 2^256 attempts untuk memecahkan kunci. Properti ini terpenuhi.

4. Integrity
   Setiap ciphertext dilengkapi dengan GCM tag. Modifikasi ciphertext akan menyebabkan dekripsi gagal. Properti ini terpenuhi.tiality**
- Plaintext dienkripsi dengan AES-256
- Brute force attack memerlukan 2^256 attempts
- ✅ Terpenuhi

**4. Integrity**
- Setiap ciphertext dilengkapi dengan GCM tag
- Modifikasi ciphertext akan menyebabkan dekripsi gagal
- ✅ Terpenuhi

### Rekomendasi

1. **Penyimpanan Kunci Privat**: Kunci privat harus disimpan dengan enkripsi (password-protected)
2. **Perfect Forward Secrecy**: Pertimbangkan ephemeral key exchange untuk setiap sesi
3. **Key Rotation**: Implementasikan mekanisme rotasi kunci berkala
4. **Certificate Pinning**: Untuk koneksi HTTPS, pertimbangkan certificate pinning
5. **Secure Random**: Gunakan CSPRNG untuk pembangkitan IV (sudah diimplementasikan)

### Kesimpulan Akhir

Sistem kriptografi telah berhasil menjalani semua pengujian:
- Key Exchange: Berhasil
- Key Derivation: Berhasil
- Enkripsi-Dekripsi: Berhasil
- Deteksi Anomali: Berhasil

Sistem siap untuk implementasi produksi dengan perhatian khusus pada best practices keamanan yang telah dijelaskan pada bagian rekomendasi.

---

## Lampiran: Test Output

```
╔════════════════════════════════════════════════════════════════════════════╗
║          SUITES UJI KRIPTOGRAFI - MESSAGING APP                           ║
║  Uji Pembentukan Kunci, Enkripsi, dan Dekripsi Pesan                     ║
╚════════════════════════════════════════════════════════════════════════════╝

=== TEST 3.4.1: Pertukaran Kunci (Key Exchange) antara Dua Pengguna ===
📝 Membuat pasangan kunci ECDH P-256 untuk User A...
✅ User A public key (JWK): ...
📝 Membuat pasangan kunci ECDH P-256 untuk User B...
✅ User B public key (JWK): ...
📝 User A mengimpor public key User B...
✅ User B public key berhasil diimpor
📝 User B mengimpor public key User A...
✅ User A public key berhasil diimpor
✅ [HASIL] Key Exchange berhasil!

=== TEST 3.4.2: Derivasi Kunci Simetris dari Shared Secret ===
📝 User A (alice@example.com) melakukan derivasi kunci dengan User B...
✅ User A: Kunci percakapan berhasil diturunkan
📝 User B (bob@example.com) melakukan derivasi kunci dengan User A...
✅ User B: Kunci percakapan berhasil diturunkan
📝 Verifikasi: Kedua kunci dapat digunakan untuk enkripsi/dekripsi...
✅ [HASIL] Kedua pengguna memiliki kunci simetris yang identik!

=== TEST 3.5.1: Pengiriman Pesan dengan Kunci Benar ===
📝 User A mengirim pesan kepada User B dengan kunci yang benar...
   Pesan 1: "Halo, ini pesan pertama"
   → Terenkripsi: ...
   → Terdekripsi: "Halo, ini pesan pertama"
   ✅ Cocok!
...

=== TEST 3.5.2: Pengiriman Pesan dengan Kunci Salah atau Data Tidak Sesuai ===
📝 TEST KASUS 1: Pesan dienkripsi dengan kunci A-B, dicoba dekripsi dengan kunci A-C...
   ✅ Dekripsi GAGAL (seperti yang diharapkan)
📝 TEST KASUS 2: Ciphertext diubah (tampered), dicoba dekripsi...
   ✅ Dekripsi GAGAL (seperti yang diharapkan)
📝 TEST KASUS 3: IV diubah, dicoba dekripsi...
   ✅ Dekripsi GAGAL (seperti yang diharapkan)
✅ [HASIL] Semua skenario dengan kunci/data salah berhasil ditangani dengan baik.

╔════════════════════════════════════════════════════════════════════════════╗
║                    ✅ SEMUA PENGUJIAN BERHASIL                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

**Tanggal Pengujian**: 12 Mei 2026  
**Status**: ✅ LULUS  
**Penguji**: Automated Test Suite
