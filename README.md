# EARN App - Katalog Aplikasi Web3

EARN App adalah platform katalog berbasis komunitas untuk aplikasi dan layanan web3, yang memungkinkan pengguna untuk menelusuri, menemukan, dan menambahkan proyek kripto di berbagai kategori.

## Fitur Utama

- **Katalog Proyek Kripto**: Jelajahi daftar lengkap aplikasi web3 yang dikelompokkan dalam kategori spesifik
- **Sistem Autentikasi**: Login dan registrasi pengguna dengan keamanan password terenkripsi
- **Pengajuan Proyek**: Pengguna terdaftar dapat mengirimkan proyek baru untuk ditambahkan ke katalog
- **Profil Pengguna**: Lihat dan kelola proyek yang telah Anda ajukan
- **Panel Admin**: Manajemen kategori dan proses persetujuan proyek oleh administrator
- **Responsif**: Desain yang optimal untuk perangkat mobile dan desktop

## Kategori Proyek

EARN App mencakup sembilan kategori kripto khusus:

1. **Airdrop**: Program distribusi token gratis
2. **Wallet**: Dompet kripto untuk menyimpan aset digital
3. **Exchanges & DEX**: Bursa perdagangan kripto terpusat dan terdesentralisasi
4. **Explorers**: Alat untuk melihat dan menganalisis transaksi blockchain
5. **Utilities**: Aplikasi utilitas dan alat pembantu kripto
6. **NFT Services**: Layanan dan marketplace untuk NFT
7. **Staking**: Platform untuk staking dan yield farming
8. **Bridges**: Protokol jembatan antar-blockchain
9. **Channels**: Komunitas dan sumber informasi kripto

## Teknologi yang Digunakan

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL dengan Drizzle ORM
- **Autentikasi**: Passport.js dengan strategi lokal
- **State Management**: TanStack React Query

## Arsitektur Aplikasi

- **Model Data**: Didefinisikan di `shared/schema.ts` dengan Drizzle ORM dan Zod
- **Server**: API RESTful di Express dengan validasi data menggunakan Zod
- **Client**: Aplikasi React dengan routing menggunakan Wouter
- **Storage**: Implementasi penyimpanan dengan PostgreSQL

## Fitur Teknis

### Manajemen Situs
- Kustomisasi nama situs, logo, dan warna tema
- Pengaturan default ikon proyek yang digunakan ketika proyek tidak menyediakan ikon kustom
- Kustomisasi footer dan teks hak cipta

### Manajemen Proyek
- Upload ikon proyek (mendukung gambar hingga 2MB)
- Sistem persetujuan proyek dua tahap (persetujuan dan verifikasi)
- Kategorisasi proyek berdasarkan jenis aplikasi

### Pengguna dan Autentikasi
- Registrasi dan login dengan validasi email dan password
- Profil pengguna dengan avatar kustom dan info bio
- Dashboard pengguna untuk melihat dan mengelola proyek yang diajukan

### Sistem Kategori
- Manajemen kategori dari panel admin
- Pemfilteran proyek berdasarkan kategori
- Tambah/hapus/edit kategori dari panel admin

### Desain Responsif
- Tampilan yang dioptimalkan untuk perangkat mobile, tablet, dan desktop
- Ukuran minimum panel admin 700px untuk memastikan semua tab terlihat

## Instalasi dan Penggunaan

### Persyaratan
- Node.js versi 18 atau lebih tinggi
- PostgreSQL versi 14 atau lebih tinggi
- npm versi 8 atau lebih tinggi

### Langkah Penginstalan

1. **Clone Repositori**
   ```bash
   git clone https://github.com/yourusername/earn-app.git
   cd earn-app
   ```

2. **Instal Dependencies**
   ```bash
   npm install
   ```

3. **Setup Database PostgreSQL**
   - Buat database baru untuk aplikasi
   ```sql
   CREATE DATABASE earn_app;
   ```
   - Pastikan user PostgreSQL memiliki hak akses penuh ke database tersebut
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE earn_app TO username;
   ```

4. **Konfigurasi Environment**
   - Buat file `.env` di root project dengan isi sebagai berikut:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/earn_app
   SESSION_SECRET=your_random_session_secret
   PORT=5000
   ```
   - Ubah `username`, `password`, dan nama database sesuai dengan konfigurasi PostgreSQL Anda

5. **Inisialisasi Database**
   ```bash
   npm run db:push
   ```
   Perintah ini akan membuat semua tabel database yang diperlukan berdasarkan skema yang didefinisikan di `shared/schema.ts`

6. **Buat User Admin (Opsional)**
   ```bash
   npx tsx scripts/create-admin.ts
   ```
   Ini akan membuat user admin dengan kredensial default:
   - Email: admin@earnapp.com
   - Password: adminpassword

7. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di http://localhost:5000

### Deployment
Aplikasi ini dapat di-deploy ke platform hosting yang mendukung Node.js dan PostgreSQL seperti:
- Replit
- Vercel
- Heroku
- Railway
- Render

Saat deploy, pastikan untuk menyetel variabel lingkungan yang diperlukan di platform hosting Anda.

### Troubleshooting

#### Masalah Koneksi Database
- Pastikan PostgreSQL berjalan dan dapat diakses
- Verifikasi string koneksi DATABASE_URL dengan format yang benar
- Periksa apakah user PostgreSQL memiliki hak akses yang cukup

#### Masalah Server Tidak Berjalan
- Periksa log error dengan `npm run dev`
- Pastikan port yang digunakan tidak sedang dipakai aplikasi lain
- Verifikasi semua dependencies terinstal dengan `npm install`

#### Masalah Migrasi Database
- Jika terjadi error saat migrasi, coba hapus database dan buat ulang
- Jalankan `npx drizzle-kit generate` untuk membuat ulang migrasi
- Jalankan `npm run db:push` untuk menerapkan skema terbaru

#### Reset Admin Password
Jika Anda lupa password admin, gunakan script berikut:
```bash
npx tsx scripts/reset-admin-password.ts
```

## Struktur Proyek

```
├── client/               # Frontend aplikasi React
│   ├── src/
│   │   ├── components/   # Komponen UI
│   │   ├── hooks/        # React hooks kustom
│   │   ├── lib/          # Utilitas dan helper
│   │   ├── pages/        # Komponen halaman
│   │   └── App.tsx       # Komponen utama aplikasi
├── server/               # Backend Express
│   ├── auth.ts           # Konfigurasi autentikasi
│   ├── db.ts             # Konfigurasi database
│   ├── routes.ts         # API routes
│   └── storage.ts        # Interface dan implementasi storage
├── shared/
│   └── schema.ts         # Model data bersama
└── drizzle.config.ts     # Konfigurasi Drizzle ORM
```

## Kontributor

- Dikembangkan oleh: Tim Replit

## Pemeliharaan

### Panduan Update
- Untuk update minor, gunakan cabang `development`
- Untuk update major, buat cabang terpisah dan lakukan merge request
- Jalankan test sebelum melakukan push ke repository utama
- Update versi di `package.json` mengikuti standar Semantic Versioning

### Backup
Disarankan untuk melakukan backup database secara berkala:
```bash
# Export database
pg_dump -U username -d earn_app > backup_$(date +%Y%m%d).sql

# Import database
psql -U username -d earn_app < backup_file.sql
```

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

© 2025 EARN App | Katalog Aplikasi Web3