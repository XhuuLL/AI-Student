import { getGemini } from "@/lib/ai/gemini"; 
import { env } from "@/lib/env";
import { QUIZ_INSTRUCTIONS, STUDY_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";
import { safeJsonParse } from "@/utils/json";

// 1. Definisikan tipe data yang lebih spesifik
export type QuizItem = {
  type: "multiple_choice" | "essay";
  question: string;
  options: string[]; // Kosong [] jika essay
  answer: string;    // Kunci jawaban/pembahasan
};

export async function generateQuiz(content: string): Promise<QuizItem[]> {
  const truncated = content.slice(0, 140_000);
  const genAI = getGemini();

  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL || "gemini-flash-latest",
    systemInstruction: STUDY_ASSISTANT_SYSTEM,
    generationConfig: {
      temperature: 0.4, // Sedikit lebih tinggi agar soal essay lebih variatif
      responseMimeType: "application/json", 
    },
  });

  try {
    // Pastikan QUIZ_INSTRUCTIONS di file prompts.ts sudah kamu update 
    // untuk meminta 3 PG dan 2 Essay seperti yang kita bahas sebelumnya.
    const prompt = `${QUIZ_INSTRUCTIONS}\n\nMATERI:\n${truncated}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    return safeJsonParse(raw);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
}