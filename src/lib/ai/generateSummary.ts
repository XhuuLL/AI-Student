import { getOpenAI } from "@/lib/ai/openai";
import { env } from "@/lib/env";
import { STUDY_ASSISTANT_SYSTEM, SUMMARY_INSTRUCTIONS } from "@/lib/ai/prompts";
import { safeJsonParse } from "@/utils/json";

export async function generateSummary(content: string): Promise<{
  summary: string;
  key_points: string[];
}> {
  const truncated = content.slice(0, 120_000);

  const completion = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: STUDY_ASSISTANT_SYSTEM },
      {
        role: "user",
        content: `${SUMMARY_INSTRUCTIONS}\n\nMATERI:\n${truncated}`,
      },
    ],
    // Many models support json_object; if unsupported, parsing still works.
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return safeJsonParse(raw);
}

