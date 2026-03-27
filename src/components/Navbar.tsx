"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { apiClient } from "@/utils/apiClient";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => (pathname === href ? "bg-white/10" : "");

  async function logout() {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      router.push("/login");
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">
            AI Study Assistant
          </Link>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/dashboard"
            className={`rounded-xl px-3 py-2 text-sm hover:bg-white/10 ${isActive("/dashboard")}`}
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className={`rounded-xl px-3 py-2 text-sm hover:bg-white/10 ${isActive("/upload")}`}
          >
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button
            type="button"
            onClick={logout}
            className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 md:inline-flex"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

