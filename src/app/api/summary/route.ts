import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { MaterialModel } from "@/models/Material";
import { requireUser } from "@/lib/auth/requireUser";
import { materialIdSchema } from "@/utils/validators";
import { generateSummary } from "@/lib/ai/generateSummary";
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

  if (!material) {
    return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
  }

  try {
    const result = await generateSummary(material.content);
    material.summary = result.summary;
    material.keyPoints = result.key_points;
    await material.save();

    return NextResponse.json(
      { summary: material.summary, keyPoints: material.keyPoints },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Gagal generate ringkasan" }, { status: 500 });
  }
}

