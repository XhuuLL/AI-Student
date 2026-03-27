import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { ProgressModel } from "@/models/Progress";
import { materialIdSchema } from "@/utils/validators";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const url = new URL(req.url);
  const materialId = url.searchParams.get("materialId");
  if (!materialId) {
    return NextResponse.json({ error: "materialId diperlukan" }, { status: 400 });
  }

  const progress = await ProgressModel.findOne({
    userId: asObjectId(userId) ?? userId,
    materialId: asObjectId(materialId) ?? materialId,
  });

  return NextResponse.json(
    { percent: progress?.percent ?? 0 },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const body = await req.json().catch(() => null);
  const schema = materialIdSchema.extend({
    percent: z.number().min(0).max(100),
  });
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { materialId, percent } = parsed.data;

  const doc = await ProgressModel.findOneAndUpdate(
    {
      userId: asObjectId(userId) ?? userId,
      materialId: asObjectId(materialId) ?? materialId,
    },
    { $set: { percent } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ percent: doc.percent }, { status: 200 });
}

