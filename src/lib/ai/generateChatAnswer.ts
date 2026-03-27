import { getOpenAI } from "@/lib/ai/openai";
import { env } from "@/lib/env";
import { STUDY_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function generateChatAnswer(params: {
  materialContent: string;
  history: ChatMessage[];
  message: string;
}): Promise<string> {
  const { materialContent, history, message } = params;
  const truncated = materialContent.slice(0, 18_000);

  const completion = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `${STUDY_ASSISTANT_SYSTEM}\n\nMATERI:\n${truncated}`,
      },
      ...history,
      { role: "user", content: message },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}

