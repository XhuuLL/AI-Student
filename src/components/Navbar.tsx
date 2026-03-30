"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { apiClient } from "@/utils/apiClient";
import { GraduationCap, LayoutDashboard, UploadCloud, LogOut } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Daftar halaman yang TIDAK BOLEH ada Navbar-nya
  const publicPages = ["/", "/login", "/register"];
  if (publicPages.includes(pathname)) {
    return null;
  }

  async function logout() {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      // SETELAH LOGOUT, ARAHKAN KE HALAMAN UTAMA (HOME)
      router.push("/");
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: UploadCloud },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Kiri: Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 transition-all group-hover:bg-emerald-500 group-hover:text-black">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-wide text-foreground transition-colors hidden sm:inline-block">
              AI Study<span className="text-emerald-500">.</span>
            </span>
          </Link>

          {/* Navigasi Utama (ICON + TEKS) */}
          <nav className="flex items-center gap-2 ml-2 sm:ml-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "opacity-70"}`} />
                  {/* Teks dimunculkan kembali di sini */}
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Kanan: Actions */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <div className="hidden h-5 w-[1px] bg-white/10 sm:block" />
          
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="group flex h-10 w-10 sm:w-auto sm:px-4 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-foreground/80 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
          >
            <LogOut className="h-4 w-4 transition-transform sm:group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}