import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { loginSchema } from "@/utils/validators";
import { verifyPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  await connectToDb();

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const token = signJwt({ userId: user._id.toString(), role: "free" });
  const res = NextResponse.json(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    { status: 200 }
  );

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

