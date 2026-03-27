import jwt from "jsonwebtoken";
import { env, requireEnv } from "@/lib/env";

export type JwtPayload = {
  userId: string;
  role: "free";
  iat?: number;
  exp?: number;
};

export function signJwt(payload: JwtPayload) {
  const secret = env.JWT_SECRET ?? requireEnv("JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyJwt(token: string): JwtPayload {
  const secret = env.JWT_SECRET ?? requireEnv("JWT_SECRET");
  return jwt.verify(token, secret) as JwtPayload;
}

