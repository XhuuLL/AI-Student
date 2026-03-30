"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { UploadCloud, FileText, Type, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function defaultTitleFromFile(f: File) {
    const name = f.name.replace(/\.[^/.]+$/, "");
    setTitle(name);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Pilih file PDF atau TXT dulu.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".pdf") && !ext.endsWith(".txt")) {
      setError("Hanya mendukung PDF atau TXT.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());

      await apiClient.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Upload gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="w-full max-w-xl">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/60 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Upload Materi Baru</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Biarkan AI mengekstrak teks dari dokumenmu untuk diolah menjadi ringkasan, quiz, dan flashcard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            
            {/* Custom Dropzone File Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/90">Pilih Dokumen</label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 py-10 transition-all hover:border-emerald-500/50 hover:bg-white/10">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-emerald-500/10 p-4 text-emerald-400 transition-transform group-hover:scale-110 group-hover:bg-emerald-500/20">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="mb-1 text-sm text-foreground/80">
                    <span className="font-semibold text-emerald-400">Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className="text-xs text-foreground/50">PDF atau TXT (Maks. 5MB)</p>
                </div>
                {/* Hidden actual file input */}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (f) defaultTitleFromFile(f);
                  }}
                />
              </label>

              {/* Selected File Preview */}
              {file && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate text-sm font-semibold">{file.name}</div>
                    <div className="text-xs text-foreground/60">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/90">
                Judul Materi <span className="text-foreground/50">(Opsional)</span>
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-foreground/40 focus:border-emerald-500/50 focus:bg-transparent focus:ring-1 focus:ring-emerald-500/50"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan Judul Materi"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading || !file}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:bg-emerald-400 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? <Spinner /> : <UploadCloud className="h-5 w-5" />}
              {loading ? "Sedang Mengunggah & Memproses..." : "Upload Materi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}