import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/chat/:path*"],
};

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    verifyJwt(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

