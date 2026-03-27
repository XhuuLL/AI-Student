import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { materialIdSchema } from "@/utils/validators";
import { MaterialModel } from "@/models/Material";
import { QuizModel } from "@/models/Quiz";
import { generateQuiz } from "@/lib/ai/generateQuiz";
import { asObjectId } from "@/utils/objectId";

export async function POST(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const body = await req.json().catch(() => null);
  const parsed = materialIdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const materialId = parsed.data.materialId;

  const material = await MaterialModel.findOne({
    _id: materialId,
    userId: asObjectId(userId) ?? userId,
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  try {
    const questions = await generateQuiz(material.content);
    if (!Array.isArray(questions) || questions.length !== 5) {
      return NextResponse.json({ error: "Format quiz tidak valid" }, { status: 500 });
    }

    const quiz = await QuizModel.findOneAndUpdate(
      { userId: asObjectId(userId) ?? userId, materialId: asObjectId(materialId) ?? materialId },
      { $set: { questions } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ questions: quiz?.questions ?? questions }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal generate quiz" }, { status: 500 });
  }
}

