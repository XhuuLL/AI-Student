"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Upload Materi</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Upload file PDF atau TXT untuk diekstrak teksnya lalu disimpan ke database.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">Judul (opsional)</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ringkasan Biologi Bab 1"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">File (PDF/TXT, max 5MB)</label>
            <input
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-transparent px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm"
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f) defaultTitleFromFile(f);
              }}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-background hover:opacity-90 disabled:opacity-70"
          >
            {loading ? <Spinner /> : null}
            {loading ? "Mengunggah..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

