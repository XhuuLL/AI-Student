"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/utils/apiClient";
import { Spinner } from "@/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/api/auth/register", {
        name,
        email,
        password,
      });
      if (res.status === 201 || res.status === 200) router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Buat akun untuk memulai belajar.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <label className="block text-sm font-medium">Nama</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            required
            autoComplete="name"
          />

          <label className="mt-4 block text-sm font-medium">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />

          <label className="mt-4 block text-sm font-medium">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 outline-none focus:border-white/25"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="new-password"
          />

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-background hover:opacity-90 disabled:opacity-70"
          >
            {loading ? <Spinner /> : null}
            {loading ? "Memproses..." : "Buat Akun"}
          </button>

          <div className="mt-4 text-center text-sm text-foreground/70">
            Sudah punya akun?{" "}
            <a className="underline" href="/login">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

