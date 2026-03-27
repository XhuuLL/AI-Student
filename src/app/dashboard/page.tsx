"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { FlipCard } from "@/components/FlipCard";

type MaterialDto = {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  summary: string;
  keyPoints: string[];
};

type QuizQuestion = { question: string; options: string[]; answer: string };
type FlashcardItem = { question: string; answer: string };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<MaterialDto[]>([]);
  const [stats, setStats] = useState({
    materialsCount: 0,
    quizzesCount: 0,
    flashcardsCount: 0,
    bookmarksCount: 0,
    avgProgress: 0,
  });

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [quizLoading, setQuizLoading] = useState<Record<string, boolean>>({});
  const [flashLoading, setFlashLoading] = useState<Record<string, boolean>>({});

  const [quizByMaterial, setQuizByMaterial] = useState<Record<string, QuizQuestion[]>>({});
  const [flashByMaterial, setFlashByMaterial] = useState<Record<string, FlashcardItem[]>>({});

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [progressByMaterial, setProgressByMaterial] = useState<Record<string, number>>({});

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [search, from, to, page, pageSize]);

  async function load() {
    setLoading(true);
    try {
      const [materialsRes, statsRes, bookmarksRes] = await Promise.all([
        apiClient.get(`/api/materials${queryString ? `?${queryString}` : ""}`),
        apiClient.get("/api/dashboard/stats"),
        apiClient.get("/api/materials/bookmark"),
      ]);
      setMaterials(materialsRes.data.materials);
      setTotalPages(materialsRes.data.pagination?.totalPages ?? 1);
      setStats(statsRes.data);
      setBookmarkedIds(new Set(bookmarksRes.data.materialIds ?? []));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  function toggleBookmark(id: string) {
    const current = bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (current) next.delete(id);
      else next.add(id);
      return next;
    });
    apiClient
      .post("/api/materials/bookmark", { materialId: id, bookmarked: !current })
      .catch(() => {
        // jika gagal, rollback state sederhana
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (current) next.add(id);
          else next.delete(id);
          return next;
        });
      });
  }

  function updateProgressLocal(id: string, percent: number) {
    setProgressByMaterial((prev) => ({ ...prev, [id]: percent }));
  }

  async function setProgress(id: string, percent: number) {
    updateProgressLocal(id, percent);
    try {
      await apiClient.post("/api/progress", { materialId: id, percent });
    } catch {
      // abaikan error kecil, UI tetap di angka terakhir
    }
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "id-ID";
    window.speechSynthesis.speak(utter);
  }

  function exportPdf(id: string) {
    const url = `/api/export/pdf?materialId=${encodeURIComponent(id)}`;
    window.open(url, "_blank");
  }

  async function generateSummary(materialId: string) {
    setSummaryLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/summary", { materialId });
      const { summary, keyPoints } = res.data;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === materialId ? { ...m, summary, keyPoints: keyPoints ?? [] } : m
        )
      );
    } finally {
      setSummaryLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  async function generateQuiz(materialId: string) {
    setQuizLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/quiz", { materialId });
      setQuizByMaterial((prev) => ({ ...prev, [materialId]: res.data.questions ?? [] }));
    } finally {
      setQuizLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  async function generateFlash(materialId: string) {
    setFlashLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/flashcard", { materialId });
      setFlashByMaterial((prev) => ({ ...prev, [materialId]: res.data.cards ?? [] }));
    } finally {
      setFlashLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Kelola materi, generate ringkasan/quiz/flashcard, lalu chat berbasis konten.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-foreground/70">Jumlah materi</div>
            <div className="mt-1 text-3xl font-semibold">{stats.materialsCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-foreground/70">Jumlah quiz</div>
            <div className="mt-1 text-3xl font-semibold">{stats.quizzesCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-foreground/70">Jumlah flashcard</div>
            <div className="mt-1 text-3xl font-semibold">{stats.flashcardsCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-foreground/70">Bookmark</div>
            <div className="mt-1 text-3xl font-semibold">{stats.bookmarksCount ?? 0}</div>
            <div className="mt-1 text-xs text-foreground/60">
              Rata-rata progress: {Math.round(stats.avgProgress ?? 0)}%
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Search judul</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mis. Biologi"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dari</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sampai</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/upload"
                className="rounded-xl bg-foreground px-4 py-3 text-background hover:opacity-90"
              >
                Upload Materi
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="text-lg font-medium">Belum ada materi</div>
            <div className="mt-2 text-sm text-foreground/70">
              Upload PDF atau TXT untuk mulai.
            </div>
            <div className="mt-6">
              <Link
                href="/upload"
                className="rounded-xl bg-foreground px-4 py-3 text-background hover:opacity-90"
              >
                Upload Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {materials.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-foreground/70">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1 text-lg font-semibold">{m.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(m.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        bookmarkedIds.has(m.id)
                          ? "border-yellow-400/50 bg-yellow-400/20 text-yellow-100"
                          : "border-white/10 bg-white/5 text-foreground/80"
                      }`}
                    >
                      {bookmarkedIds.has(m.id) ? "★ Bookmarked" : "☆ Bookmark"}
                    </button>
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                    >
                      Buka File
                    </a>
                  </div>
                </div>

                {m.summary ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-medium">Ringkasan</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                      {m.summary}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/70">
                      <button
                        type="button"
                        onClick={() => speak(m.summary)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                      >
                        Dengarkan (TTS)
                      </button>
                      <button
                        type="button"
                        onClick={() => exportPdf(m.id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                      >
                        Export PDF
                      </button>
                    </div>
                    {m.keyPoints?.length ? (
                      <div className="mt-3 text-sm text-foreground/70">
                        <div className="font-medium text-foreground">Poin penting</div>
                        <ul className="mt-2 list-disc pl-5">
                          {m.keyPoints.slice(0, 6).map((kp) => (
                            <li key={kp} className="mt-1">
                              {kp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-foreground/70">
                    Ringkasan belum tersedia.
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!summaryLoading[m.id]}
                    onClick={() => generateSummary(m.id)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
                  >
                    {summaryLoading[m.id] ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" /> Generating...
                      </span>
                    ) : (
                      "Generate Ringkasan"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!quizLoading[m.id]}
                    onClick={() => generateQuiz(m.id)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
                  >
                    {quizLoading[m.id] ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" /> Generating...
                      </span>
                    ) : (
                      "Generate Quiz"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!!flashLoading[m.id]}
                    onClick={() => generateFlash(m.id)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
                  >
                    {flashLoading[m.id] ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="h-4 w-4" /> Generating...
                      </span>
                    ) : (
                      "Generate Flashcards"
                    )}
                  </button>

                  <Link
                    href={`/chat?materialId=${m.id}`}
                    className="rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
                  >
                    Chat
                  </Link>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-foreground/70">
                    <span>Progress belajar</span>
                    <span>{progressByMaterial[m.id] ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progressByMaterial[m.id] ?? 0}
                    onChange={(e) =>
                      updateProgressLocal(m.id, Number(e.target.value) || 0)
                    }
                    onBlur={(e) =>
                      setProgress(m.id, Number(e.target.value) || 0)
                    }
                    className="mt-2 w-full accent-foreground"
                  />
                </div>

                {quizByMaterial[m.id]?.length ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-medium">Quiz (5 soal)</div>
                    <div className="mt-3 space-y-3">
                      {quizByMaterial[m.id].map((q, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-sm font-medium">{idx + 1}. {q.question}</div>
                          <ul className="mt-2 list-none space-y-1 text-sm text-foreground/80">
                            {q.options.map((opt, i) => (
                              <li key={opt}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 text-xs text-foreground/60">
                            Jawaban benar: {q.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {flashByMaterial[m.id]?.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-medium">Flashcards</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {flashByMaterial[m.id].slice(0, 8).map((card, idx) => (
                        <FlipCard key={idx} front={card.question} back={card.answer} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {!loading && materials.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-foreground/80">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Halaman {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

