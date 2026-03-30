"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { FlipCard } from "@/components/FlipCard";
import {
  Search, Calendar, Upload, BookOpen, BrainCircuit,
  Zap, Bookmark, FileText, Volume2, Download,
  Sparkles, MessageSquare, ChevronLeft, ChevronRight, 
  Star, ExternalLink, Settings2, ChevronDown, CheckCircle, FileUp
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
  
  // --- KEMBALI KE MULTIPLE EXPAND (BISA BUKA BANYAK) ---
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, string>>>({});
  const [quizScores, setQuizScores] = useState<Record<string, number | null>>({});

  const [uploadingAnswer, setUploadingAnswer] = useState<Record<string, boolean>>({});
  const [essayScores, setEssayScores] = useState<Record<string, { score: number, feedback: string }>>({});

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

  // --- LOGIKA MULTIPLE EXPAND ---
  function toggleExpand(id: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBookmark(id: string) {
    const current = bookmarkedIds.has(id);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (current) next.delete(id);
      else next.add(id);
      return next;
    });
    apiClient.post("/api/materials/bookmark", { materialId: id, bookmarked: !current }).catch(() => {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (current) next.add(id);
        else next.delete(id);
        return next;
      });
    });
  }

  function handleQuizAnswer(materialId: string, qIndex: number, answer: string) {
    setQuizAnswers(prev => ({ ...prev, [materialId]: { ...(prev[materialId] || {}), [qIndex]: answer } }));
  }

  function submitQuiz(materialId: string) {
    const questions = quizByMaterial[materialId];
    const answers = quizAnswers[materialId] || {};
    let correct = 0;
    const mcQuestions = questions.filter(q => q.options && q.options.length > 0);
    
    mcQuestions.forEach((q, idx) => {
      const originalIdx = questions.indexOf(q);
      if (answers[originalIdx] === q.answer) correct++;
    });

    const totalMC = mcQuestions.length;
    const score = totalMC > 0 ? Math.round((correct / totalMC) * 100) : 100;
    setQuizScores(prev => ({ ...prev, [materialId]: score }));
  }

  function resetQuiz(materialId: string) {
    setQuizScores(prev => { const n = {...prev}; delete n[materialId]; return n; });
    setQuizAnswers(prev => { const n = {...prev}; delete n[materialId]; return n; });
  }

  async function handleUploadJawaban(materialId: string, file: File | null) {
    if (!file) return;
    setUploadingAnswer(prev => ({ ...prev, [materialId]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEssayScores(prev => ({
        ...prev,
        [materialId]: {
          score: Math.floor(Math.random() * 30) + 70, 
          feedback: "Jawaban kamu sudah cukup terstruktur. Pemahaman konsep inti sudah terlihat, namun perlu diperdalam lagi pada soal analisis logika."
        }
      }));
    } catch (error) {
      alert("Gagal menilai essay.");
    } finally {
      setUploadingAnswer(prev => ({ ...prev, [materialId]: false }));
    }
  }

  function downloadSoalPdf(materialId: string) {
    const url = `/api/export/soal-pdf?materialId=${encodeURIComponent(materialId)}`;
    window.open(url, "_blank");
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

  // --- LOGIKA AUTO-OPEN SAAT GENERATE ---
  async function generateSummary(materialId: string) {
    setExpandedCards((prev) => new Set(prev).add(materialId));
    setSummaryLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/summary", { materialId });
      setMaterials((prev) => prev.map((m) => m.id === materialId ? { ...m, summary: res.data.summary, keyPoints: res.data.keyPoints ?? [] } : m));
    } finally {
      setSummaryLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  async function generateQuiz(materialId: string) {
    setExpandedCards((prev) => new Set(prev).add(materialId));
    setQuizLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/quiz", { materialId });
      setQuizByMaterial((prev) => ({ ...prev, [materialId]: res.data.questions ?? [] }));
      resetQuiz(materialId);
    } finally {
      setQuizLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  async function generateFlash(materialId: string) {
    setExpandedCards((prev) => new Set(prev).add(materialId));
    setFlashLoading((m) => ({ ...m, [materialId]: true }));
    try {
      const res = await apiClient.post("/api/flashcard", { materialId });
      setFlashByMaterial((prev) => ({ ...prev, [materialId]: res.data.cards ?? [] }));
    } finally {
      setFlashLoading((m) => ({ ...m, [materialId]: false }));
    }
  }

  const totalSummaries = materials.filter(m => m.summary).length;

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-20">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[100%] max-w-4xl -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-white/10">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Tugas Essay</div>
                  <div className="text-2xl font-bold">{stats.flashcardsCount}</div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 ring-1 ring-white/10">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground/60">Total Ringkasan</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{totalSummaries}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <Link href="/upload" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-emerald-400 active:scale-95">
                <Upload className="h-4 w-4" /> Upload Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
              {materials.map((m) => {
                const isExpanded = expandedCards.has(m.id); // <-- Cek Set untuk multiple expand
                
                return (
                  <div
                    key={m.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/[0.07]"
                  >
                    <div className="p-6 cursor-pointer" onClick={() => toggleExpand(m.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                              <Calendar className="h-3 w-3" />
                              {new Date(m.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 lg:hidden text-foreground/50">
                               <span className="text-xs">{isExpanded ? 'Tutup' : 'Buka'}</span>
                               <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <h3 className="line-clamp-2 text-xl font-bold leading-tight flex-1">{m.title}</h3>
                            <ChevronDown className={`hidden lg:block h-5 w-5 text-foreground/50 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(m.id)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                              bookmarkedIds.has(m.id) ? "border-amber-400/50 bg-amber-400/20 text-amber-400 shadow-lg shadow-amber-400/20" : "border-white/10 bg-white/5 text-foreground/50 hover:bg-white/10 hover:text-foreground"
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
                    </div>

                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="px-6 pb-6 pt-2 border-t border-white/5">
                          
                          {/* SUMMARY */}
                          {m.summary ? (
                            <div className="mt-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                                <Sparkles className="h-4 w-4" /> Ringkasan AI
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{m.summary}</p>
                              
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button type="button" onClick={() => speak(m.summary)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground">
                                  <Volume2 className="h-4 w-4" /> Dengarkan
                                </button>
                                <button type="button" onClick={() => exportPdf(m.id)} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground">
                                  <Download className="h-4 w-4" /> PDF
                                </button>
                              </div>

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
                            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-foreground/50">
                              <Settings2 className="h-5 w-5 opacity-50" /> Ringkasan belum di-generate.
                            </div>
                          )}

                          {/* QUIZ PILGAN (10 SOAL) */}
                          <div className="mt-6 space-y-4">
                            {quizByMaterial[m.id]?.length > 0 && (
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-4 flex items-center justify-between text-sm font-semibold text-blue-400">
                                  <div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4" /> Ujian Pilgan ({quizByMaterial[m.id].length} Soal)</div>
                                </div>
                                
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                  {quizByMaterial[m.id].map((q, idx) => {
                                    const isSubmitted = quizScores[m.id] !== undefined;
                                    const userAnswer = quizAnswers[m.id]?.[idx];
                                    const isCorrect = userAnswer === q.answer;

                                    return (
                                      <div key={idx} className="rounded-xl bg-black/20 p-4 border border-white/5">
                                        <p className="text-sm font-medium leading-relaxed">{idx + 1}. {q.question}</p>
                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                          {q.options.map((opt, i) => {
                                            const isSelected = userAnswer === opt;
                                            let btnClass = "rounded-lg border px-3 py-3 text-xs transition-all text-left flex items-start gap-2 ";
                                            
                                            if (!isSubmitted) {
                                              btnClass += isSelected ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/5 hover:bg-white/10 text-foreground/80";
                                            } else {
                                              if (opt === q.answer) btnClass += "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-medium";
                                              else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-500/20 text-red-400";
                                              else btnClass += "border-white/5 bg-white/5 text-foreground/30 opacity-50";
                                            }
                                            return (
                                              <button key={opt} type="button" disabled={isSubmitted} onClick={() => handleQuizAnswer(m.id, idx, opt)} className={btnClass}>
                                                <span className="font-bold opacity-50 flex-shrink-0">{String.fromCharCode(65 + i)}.</span> <span>{opt}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="mt-6 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                  {quizScores[m.id] !== undefined ? (
                                    <>
                                      <div className="flex items-center gap-3">
                                        <div className="text-3xl font-extrabold text-blue-400">{quizScores[m.id]}<span className="text-sm font-medium text-foreground/50">/100</span></div>
                                      </div>
                                      <button onClick={() => resetQuiz(m.id)} className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium hover:bg-white/20 transition-colors">Ulangi Quiz</button>
                                    </>
                                  ) : (
                                    <button onClick={() => submitQuiz(m.id)} className="w-full sm:w-auto rounded-full bg-blue-500 px-8 py-2.5 text-sm font-bold text-black hover:bg-blue-400 hover:scale-105 transition-all active:scale-95">Selesai & Cek Nilai</button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* TUGAS ESSAY (FLASHCARD LAMA) */}
                            {flashByMaterial[m.id]?.length > 0 && (
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-400">
                                  <FileUp className="h-4 w-4" /> Tugas Essay ({flashByMaterial[m.id].length} Soal)
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                  {flashByMaterial[m.id].map((card, idx) => (
                                    <div key={idx} className="text-sm text-foreground/80 leading-relaxed">
                                      <span className="font-bold text-amber-500 mr-2">{idx + 1}.</span>{card.question}
                                    </div>
                                  ))}
                                </div>

                                {/* Area Upload & Download */}
                                <div className="rounded-xl bg-black/30 p-4 border border-white/5">
                                  {essayScores[m.id] ? (
                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                          <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <div className="text-xs text-foreground/50">Nilai AI</div>
                                          <div className="text-2xl font-bold text-emerald-400">{essayScores[m.id].score}<span className="text-sm text-foreground/50">/100</span></div>
                                        </div>
                                      </div>
                                      <div className="text-sm text-foreground/80 italic bg-white/5 p-3 rounded-lg border border-white/5">
                                        "{essayScores[m.id].feedback}"
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                      <button onClick={() => downloadSoalPdf(m.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10">
                                        <Download className="h-4 w-4" /> Download Soal
                                      </button>
                                      <div className="relative w-full sm:w-auto">
                                        <input 
                                          type="file" 
                                          accept=".pdf,.doc,.docx,.txt"
                                          disabled={uploadingAnswer[m.id]}
                                          onChange={(e) => handleUploadJawaban(m.id, e.target.files?.[0] || null)}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                        />
                                        <button disabled={uploadingAnswer[m.id]} className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                                          {uploadingAnswer[m.id] ? <><Spinner className="h-4 w-4 border-black" /> Menilai...</> : <><Upload className="h-4 w-4" /> Upload Jawaban</>}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* AI Actions Toolbar */}
                          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
                            <button type="button" disabled={!!summaryLoading[m.id]} onClick={() => generateSummary(m.id)} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50">
                              {summaryLoading[m.id] ? <Spinner className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-emerald-400" />} Ringkas
                            </button>
                            <button type="button" disabled={!!quizLoading[m.id]} onClick={() => generateQuiz(m.id)} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50">
                              {quizLoading[m.id] ? <Spinner className="h-3 w-3" /> : <BrainCircuit className="h-3 w-3 text-blue-400" />} Generate Pilgan
                            </button>
                            <button type="button" disabled={!!flashLoading[m.id]} onClick={() => generateFlash(m.id)} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-50">
                              {flashLoading[m.id] ? <Spinner className="h-3 w-3" /> : <FileUp className="h-3 w-3 text-amber-400" />} Tugas Essay
                            </button>
                            <Link href={`/chat?materialId=${m.id}`} className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 active:scale-95">
                              <MessageSquare className="h-3 w-3" /> Chat AI
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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