import { getGemini } from "@/lib/ai/gemini"; // Pastikan sudah ganti nama fungsi di gemini.ts
import { env } from "@/lib/env";
import { STUDY_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function generateChatAnswer(params: {
  materialContent: string;
  history: ChatMessage[];
  message: string;
}): Promise<string> {
  const { materialContent, history, message } = params;
  
  // Gemini 1.5 Flash punya context window besar (1jt+), 
  // 18.000 karakter sangat aman, tapi limit tetap bagus untuk efisiensi token.
  const truncated = materialContent.slice(0, 50_000); 

  const genAI = getGemini();
  
  // 1. Inisialisasi model dengan System Instruction & Materi
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL || "gemini-flash-latest",
    systemInstruction: `${STUDY_ASSISTANT_SYSTEM}\n\nMATERI REFERENSI:\n${truncated}`,
    generationConfig: {
      temperature: 0.2,
    },
  });

  // 2. Petakan history dari format OpenAI ke format Gemini
  // OpenAI: assistant -> Gemini: model
  const geminiHistory = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    // 3. Mulai chat session dengan history yang sudah ada
    const chatSession = model.startChat({
      history: geminiHistory,
    });

    // 4. Kirim pesan user yang baru
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Maaf, saya mengalami kendala saat memproses jawaban. Silakan coba lagi.";
  }
}