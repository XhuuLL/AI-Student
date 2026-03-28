import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, requireEnv } from "@/lib/env";
import { STUDY_ASSISTANT_SYSTEM, SUMMARY_INSTRUCTIONS } from "@/lib/ai/prompts";
import { safeJsonParse } from "@/utils/json";

// Inisialisasi Google AI Studio Client
const genAI = new GoogleGenerativeAI(requireEnv("GEMINI_API_KEY"));

export async function generateSummary(content: string): Promise<{
  summary: string;
  key_points: string[];
}> {
  // Gemini 1.5 Flash mendukung hingga 1jt+ token, 
  // tapi limit 120k tetap bagus untuk efisiensi.
  const truncated = content.slice(0, 120_000);

  // Inisialisasi model dengan System Instruction
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL || "gemini-1.5-flash",
    systemInstruction: STUDY_ASSISTANT_SYSTEM, // OpenAI System Message pindah ke sini
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json", // Ini pengganti response_format: json_object
    },
  });

  try {
    const prompt = `${SUMMARY_INSTRUCTIONS}\n\nMATERI:\n${truncated}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    // Gunakan parser bawaan kamu agar tetap aman
    return safeJsonParse(raw);
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return {
      summary: "Gagal membuat ringkasan secara otomatis.",
      key_points: [],
    };
  }
}