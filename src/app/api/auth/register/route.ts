import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { registerSchema } from "@/utils/validators";
import { hashPassword } from "@/lib/auth/password";
import { signJwt } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  await connectToDb();

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    password: passwordHash,
    role: "free",
  });

  const token = signJwt({ userId: user._id.toString(), role: "free" });
  const res = NextResponse.json(
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

