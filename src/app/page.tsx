import Link from "next/link";
import { BookOpenText, BrainCircuit, Zap, MessageSquareQuote } from "lucide-react";

export default function Home() {
  // Array features sekarang sudah ditambahkan icon
  const features = [
    { id: 1, icon: BookOpenText, title: "Ringkasan", desc: "Dapatkan ringkasan instan & poin penting dari materi." },
    { id: 2, icon: BrainCircuit, title: "Quiz Otomatis", desc: "Uji pemahamanmu dengan soal." },
    { id: 3, icon: Zap, title: "Flashcard", desc: "Fitur flip card interaktif untuk hafalan cepat." },
    { id: 4, icon: MessageSquareQuote, title: "AI Chat", desc: "Tanya jawab cerdas berbasis dokumen yang kamu upload." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background Decoration (Subtle Glow) */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 backdrop-blur-sm transition-colors hover:bg-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Study Companion Dengan AI
          </div>

          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Belajar Lebih Pintar dengan <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI Study Assistant
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-foreground/70 sm:text-lg lg:text-xl">
            Upload materi PDF atau teks, dan biarkan AI menyusun ringkasan, membuat kuis, flashcard, hingga menemani sesi tanya jawab belajarmu secara personal.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95 sm:w-auto"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:scale-105 active:scale-95 sm:w-auto"
            >
              Sudah punya akun? Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              {/* Bagian Icon Lucide */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-3 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              
              {/* Bagian Teks */}
              <div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}