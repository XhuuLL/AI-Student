# 🎓 AI Study Assistant

**AI Study Assistant** adalah platform e-learning cerdas berbasis *Artificial Intelligence* (AI) yang dirancang untuk membantu mahasiswa dan pelajar memahami materi perkuliahan dengan lebih cepat, interaktif, dan terstruktur. Cukup upload materi Anda, dan biarkan AI yang mengurus sisanya!

## 📸 Preview Aplikasi

Berikut adalah tampilan antarmuka halaman utama **AI Study Assistant** 

<img src="/public/preview.png" width="100%" alt="Preview Halaman Utama AI Study Assistant"/>

---

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan modul AI komprehensif untuk mendukung proses belajar:

* 📄 **Smart Document Processing:** Upload materi dalam format PDF atau TXT.
* ✨ **AI Summary & Key Points:** Dapatkan ringkasan materi mendalam (3-4 paragraf) beserta poin-poin kunci (HOTS).
    * 🔊 *Text-to-Speech:* Dengarkan ringkasan materi secara otomatis.
    * 📥 *Export to PDF:* Unduh ringkasan dalam format PDF yang rapi, elegan, dan siap cetak.
* 🧠 **Ujian Interaktif (Pilgan):** Kerjakan 10 soal pilihan ganda yang di-generate oleh AI langsung di dalam aplikasi, lengkap dengan *auto-grading* (penilaian otomatis) dan deteksi jawaban benar/salah.
* 📝 **Evaluasi Tugas Essay:** AI bertindak sebagai asisten dosen. Unduh soal essay tingkat lanjut, kerjakan, lalu upload file jawaban Anda (.pdf/.docx) untuk mendapatkan nilai (0-100) dan *feedback* analitis dari AI.
* 💬 **Context-Aware AI Chat:** Tanya jawab langsung dengan AI yang konteksnya sudah dibatasi secara spesifik pada dokumen materi yang Anda pelajari.
* 🎨 **Modern UI/UX:** Tampilan *Glassmorphism*, Dark/Light Mode otomatis, tata letak responsif, dan animasi transisi yang mulus.
* 🔒 **Keamanan & Autentikasi:** Sistem Login/Register dengan perlindungan rute (*Middleware Route Protection*) yang memisahkan halaman publik dan *Dashboard* eksklusif.

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan teknologi web modern:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Bahasa:** TypeScript
* **Styling:** Tailwind CSS + Lucide React (Icons)
* **AI Engine:** Google Gemini API (`gemini-1.5-flash` model)
* **Database:** MongoDB (Mongoose ORM)
* **PDF Generation:** `pdfkit`
* **PDF Parsing:** `pdf-parse`

## 🚀 Panduan Instalasi (Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di komputer lokal Anda.

### Prasyarat
* Node.js (versi 18.x atau terbaru)
* Akun MongoDB Atlas (atau MongoDB lokal)
* API Key dari [Google AI Studio](https://aistudio.google.com/app/apikey)

### Langkah-langkah

1. **Clone Repositori**
   ```bash
   git clone https://github.com/XhuuLL/AI-Student.git
   cd ai-study-assistant
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env.local` di root direktori proyek dan tambahkan variabel berikut:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster...
   
   # Autentikasi (Contoh)
   JWT_SECRET=rahasia_super_aman_anda
   
   # AI API Key
   GEMINI_API_KEY=masukkan_api_key_google_gemini_anda_di_sini
   GEMINI_MODEL=gemini-1.5-flash
   ```

4. **Konfigurasi Build (Penting untuk PDF)**
   Pastikan `next.config.mjs` Anda sudah diatur untuk mengecualikan modul PDF:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       serverComponentsExternalPackages: ["pdf-parse", "pdfkit"],
     },
   };
   export default nextConfig;
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi sekarang dapat diakses melalui `http://localhost:3000`.

## 📂 Struktur Direktori Utama

* `/src/app`: Berisi struktur *routing* Next.js (Home, Dashboard, Chat, dll).
* `/src/app/api`: Rute API Backend (Autentikasi, Generate AI, Export PDF, dll).
* `/src/components`: Komponen UI modular yang dapat digunakan kembali (Navbar, FlipCard, DarkModeToggle).
* `/src/lib`: Konfigurasi *library* inti (Koneksi MongoDB, Prompt AI, Utils).
* `/public`: Aset statis seperti gambar dan *font* khusus PDF (`Inter-Regular.ttf`).

## 👥 Pengembang (Credits)

Aplikasi ini dirancang dan dikembangkan untuk mendukung ekosistem pendidikan digital.