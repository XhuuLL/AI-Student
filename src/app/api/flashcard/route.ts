import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { materialIdSchema } from "@/utils/validators";
import { MaterialModel } from "@/models/Material";
import { FlashcardModel } from "@/models/Flashcard";
import { generateFlashcards } from "@/lib/ai/generateFlashcards";
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
    const cards = await generateFlashcards(material.content);
    if (!Array.isArray(cards) || cards.length < 5) {
      return NextResponse.json({ error: "Format flashcard tidak valid" }, { status: 500 });
    }

    const doc = await FlashcardModel.findOneAndUpdate(
      { userId: asObjectId(userId) ?? userId, materialId: asObjectId(materialId) ?? materialId },
      { $set: { cards } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ cards: doc?.cards ?? cards }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal generate flashcard" }, { status: 500 });
  }
}

