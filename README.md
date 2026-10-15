# SAGI 127 - AUX & Agent Monitoring System

Aplikasi monitoring AUX dan status real-time untuk contact center SAGI 127 (Inbound & Outbound) berbasis Vite, React, Tailwind CSS, dan Firebase Firestore.

## 🚀 Fitur Utama
- **Role-based Authentication**: Hak akses spesifik untuk Admin, Supervisor (SPV), dan Agent.
- **Real-time AUX Tracking**: Pelacakan status AUX (Istirahat, Sholat, Briefing, Toilet, Coaching, dll.) secara langsung.
- **Roster & Penjadwalan**: Manajemen 90+ staf dan agen contact center dengan status shift.
- **Peringatan & Alarm AUX**: Indikator durasi AUX dan peringatan batas waktu.
- **Penyimpanan Cloud Real-time**: Didukung Google Cloud Firestore dengan sinkronisasi instan antar perangkat.

## 🌐 Deploy ke Vercel (vercel.app)

Proyek ini telah dikonfigurasi lengkap dengan file `vercel.json` sehingga dapat langsung dideploy ke Vercel tanpa perlu pengaturan rumit.

Untuk panduan lengkap langkah demi langkah:
👉 **[Lihat Panduan Deploy Vercel (DEPLOY_VERCEL.md)](./DEPLOY_VERCEL.md)**

### Langkah Cepat:
1. Push repository ini ke GitHub.
2. Buka [Vercel](https://vercel.com) > **"Add New Project"** > Import repository ini.
3. Klik **"Deploy"** (pengaturan build `Vite`, output `dist`, dan SPA rewrites sudah terkonfigurasi otomatis).

## 🛠️ Pengembangan Lokal

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```
