import { getOpenAI } from "@/lib/ai/openai";
import { env } from "@/lib/env";
import { QUIZ_INSTRUCTIONS, STUDY_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";
import { safeJsonParse } from "@/utils/json";

export async function generateQuiz(content: string): Promise<
  Array<{ question: string; options: string[]; answer: string }>
> {
  const truncated = content.slice(0, 140_000);

  const completion = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: STUDY_ASSISTANT_SYSTEM },
      {
        role: "user",
        content: `${QUIZ_INSTRUCTIONS}\n\nMATERI:\n${truncated}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";
  return safeJsonParse(raw);
}

