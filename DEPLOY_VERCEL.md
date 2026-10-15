# Panduan Lengkap Deploy SAGI 127 AUX ke Vercel (vercel.app)

Aplikasi **SAGI 127 Contact Center AUX & Agent Monitoring** telah dikonfigurasi penuh dan siap dideploy langsung ke **Vercel** (`https://<nama-aplikasi>.vercel.app`).

---

## 🚀 Opsi 1: Deploy Melalui GitHub & Dashboard Vercel (Sangat Direkomendasikan)

Metode ini paling mudah dan otomatis ter-update setiap kali ada perubahan kode.

### Langkah 1: Push Kode ke GitHub
1. Pastikan seluruh file proyek di-push ke repository GitHub Anda (misalnya `sagi127-aux-monitoring`).
2. Pastikan file `vercel.json` dan `firebase-applet-config.json` ikut ter-commit di repository.

### Langkah 2: Hubungkan ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Di dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repository GitHub Anda (`sagi127-aux-monitoring`) dan klik tombol **"Import"**.

### Langkah 3: Verifikasi Konfigurasi Project
Vercel akan otomatis mengenali pengaturan dari file `vercel.json`:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Langkah 4: Environment Variables (Opsional)
> **Catatan:** Aplikasi ini sudah dilengkapi pembacaan langsung dari file `firebase-applet-config.json` yang ada di root direktori. Namun jika Anda ingin menyimpannya di panel Vercel (*Settings -> Environment Variables*), masukkan variabel berikut:

| Key | Value |
|---|---|
| `VITE_FIREBASE_PROJECT_ID` | `winged-pilot-8v7sv` |
| `VITE_FIREBASE_APP_ID` | `1:537380446129:web:10c80dde310c9e412d6790` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBm8rFb_O6y1__B_zcuz7oAaj4aonbmnB8` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `winged-pilot-8v7sv.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_ID` | `ai-studio-sagi127auxagentm-46ae49db-d72f-4a09-9588-581bd5e16571` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `winged-pilot-8v7sv.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `537380446129` |

### Langkah 5: Klik "Deploy"
1. Klik tombol **"Deploy"**.
2. Proses build memakan waktu sekitar ~30-60 detik.
3. Setelah selesai, Anda akan mendapatkan URL publik seperti `https://sagi127-aux-monitoring.vercel.app`! 🎉

---

## ⚡ Opsi 2: Deploy Cepat Menggunakan Vercel CLI

Jika Anda terbiasa menggunakan terminal:

1. Pastikan Node.js sudah terinstal di komputer Anda.
2. Buka terminal di folder proyek ini dan jalankan:
   ```bash
   npx vercel
   ```
3. Ikuti instruksi interaktif:
   - *Set up and deploy?* Ketik **Y** lalu tekan Enter.
   - *Which scope?* Pilih akun Vercel Anda.
   - *Link to existing project?* Ketik **N** (jika baru pertama kali).
   - *What's your project's name?* Beri nama misalnya: `sagi127-aux`
   - *In which directory is your code located?* Tekan Enter (`./`).
   - *Want to modify settings?* Ketik **N** (file `vercel.json` sudah mengatur otomatis).
4. Untuk deploy ke domain production utama:
   ```bash
   npx vercel --prod
   ```

---

## 📄 File Konfigurasi Vercel (`vercel.json`)

File `vercel.json` di root direktori telah dikonfigurasi untuk:
1. **SPA Rewrites**: Mencegah error 404 saat pengguna melakukan refresh browser di URL selain root (misalnya reload halaman saat sedang di dashboard).
2. **Caching Static Assets**: Mempercepat loading file CSS dan JS bundle dengan header cache `immutable`.
3. **Clean URLs**: Menyajikan URL yang bersih tanpa ekstensi file.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🔐 Akun Default untuk Login Pertama Kali

Setelah aplikasi online di Vercel, Anda dapat langsung login menggunakan:

- **Admin**:
  - ID / Username: `ADMIN` atau `admin`
  - PIN Default: `127127`
- **Supervisor (SPV)**:
  - ID / NIK: NIK SPV (misal: `1001` atau NIK dari daftar roster)
  - PIN Default: `127127`
- **Agent**:
  - ID / NIK: NIK Agent dari 90+ roster yang tersedia (misal: `01127`, `02127`, dst.)
  - PIN Default: `127127`

