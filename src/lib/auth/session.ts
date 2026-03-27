import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";

export type SessionUser = {
  userId: string;
  role: "free";
};

export function getSessionUser(): SessionUser | null {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

