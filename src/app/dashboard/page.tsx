"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { FlipCard } from "@/components/FlipCard";
import {
  Search, Calendar, Upload, BookOpen, BrainCircuit,
  Zap, Bookmark, FileText, Volume2, Download,
  Sparkles, MessageSquare, ChevronLeft, ChevronRight, Star, ExternalLink, Settings2
} from "lucide-react";

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
      // abaikan error kecil
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
    <div className="relative min-h-screen bg-background text-foreground pb-20">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[100%] max-w-4xl -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard <span className="text-emerald-400">Belajar</span>
              </h1>
              <p className="mt-2 text-sm text-foreground/70 sm:text-base">
                Kelola materi, hasilkan ringkasan AI, dan mulai sesi tanyamu.
              </p>
            </div>            
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 ring-1 ring-white/10">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Total Materi</div>
                  <div className="text-2xl font-bold">{stats.materialsCount}</div>
                </div>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-white/10">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Total Quiz</div>
                  <div className="text-2xl font-bold">{stats.quizzesCount}</div>
                </div>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-white/10">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Flashcards</div>
                  <div className="text-2xl font-bold">{stats.flashcardsCount}</div>
                </div>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 ring-1 ring-white/10">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Bookmark</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.bookmarksCount ?? 0}</span>
                    <span className="text-xs text-foreground/50">Avg {Math.round(stats.avgProgress ?? 0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                <input
                  className="w-full rounded-2xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-foreground/40 hover:bg-white/5 focus:bg-white/5 focus:ring-1 focus:ring-emerald-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul materi..."
                />
              </div>
              <div className="hidden w-[1px] bg-white/10 md:block" />
              <div className="relative w-full md:w-48">
                <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                <input
                  type="date"
                  className="w-full rounded-2xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition-all hover:bg-white/5 focus:bg-white/5 focus:ring-1 focus:ring-emerald-500/50"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="hidden w-[1px] bg-white/10 md:block" />
              <div className="relative w-full md:w-48">
                <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
                <input
                  type="date"
                  className="w-full rounded-2xl bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition-all hover:bg-white/5 focus:bg-white/5 focus:ring-1 focus:ring-emerald-500/50"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Spinner className="h-8 w-8 text-emerald-400" />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold">Belum ada materi</h3>
              <p className="mt-2 max-w-sm text-sm text-foreground/70">
                Ruang belajarmu masih kosong. Upload PDF atau TXT pertamamu untuk mulai dibantu oleh AI.
              </p>
              <Link
                href="/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-emerald-400 active:scale-95"
              >
                <Upload className="h-4 w-4" />
                Upload Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-tight">{m.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(m.id)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                            bookmarkedIds.has(m.id)
                              ? "border-amber-400/50 bg-amber-400/20 text-amber-400 shadow-lg shadow-amber-400/20"
                              : "border-white/10 bg-white/5 text-foreground/50 hover:bg-white/10 hover:text-foreground"
                          }`}
                        >
                          <Star className={`h-5 w-5 ${bookmarkedIds.has(m.id) ? "fill-current" : ""}`} />
                        </button>
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-all hover:bg-white/10 hover:text-foreground"
                          title="Buka File Original"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs font-medium text-foreground/60">
                        <span>Progress Belajar</span>
                        <span className="text-emerald-400">{progressByMaterial[m.id] ?? 0}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={progressByMaterial[m.id] ?? 0}
                        onChange={(e) => updateProgressLocal(m.id, Number(e.target.value) || 0)}
                        onBlur={(e) => setProgress(m.id, Number(e.target.value) || 0)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-500 outline-none"
                      />
                    </div>

                    {/* Summary Section */}
                    {m.summary ? (
                      <div className="mt-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                          <Sparkles className="h-4 w-4" /> Ringkasan AI
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                          {m.summary}
                        </p>
                        
                        {/* Audio & PDF Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => speak(m.summary)}
                            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
                          >
                            <Volume2 className="h-4 w-4" /> Dengarkan
                          </button>
                          <button
                            type="button"
                            onClick={() => exportPdf(m.id)}
                            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
                          >
                            <Download className="h-4 w-4" /> PDF
                          </button>
                        </div>

                        {/* Key Points */}
                        {m.keyPoints?.length > 0 && (
                          <div className="mt-5">
                            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground/50">
                              Poin Kunci
                            </div>
                            <ul className="space-y-2">
                              {m.keyPoints.slice(0, 6).map((kp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                                  <span>{kp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-foreground/50">
                        <Settings2 className="h-5 w-5 opacity-50" />
                        Ringkasan belum di-generate.
                      </div>
                    )}
                  </div>

                  {/* Quizzes & Flashcards Render */}
                  <div className="mt-6 space-y-4">
                    {quizByMaterial[m.id]?.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-400">
                          <BrainCircuit className="h-4 w-4" /> Quiz ({quizByMaterial[m.id].length} Soal)
                        </div>
                        <div className="space-y-4">
                          {quizByMaterial[m.id].map((q, idx) => (
                            <div key={idx} className="rounded-xl bg-black/20 p-4">
                              <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {q.options.map((opt, i) => (
                                  <div key={opt} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-foreground/70">
                                    <span className="mr-2 font-bold text-foreground/40">{String.fromCharCode(65 + i)}.</span> {opt}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 inline-block rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                                Jawaban: {q.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {flashByMaterial[m.id]?.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-400">
                          <Zap className="h-4 w-4" /> Flashcards
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {flashByMaterial[m.id].slice(0, 8).map((card, idx) => (
                            <FlipCard key={idx} front={card.question} back={card.answer} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Actions Toolbar */}
                  <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      disabled={!!summaryLoading[m.id]}
                      onClick={() => generateSummary(m.id)}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
                    >
                      {summaryLoading[m.id] ? <Spinner className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-emerald-400" />}
                      Ringkas
                    </button>
                    <button
                      type="button"
                      disabled={!!quizLoading[m.id]}
                      onClick={() => generateQuiz(m.id)}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
                    >
                      {quizLoading[m.id] ? <Spinner className="h-3 w-3" /> : <BrainCircuit className="h-3 w-3 text-blue-400" />}
                      Quiz
                    </button>
                    <button
                      type="button"
                      disabled={!!flashLoading[m.id]}
                      onClick={() => generateFlash(m.id)}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
                    >
                      {flashLoading[m.id] ? <Spinner className="h-3 w-3" /> : <Zap className="h-3 w-3 text-amber-400" />}
                      Flashcard
                    </button>
                    <Link
                      href={`/chat?materialId=${m.id}`}
                      className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 active:scale-95"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat AI
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && materials.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium backdrop-blur-sm">
                Halaman {page} <span className="text-foreground/40">dari</span> {totalPages}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}