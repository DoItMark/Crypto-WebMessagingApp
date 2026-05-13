# CipherChat

Aplikasi web messaging yang aman dengan enkripsi end-to-end, autentikasi pengguna, dan koneksi yang terenkripsi. Aplikasi ini dibangun sebagai proyek pembelajaran kriptografi dengan fokus pada keamanan komunikasi digital.

## 📋 Daftar Isi
- [Deskripsi](#deskripsi)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Direktori](#struktur-direktori)

---

## Deskripsi

**CipherChat** adalah aplikasi web real-time untuk mengirim pesan yang aman dengan fitur-fitur:
- **Enkripsi End-to-End**: Pesan dienkripsi sebelum dikirim ke server
- **Autentikasi Pengguna**: Login dan registrasi dengan password hashing menggunakan bcrypt
- **Manajemen Kontak**: Tambah dan kelola daftar kontak
- **Interface Modern**: UI responsif dengan Tailwind CSS
- **Database Lokal**: SQLite untuk penyimpanan data yang efisien

---

## Teknologi

### Frontend
| Teknologi | Versi | Deskripsi |
|-----------|-------|----------|
| **React** | ^18.3.1 | Library JavaScript untuk membangun UI interaktif |
| **React Router DOM** | ^6.26.2 | Router untuk navigasi multi-halaman |
| **Vite** | ^5.4.8 | Build tool modern dan fast |
| **Tailwind CSS** | ^3.4.13 | Utility-first CSS framework |
| **PostCSS** | ^8.4.47 | Tool untuk transformasi CSS |
| **Autoprefixer** | ^10.4.20 | Plugin PostCSS untuk vendor prefix otomatis |

### Backend
| Teknologi | Versi | Deskripsi |
|-----------|-------|----------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | ^4.21.0 | Web framework untuk REST API |
| **Better SQLite3** | ^11.3.0 | Database SQLite dengan sync API |
| **Bcrypt** | ^5.1.1 | Library untuk hashing password |
| **CORS** | ^2.8.5 | Middleware untuk Cross-Origin Resource Sharing |

### DevOps & Infrastructure
- **Docker** & **Docker Compose**: Containerization dan orchestration
- **Nginx**: Reverse proxy dan web server
- **SQLite**: Lightweight database

---

## Dependencies

### Client Dependencies

**Production Dependencies:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2"
}
```

**Development Dependencies:**
```json
{
  "@vitejs/plugin-react": "^4.3.1",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.47",
  "tailwindcss": "^3.4.13",
  "vite": "^5.4.8"
}
```

### Server Dependencies

**Production Dependencies:**
```json
{
  "bcrypt": "^5.1.1",
  "better-sqlite3": "^11.3.0",
  "cors": "^2.8.5",
  "express": "^4.21.0"
}
```

---

## Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- **Node.js** v18 atau lebih tinggi ([Download](https://nodejs.org/))
- **npm** v9 atau lebih tinggi (biasanya terinstal bersama Node.js)
- **Docker** dan **Docker Compose** (opsional, untuk menjalankan dengan container)

Verifikasi instalasi:
```bash
node --version    # v18.x.x atau lebih tinggi
npm --version     # v9.x.x atau lebih tinggi
docker --version  # (opsional)
```

---

## Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd Crypto-WebMessagingApp
```

### 2. Instalasi Dependencies Client
```bash
cd client
npm install
cd ..
```

### 3. Instalasi Dependencies Server
```bash
cd server
npm install
cd ..
```

---

## ▶️ Cara Menjalankan

### Opsi 1: Menjalankan Secara Manual (Development)

**Terminal 1 - Jalankan Server:**
```bash
cd server
npm run dev
# atau
npm start
```

Server akan berjalan di: `http://localhost:3001`

**Terminal 2 - Jalankan Client:**
```bash
cd client
npm run dev
# atau
npm start
```

Client akan dapat diakses di: `http://localhost:5173`

### Opsi 2: Menjalankan dengan Docker Compose

**Development Mode:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Production Mode:**
```bash
docker-compose up
```

Atau gunakan script batch (Windows):
```bash
docker-start.bat
```

Atau script shell (Linux/Mac):
```bash
bash docker-start.sh
```

### Opsi 3: Build untuk Production

**Build Client:**
```bash
cd client
npm run build
# Output di: ./client/dist
```

**Build Docker Images:**
```bash
docker-compose build
docker-compose up
```

---

## Konfigurasi Environment

### Server Configuration

File konfigurasi utama server: `server/src/index.js`

**Environment Variables:**
```env
NODE_ENV=development          # atau production
PORT=3001                     # Port server
```

**Database:**
- File database: `server/data/database.db`
- Dibuat otomatis saat server pertama kali dijalankan

**Security Keys:**
- Folder: `server/keys/`
- Digunakan untuk enkripsi/dekripsi pesan

### Client Configuration

File konfigurasi utama client: `client/vite.config.js`

**API Endpoint:**
- Server API diakses di: `http://localhost:3001/api`
- Konfigurasi dapat diubah di: `client/src/lib/api.js`

**Build Configuration (Vite):**
```javascript
// client/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false
  }
})
```

---

## 📁 Struktur Direktori

```
Crypto-WebMessagingApp/
├── 📄 README.md                 # File dokumentasi ini
├── 📄 docker-compose.yml        # Docker Compose (production)
├── 📄 docker-compose.dev.yml    # Docker Compose (development)
├── 📄 docker-start.bat          # Script start Docker (Windows)
├── 📄 docker-start.sh           # Script start Docker (Linux/Mac)
├── 📄 Dockerfile.client         # Docker config untuk client
├── 📄 Dockerfile.server         # Docker config untuk server
├── 📄 nginx.conf                # Nginx configuration
│
├── 📂 client/                   # Frontend Application
│   ├── 📄 package.json          # Dependencies client
│   ├── 📄 vite.config.js        # Konfigurasi Vite
│   ├── 📄 tailwind.config.js    # Konfigurasi Tailwind
│   ├── 📄 postcss.config.js     # Konfigurasi PostCSS
│   ├── 📄 index.html            # Entry HTML
│   │
│   └── 📂 src/
│       ├── 📄 main.jsx          # Entry point React
│       ├── 📄 App.jsx           # Root component
│       ├── 📄 index.css         # Global styles
│       ├── 📄 auth.jsx          # Authentication logic
│       │
│       ├── 📂 pages/            # Halaman aplikasi
│       │   ├── Landing.jsx      # Halaman utama
│       │   ├── Login.jsx        # Login page
│       │   ├── Register.jsx     # Registrasi page
│       │   ├── Chat.jsx         # Chat/messaging page
│       │   └── Contacts.jsx     # Manajemen kontak
│       │
│       ├── 📂 lib/              # Utility functions
│       │   ├── api.js           # API client
│       │   ├── crypto.js        # Enkripsi/dekripsi
│       │   └── jwt.js           # JWT token handling
│       │
│       └── 📂 assets/           # Asset statis
│           └── images/          # Gambar
│
└── 📂 server/                   # Backend Application
    ├── 📄 package.json          # Dependencies server
    │
    ├── 📂 data/                 # Database storage
    │   └── database.db          # SQLite database
    │
    ├── 📂 keys/                 # Encryption keys
    │
    └── 📂 src/
        ├── 📄 index.js          # Entry point server
        ├── 📄 db.js             # Database initialization
        ├── 📄 auth.js           # Authentication logic
        ├── 📄 jwt.js            # JWT token handling
        │
        └── 📂 routes/           # API routes
            ├── auth.js          # Auth endpoints
            ├── contacts.js      # Contacts endpoints
            └── messages.js      # Messages endpoints
```

---

## Fitur Keamanan

- **Password Hashing**: Menggunakan bcrypt dengan salt rounds
- **JWT Token**: Autentikasi berbasis token
- **CORS**: Kontroled cross-origin requests
- **Enkripsi Pesan**: End-to-end encryption untuk pesan
- **Secure Headers**: HTTP security headers di Nginx

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna
- `GET /api/auth/me` - Get current user (requires token)

### Contacts
- `GET /api/contacts` - Ambil daftar kontak
- `POST /api/contacts` - Tambah kontak baru
- `DELETE /api/contacts/:id` - Hapus kontak

### Messages
- `GET /api/messages/:contactId` - Ambil pesan dengan kontak
- `POST /api/messages` - Kirim pesan
- `DELETE /api/messages/:id` - Hapus pesan

---

## Troubleshooting

### Port sudah digunakan
```bash
# Ganti port di environment variable
PORT=3002 npm start
```

### Database error
```bash
# Hapus database dan buat ulang
rm server/data/database.db
npm start
```

### Dependency issues
```bash
# Hapus node_modules dan package-lock.json
rm -r node_modules package-lock.json
npm install
```

---

## Lisensi

Proyek ini dibuat untuk tujuan pembelajaran mata kuliah II4021 Kriptografi.

---

## Kontak & Support

Luckman Fakhmanidris Arvasirri 18223041@std.stei.itb.ac.id

M Rabbani K. A. 18223130@std.stei.itb.ac.id

Muhammad Rafly Fauzan 18223132@std.stei.itb.ac.id
