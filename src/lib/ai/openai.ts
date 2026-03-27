import OpenAI from "openai";
import { env, requireEnv } from "@/lib/env";

let cached: OpenAI | null = null;

export function getOpenAI() {
  if (cached) return cached;
  const apiKey = env.OPENAI_API_KEY ?? requireEnv("OPENAI_API_KEY");
  cached = new OpenAI({ apiKey });
  return cached;
}

