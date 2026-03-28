import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { MaterialModel } from "@/models/Material";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const url = new URL(req.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const from = (url.searchParams.get("from") ?? "").trim();
  const to = (url.searchParams.get("to") ?? "").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    20,
    Math.max(5, Number(url.searchParams.get("pageSize") ?? "10") || 10)
  );

  const filterObj: {
    userId: Parameters<typeof MaterialModel.find>[0] extends { userId: infer U } ? U : unknown;
    title?: { $regex: string; $options: "i" };
    createdAt?: { $gte?: Date; $lte?: Date };
  } = {
    userId: asObjectId(userId) ?? userId,
  };

  if (search) {
    filterObj.title = { $regex: search, $options: "i" };
  }

  const createdAt: { $gte?: Date; $lte?: Date } = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) createdAt.$gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) createdAt.$lte = d;
  }
  if (Object.keys(createdAt).length) {
    filterObj.createdAt = createdAt;
  }

  const baseFilter = filterObj as unknown as Parameters<typeof MaterialModel.find>[0];

  const total = await MaterialModel.countDocuments(baseFilter);

  const materials = await MaterialModel.find(baseFilter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .select({ content: 0 }); 

  return NextResponse.json(
    {
      materials: materials.map((m) => ({
        id: m._id,
        title: m.title,
        fileUrl: m.fileUrl,
        createdAt: m.createdAt,
        summary: m.summary,
        keyPoints: m.keyPoints,
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
    { status: 200 }
  );
}

