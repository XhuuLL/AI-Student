"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/api/auth/login", { email, password });
      if (res.status === 200) router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="w-full max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Selamat Datang</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Masuk ke akunmu untuk melanjutkan belajar.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {/* Input Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/90">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-foreground/40 focus:border-emerald-500/50 focus:bg-transparent focus:ring-1 focus:ring-emerald-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Masukkan Email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground/90">Password</label>
              <div className="relative">
                {/* Icon Gembok di Kiri */}
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/50" />
                
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm outline-none transition-all placeholder:text-foreground/40 focus:border-emerald-500/50 focus:bg-transparent focus:ring-1 focus:ring-emerald-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // TYPE BERUBAH TERGANTUNG STATE
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />

                {/* Tombol Show/Hide di Kanan */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:bg-foreground/90 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
            >
              {loading ? <Spinner /> : <LogIn className="h-5 w-5" />}
              {loading ? "Memproses..." : "Masuk"}
            </button>

            {/* Link to Register */}
            <div className="mt-2 text-center text-sm text-foreground/70">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-emerald-400 hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}