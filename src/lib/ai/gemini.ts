import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, requireEnv } from "@/lib/env";

let cached: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (cached) return cached;

  const apiKey = env.GEMINI_API_KEY ?? requireEnv("GEMINI_API_KEY");

  cached = new GoogleGenerativeAI(apiKey);
  
  return cached;
}