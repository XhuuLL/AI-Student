import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Ambil token/session dari cookies (Sesuaikan nama cookie dengan yang kamu pakai, misal 'token' atau 'session')
  const token = request.cookies.get("token")?.value || request.cookies.get("session")?.value;

  const { pathname } = request.nextUrl;

  // 2. Daftar rute yang butuh login
  const protectedRoutes = ["/dashboard", "/upload", "/chat"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 3. Daftar rute publik (auth)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // LOGIKA 1: Kalau dia mau akses Dashboard TAPI belum punya token login
  if (isProtectedRoute && !token) {
    // Lempar ke halaman login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // LOGIKA 2: Kalau dia sudah login, TAPI iseng buka halaman Login/Register
  if (isAuthRoute && token) {
    // Arahkan kembali ke Dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang akan dicek oleh middleware ini
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/upload/:path*", 
    "/chat/:path*",
    "/login", 
    "/register"
  ],
};