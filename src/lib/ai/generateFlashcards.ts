import { getGemini } from "@/lib/ai/gemini"; // Gunakan nama fungsi baru
import { env } from "@/lib/env";
import { FLASHCARD_INSTRUCTIONS, STUDY_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";
import { safeJsonParse } from "@/utils/json";

export type FlashcardItem = { question: string; answer: string };

export async function generateFlashcards(
  content: string
): Promise<FlashcardItem[]> {
  const truncated = content.slice(0, 140_000);

  const genAI = getGemini();
  
  // Inisialisasi model dengan mode JSON
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL || "gemini-flash-latest", 
    systemInstruction: STUDY_ASSISTANT_SYSTEM,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json", 
    },
  });

  try {
    const prompt = `${FLASHCARD_INSTRUCTIONS}\n\nMATERI:\n${truncated}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();

    return safeJsonParse(raw);
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    return [];
  }
}