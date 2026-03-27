import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { chatSchema } from "@/utils/validators";
import { MaterialModel } from "@/models/Material";
import { ChatModel } from "@/models/Chat";
import { asObjectId } from "@/utils/objectId";
import { generateChatAnswer, type ChatMessage } from "@/lib/ai/generateChatAnswer";

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

  const chat = await ChatModel.findOne({
    userId: asObjectId(userId) ?? userId,
    materialId: asObjectId(materialId) ?? materialId,
  });

  return NextResponse.json(
    { messages: chat?.messages ?? [] },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const body = await req.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { materialId, message } = parsed.data;

  const material = await MaterialModel.findOne({
    _id: materialId,
    userId: asObjectId(userId) ?? userId,
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const chat = await ChatModel.findOne({
    userId: asObjectId(userId) ?? userId,
    materialId: asObjectId(materialId) ?? materialId,
  });

  const history = (chat?.messages ?? []).slice(-20);

  try {
    const assistantText = await generateChatAnswer({
      materialContent: material.content,
      history: history as ChatMessage[],
      message,
    });

    const newUserMsg = { role: "user" as const, content: message };
    const newAssistantMsg = { role: "assistant" as const, content: assistantText };

    const updated = await ChatModel.findOneAndUpdate(
      {
        userId: asObjectId(userId) ?? userId,
        materialId: asObjectId(materialId) ?? materialId,
      },
      {
        $setOnInsert: {
          messages: [],
        },
        $push: {
          messages: { $each: [newUserMsg, newAssistantMsg] },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: assistantText, messages: updated?.messages ?? [...history, newUserMsg, newAssistantMsg] },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Gagal memproses chat" }, { status: 500 });
  }
}

