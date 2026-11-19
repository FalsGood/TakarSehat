# TakarSehat 🌿

> **Catat Gejala, Cek Obat, Takar Pola Hidup, dan Artikel Kesehatan Terpercaya.**

TakarSehat adalah aplikasi web kesehatan personal terintegrasi berbasis **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL (Neon DB)**, dan **Prisma ORM**. Aplikasi ini dirancang untuk memudahkan masyarakat memantau kondisi fisik, mengelola jadwal pengobatan, menakar kebiasaan hidup seimbang, serta mengakses artikel edukasi medis terverifikasi.

---

## 🌟 4 Pilar Fitur Utama

1. **🩺 Catat Gejala & Panduan Awal (SymptomLog & ConditionReference)**
   - Pilihan cepat 17+ chip gejala umum serta opsi penambahan gejala kustom.
   - Slider tingkat keparahan dinamis (skala 1–10) dengan visualisasi warna (Hijau / Kuning / Merah).
   - Rekomendasi kondisi medis edukatif secara *real-time* berbasis literatur resmi Kemenkes RI dan WHO, dilengkapi tanda awal (*early signs*), penyebab umum (*common causes*), dan tanda bahaya darurat (*red flags*).
   - Penafian medis eksplisit bahwa fitur ini bukan pengganti diagnosis dokter.
   - Riwayat catatan gejala lengkap dengan catatan pemicu (*trigger note*) dan opsi kelola data.

2. **💊 Cek Obat & Kepatuhan Jadwal (Medication & MedicationLog)**
   - Manajemen daftar obat/suplemen rutin (`medicineName`, `dosageNote`, `scheduleTime`, `isActive`).
   - Pencatatan status minum obat harian (`taken`, `skipped`, `pending`, dan waktu aktual `takenAt`).
   - Tombol aksi cepat 1-klik: **"✓ Sudah Minum"**, **"✕ Lewati"**, atau **"↺ Reset"**.
   - Perhitungan metrik kepatuhan harian (*Adherence Rate %*) dan pelacakan dosis harian secara *real-time*.

3. **⚖️ Takar Pola Hidup (HabitGuide & DailyHabitLog)**
   - Panduan porsi makan bergizi seimbang (Metode Piring T Tumpeng Gizi Kemenkes), hidrasi 8 gelas air putih, aktivitas fisik 30 menit (WHO), tidur berkualitas 7–9 jam, dan manajemen stres *mindfulness*.
   - Filter tab kategori: *Nutrisi*, *Hidrasi*, *Olahraga*, *Tidur*, dan *Mindfulness*.
   - Checklist interaktif penyelesaian kebiasaan harian dengan progress bar capaian.
   - Kolom catatan porsi aktual & evaluasi mandiri harian per kebiasaan.

4. **📰 Artikel Kesehatan Terpercaya (Article)**
   - Repositori artikel kesehatan terverifikasi dari institusi resmi (Kemenkes RI, WHO, BPOM RI, IDF).
   - Pencarian kata kunci (*full-text query*), filter kategori, dan filter tag topik populer (`#hipertensi`, `#diabetes`, `#olahraga`, `#tidur`, `#gizi`).
   - Transparansi rujukan: nama institusi, tautan rujukan resmi eksternal (`sourceUrl`), estimasi waktu baca (`readMinutes`), dan tanggal pembaruan.
   - Halaman baca lengkap berformat bersih dengan penafian medis dan rekomendasi 3 artikel terkait.

5. **📊 Dashboard "Ringkasan Hari Ini" (Dashboard Overview)**
   - Tampilan terpadu status harian: metrik kepatuhan obat, progres pola hidup hari ini, ringkasan gejala terbaru, dan cuplikan artikel edukasi.
   - Terintegrasi 2 arah secara *real-time* dengan seluruh modul fitur.

---

## 🔐 Sistem Autentikasi & Akun Demo untuk Juri

TakarSehat mengimplementasikan autentikasi JWT modern berbasis **`HttpOnly` Cookie** (library `jose`) dengan parameter keamanan tinggi:
- `httpOnly: true` (kebal dari pencurian token via skrip XSS di browser).
- `sameSite: "lax"` (mitigasi serangan CSRF).
- `secure: true` (otomatis aktif pada lingkungan produksi HTTPS).
- Otorisasi ketat di seluruh endpoint API: data milik setiap pengguna terisolasi penuh.

### ⚡ Akses Cepat Akun Demo (1-Klik untuk Juri):
Pada halaman login ([`/login`](http://localhost:3000/login)), tersedia kotak khusus:
👉 **"🚀 1-Klik Masuk sebagai Akun Demo"**

- **Email**: `demo@takarsehat.id`
- **Kata Sandi**: `Password123!`
- **Data Contoh Bawaan**:
  - 2 jadwal obat aktif (Amlodipine 5mg & Metformin 500mg) dengan log hari ini.
  - Riwayat keluhan gejala dengan rujukan kondisi Hipertensi.
  - Progres pola hidup 3 dari 5 kebiasaan sehat telah terpenuhi.

---

## 📂 Struktur Folder Proyek

```text
TakarSehat/
├── prisma/
│   ├── schema.prisma             # Skema 8 tabel, relasi, indeks, & unique constraint
│   └── seed.ts                   # Seeder idempotent data medis, habit, artikel, & akun demo
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # REST API Route Handlers
│   │   │   ├── articles/         # GET filter & pencarian artikel
│   │   │   ├── auth/             # register, login, logout, me
│   │   │   ├── dashboard/        # GET agregasi ringkasan harian
│   │   │   ├── habits/           # GET daftar panduan & status log harian
│   │   │   │   └── log/          # POST toggle / simpan log kebiasaan
│   │   │   ├── medications/      # GET daftar obat, POST obat baru
│   │   │   │   ├── [id]/         # PUT edit obat, DELETE hapus obat
│   │   │   │   └── log/          # POST aksi cepat status minum obat
│   │   │   └── symptoms/         # GET riwayat, POST pencocokan gejala, DELETE
│   │   ├── artikel/              # Halaman katalog artikel & detail [slug]
│   │   ├── dashboard/            # Halaman Dashboard Ringkasan Hari Ini
│   │   ├── gejala/               # Halaman Catat Gejala & Rekomendasi Kondisi
│   │   ├── obat/                 # Halaman Cek Obat & Kepatuhan Jadwal
│   │   ├── pola-hidup/           # Halaman Takar Pola Hidup Harian
│   │   ├── login/                # Halaman Masuk & 1-Klik Demo Juri
│   │   ├── register/             # Halaman Pendaftaran Akun Baru
│   │   ├── globals.css           # Styling Tailwind CSS
│   │   ├── layout.tsx            # Root Layout & Metadata SEO
│   │   ├── not-found.tsx         # Halaman 404 Kustom Berstandar Brand
│   │   ├── error.tsx             # Error Boundary Klien
│   │   └── page.tsx              # Landing Page Utama
│   ├── components/               # Komponen Modular & Reusable
│   │   ├── Navbar.tsx            # Navigasi sticky responsif dengan status user
│   │   └── ui/                   # Button, Card, Badge, Input
│   ├── lib/                      # Layer Utilitas & Konfigurasi
│   │   ├── auth.ts               # JWT jose session, bcrypt hashing, cookie manager
│   │   ├── db.ts                 # Singleton Prisma Client (anti-connection leak)
│   │   └── validation.ts         # Skema validasi Zod untuk seluruh entitas
│   └── types/                    # Definisi tipe global TypeScript
│       └── index.ts
├── .env.example                  # Template variabel lingkungan
├── next.config.ts                # Konfigurasi Next.js (Webpack build engine)
├── package.json                  # Dependensi pustaka & skrip database
├── postcss.config.js             # Konfigurasi PostCSS Tailwind
├── tailwind.config.ts            # Konfigurasi palet warna brand TakarSehat
├── tsconfig.json                 # Konfigurasi TypeScript & path alias (@/*)
└── README.md                     # Dokumentasi panduan lengkap
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
- **Node.js** v18.18+ atau v20+
- **npm** (atau yarn / pnpm)
- **PostgreSQL Database** (Bisa lokal, Docker, atau Cloud seperti Neon DB / Supabase)

### 2. Kloning Repositori
```bash
git clone <url-repo-anda>
cd TakarSehat
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Variabel Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi PostgreSQL pada file `.env`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_o1eMG4cIrXUZ@ep-cold-boat-aoovoh4x-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="takarsehat-jwt-secret-key-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Sinkronisasi Skema Database
```bash
npx prisma db push
```

### 6. Eksekusi Database Seeding (Idempotent)
Isi database dengan data awal medis, panduan pola hidup, artikel terpercaya, dan akun demo:
```bash
npm run db:seed
```

### 7. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## 👨‍⚖️ Panduan Singkat Pengujian Fitur (Untuk Juri / Penguji)

| Langkah | Aksi Pengujian | Hasil yang Diharapkan |
|---|---|---|
| **1. Autentikasi** | Buka `/login` dan klik tombol **"🚀 1-Klik Masuk sebagai Akun Demo"**. | Langsung login sebagai Budi Sehat dan diarahkan ke Dashboard. |
| **2. Dashboard** | Periksa kartu metrik obat, pola hidup, gejala, dan cuplikan artikel. | Data ringkasan tampil padu dan sinkron. |
| **3. Aksi Cepat Obat** | Pada jadwal obat di Dashboard atau `/obat`, klik tombol **"✓ Sudah Minum"** atau **"✕ Lewati"**. | Status dan persentase kepatuhan langsung berubah seketika (*real-time*). |
| **4. Tambah Obat** | Masuk ke menu **"Cek Obat"** (`/obat`), klik **"+ Tambah Obat Baru"**. | Form tervalidasi dan obat baru langsung masuk ke jadwal aktif. |
| **5. Catat Gejala** | Buka menu **"Catat Gejala"** (`/gejala`), klik beberapa gejala (misal: *Sakit kepala bagian belakang*). | Panel kanan langsung mencocokkan kondisi rujukan (*Hipertensi*), tanda awal, dan red flags. Simpan untuk masuk ke riwayat. |
| **6. Takar Pola Hidup** | Buka menu **"Takar Pola Hidup"** (`/pola-hidup`), centang kebiasaan dan isi catatan porsi. | Status tersimpan dan progress bar capaian harian terupdate. |
| **7. Artikel Medis** | Buka menu **"Artikel"** (`/artikel`), coba fitur cari kata kunci atau filter kategori. Klik artikel untuk membaca detail. | Menampilkan isi artikel, sumber rujukan resmi, dan rekomendasi artikel terkait. |

---

## 🛠️ Perintah Berguna Lainnya

| Perintah | Fungsi |
|---|---|
| `npm run build` | Melakukan build produksi (*0 error, 15 rute terkompilasi*) |
| `npm run start` | Menjalankan server aplikasi pada mode produksi |
| `npx prisma studio` | Membuka antarmuka GUI visual untuk mengecek isi tabel database |
| `npm run db:seed` | Menjalankan ulang seeder data awal tanpa khawatir duplikasi |

---

## 📄 Lisensi & Hak Cipta
Dibuat dengan ❤️ untuk mendukung kesehatan dan literasi medis masyarakat Indonesia.  
© 2026 **TakarSehat**. All rights reserved.
