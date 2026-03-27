import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fullstack study companion dengan AI
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            AI Study Assistant
          </h1>

          <p className="max-w-2xl text-pretty text-lg text-foreground/80">
            Upload materi (PDF/text), dapatkan ringkasan otomatis, quiz, flashcard,
            dan tanya jawab AI berbasis konten kamu.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-foreground px-5 py-3 text-background hover:opacity-90"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-foreground hover:bg-white/10"
            >
              Buat Akun
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Ringkasan", desc: "Ringkasan + poin penting dari materi." },
              { title: "Quiz", desc: "5 soal pilihan ganda otomatis." },
              { title: "Flashcard", desc: "Flip card untuk latihan cepat." },
              { title: "AI Chat", desc: "Tanya jawab berbasis konten kamu." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="font-medium">{f.title}</div>
                <div className="mt-1 text-sm text-foreground/80">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
