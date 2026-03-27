import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/auth/session";

export type RequireUserResult = SessionUser | NextResponse;

export function requireUser(): RequireUserResult {
  const user = getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

