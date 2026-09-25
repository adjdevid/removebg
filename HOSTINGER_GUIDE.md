# 🚀 Panduan Deploy LatarKita AI ke Hostinger

Aplikasi kini menggunakan **Satu Mesin Pemotong: Remove.bg Cloud AI**, dengan kunci API yang aman disimpan di file environment server (`REMOVE_BG_API_KEY`).

---

## 📁 Keunggulan Arsitektur Saat Ini:
1. **0 MB Unduh Modul**: Pengunjung web Anda tidak perlu mengunduh file AI apa pun ke HP/laptop mereka.
2. **Kualitas Studio HD**: Menggunakan algoritma Remove.bg resmi untuk isolasi rambut halus dan produk e-commerce.
3. **Aman & Bersih**: Kunci API `REMOVE_BG_API_KEY` disimpan aman di server (tidak pernah terekspos di browser pengunjung).
4. **UI Super Bersih**: Tidak ada tombol setting yang rumit, tidak ada banner tips, langsung upload dan potong foto dalam 1 detik.

---

## 🔑 Konfigurasi Environment Variable:
Tambahkan baris berikut ke file `.env` di server Anda (atau di Environment Variables dashboard Vercel / Hostinger):
```env
REMOVE_BG_API_KEY="kunci_api_remove_bg_anda"
POLLINATIONS_API_KEY="kunci_api_pollinations_ai_anda"
GEMINI_API_KEY="kunci_api_gemini_anda"
```
*(Dapatkan kunci Remove.bg di [remove.bg/api](https://www.remove.bg/api), dan kunci Pollinations.ai di [enter.pollinations.ai](https://enter.pollinations.ai)).*

---

## 🛠️ Langkah-Langkah Deploy ke Hostinger Business Hosting

### Langkah 1: Buat Berkas Produksi (Build)
Jalankan perintah ini di terminal komputer Anda:
```bash
npm run build
```
Perintah ini akan secara otomatis:
- Menyalin semua bobot model AI ke folder `/public/model/`.
- Membangun aplikasi Vite yang ringkas dan teroptimasi ke dalam folder **`dist/`**.
- Menyertakan file `.htaccess` siap pakai di dalam folder `dist/`.

---

### Langkah 2: Upload ke hPanel Hostinger
1. Buka dashboard **Hostinger hPanel** Anda.
2. Masuk ke menu **Websites** > klik **Manage** pada nama domain Anda.
3. Buka **File Manager** (Manajer Berkas) > masuk ke folder **`public_html`**.
4. Hapus file `default.php` bawaan Hostinger (jika ada).
5. **Upload semua isi di dalam folder `dist`** ke dalam `public_html`:
   - `index.html`
   - `.htaccess` *(Pastikan file tersembunyi/dotfiles dicentang agar terlihat)*
   - folder `assets/`
   - folder `model/` *(berisi model AI mandiri)*

> 💡 **Tips Cepat:** Anda bisa mengompres folder `dist` menjadi `dist.zip` di komputer Anda, upload file `dist.zip` ke `public_html`, lalu klik kanan dan pilih **Extract**. Pindahkan isinya langsung ke `public_html`.

---

### Langkah 3: Selesai! 🎉
Buka domain Anda di browser (misalnya `https://domainanda.com`).
- Web Anda sekarang aktif sepenuhnya!
- Model AI berjalan mandiri di hosting Anda sendiri tanpa batas ukuran 50MB.
- Kecepatan pemotongan akan maksimal karena server Hostinger berada di Indonesia/Singapura dan memanfaatkan cache lokal browser pengguna.
