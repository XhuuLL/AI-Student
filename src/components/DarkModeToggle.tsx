"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react"; // <-- Import icon
export function DarkModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    setTheme(prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  // Render bulatan kosong sementara sebelum mode asli terdeteksi (mencegah UI berkedip)
  if (!mounted) {
    return <div className="h-10 w-10 rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-all hover:bg-black/10 hover:ring-1 hover:ring-emerald-500/50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-emerald-400 transition-transform group-hover:-rotate-12" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500 transition-transform group-hover:rotate-45" />
      )}
    </button>
  );
}