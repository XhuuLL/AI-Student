"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";

type ChatMessageDto = { role: "user" | "assistant"; content: string };

export default function ChatClient({ materialId }: { materialId: string }) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!materialId) return;
      try {
        const res = await apiClient.get(
          `/api/chat?materialId=${encodeURIComponent(materialId)}`
        );
        setMessages(res.data.messages ?? []);
      } catch {
        setError("Gagal memuat riwayat chat.");
      }
    }
    load();
  }, [materialId]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!materialId) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/api/chat", {
        materialId,
        message: trimmed,
      });
      setMessages(res.data.messages ?? []);
      setMessage("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Chat gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">AI Chat</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Tanya jawab berbasis materi yang Anda pilih.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Kembali
        </Link>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <div className="max-h-[60vh] space-y-3 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          {messages.length === 0 ? (
            <div className="text-sm text-foreground/70">
              Belum ada pesan. Mulai tanya pertanyaan tentang materi.
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border border-white/10 px-4 py-3 text-sm ${
                  m.role === "user" ? "bg-background/60" : "bg-white/5"
                }`}
              >
                <div className="text-xs font-medium text-foreground/60">
                  {m.role === "user" ? "Anda" : "AI"}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-foreground/90">
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Spinner className="h-4 w-4" /> Menjawab...
            </div>
          ) : null}
        </div>

        <form onSubmit={onSend} className="flex gap-3">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-3 outline-none focus:border-white/25"
            placeholder="Tulis pertanyaan Anda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            disabled={loading || !materialId}
            className="rounded-xl bg-foreground px-4 py-3 text-background hover:opacity-90 disabled:opacity-70"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}

