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

## Instalasi dan Penggunaan

1. Clone repositori ini
2. Instal dependencies dengan `npm install`
3. Setup database PostgreSQL dan perbarui variabel lingkungan
4. Jalankan migrasi database dengan `npm run db:push`
5. Jalankan aplikasi dengan `npm run dev`

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

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).