import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { BookmarkModel } from "@/models/Bookmark";
import { materialIdSchema } from "@/utils/validators";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const list = await BookmarkModel.find({
    userId: asObjectId(userId) ?? userId,
  }).select({ materialId: 1 });

  return NextResponse.json(
    { materialIds: list.map((b) => b.materialId.toString()) },
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
    bookmarked: z.boolean().optional(),
  });
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { materialId, bookmarked } = parsed.data;

  const filter = {
    userId: asObjectId(userId) ?? userId,
    materialId: asObjectId(materialId) ?? materialId,
  };

  if (bookmarked === false) {
    await BookmarkModel.deleteOne(filter);
    return NextResponse.json({ bookmarked: false }, { status: 200 });
  }

  await BookmarkModel.updateOne(
    filter,
    { $setOnInsert: filter },
    { upsert: true }
  );

  return NextResponse.json({ bookmarked: true }, { status: 200 });
}

