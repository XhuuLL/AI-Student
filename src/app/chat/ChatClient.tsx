"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { Bot, User, Send, ArrowLeft, Sparkles } from "lucide-react";

type ChatMessageDto = { role: "user" | "assistant"; content: string };

export default function ChatClient({ materialId }: { materialId: string }) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref untuk fitur auto-scroll ke bawah
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
    
    // Tambahkan pesan user langsung ke UI agar terasa responsif
    const newMessages = [...messages, { role: "user", content: trimmed } as ChatMessageDto];
    setMessages(newMessages);
    setMessage("");

    try {
      const res = await apiClient.post("/api/chat", {
        materialId,
        message: trimmed,
      });
      // Update dengan response dari server
      setMessages(res.data.messages ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Chat gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col">
      {/* Background Effect */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[30rem] w-[100%] max-w-3xl -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="mx-auto flex w-full max-w-4xl flex-col flex-1 px-4 py-8 sm:px-6 h-[calc(100vh-4rem)]">
        
        {/* Header Chat */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70 transition-all hover:bg-white/10 hover:text-foreground active:scale-95"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                XhuuLL Asisten AI <Sparkles className="h-5 w-5 text-emerald-400" />
              </h1>
              <p className="text-xs text-foreground/50 sm:text-sm">
                Tanyakan apapun seputar materi yang Anda pilih.
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex flex-col flex-1 mt-6 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
              <Bot className="h-16 w-16 text-emerald-400 opacity-50" />
              <div className="max-w-xs">
                <p className="text-sm">Belum ada obrolan.</p>
                <p className="text-xs mt-1">Sapa XhuuLL atau tanyakan hal spesifik tentang materi Anda.</p>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div key={idx} className={`flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar */}
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border ${
                    isUser 
                      ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400" 
                      : "border-white/10 bg-white/5 text-foreground/70"
                  }`}>
                    {isUser ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>

                  {/* Bubble Chat */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-foreground/40 px-1">
                      {isUser ? "Anda" : "XhuuLL AI"}
                    </div>
                    <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                      isUser 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "border border-white/5 bg-white/5 text-foreground/90 rounded-tl-none backdrop-blur-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Loading Indicator AI */}
          {loading && (
            <div className="flex gap-3 sm:gap-4 flex-row animate-pulse">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex flex-col items-start">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-foreground/40 px-1">
                  XhuuLL AI
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-white/5 bg-white/5 px-5 py-4 backdrop-blur-sm">
                   <Spinner className="h-4 w-4 text-emerald-400" />
                   <span className="text-xs text-foreground/60 italic">Berpikir...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Sticky at bottom inside max-w) */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <form 
            onSubmit={onSend} 
            className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md transition-all focus-within:border-emerald-500/50 focus-within:bg-white/10"
          >
            <input
              className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-foreground/40"
              placeholder="Tanyakan sesuatu pada XhuuLL AI..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || !materialId}
            />
            <button
              disabled={loading || !materialId || !message.trim()}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black transition-all hover:bg-emerald-400 active:scale-95 disabled:pointer-events-none disabled:opacity-50 mr-1"
              title="Kirim Pesan"
            >
              {loading ? (
                <Spinner className="h-4 w-4 border-black" />
              ) : (
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              )}
            </button>
          </form>
          <div className="mt-2 text-center text-[10px] text-foreground/40">
            XhuuLL AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </div>
        </div>

      </div>
    </div>
  );
}