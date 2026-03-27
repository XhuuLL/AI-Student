import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth/requireUser";
import { asObjectId } from "@/utils/objectId";
import { MaterialModel } from "@/models/Material";
import { QuizModel } from "@/models/Quiz";
import { FlashcardModel } from "@/models/Flashcard";
import { BookmarkModel } from "@/models/Bookmark";
import { ProgressModel } from "@/models/Progress";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDb();

  const sessionOrResp = requireUser();
  if (!("userId" in sessionOrResp)) return sessionOrResp;
  const { userId } = sessionOrResp;

  const filter = { userId: asObjectId(userId) ?? userId };

  const [materialsCount, quizzesCount, flashcardsCount, bookmarksCount, avgProgressAgg] = await Promise.all([
    MaterialModel.countDocuments(filter),
    QuizModel.countDocuments(filter),
    FlashcardModel.countDocuments(filter),
    BookmarkModel.countDocuments(filter),
    ProgressModel.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: "$percent" } } },
    ]),
  ]);

  return NextResponse.json(
    {
      materialsCount,
      quizzesCount,
      flashcardsCount,
      bookmarksCount,
      avgProgress: avgProgressAgg[0]?.avg ?? 0,
    },
    { status: 200 }
  );
}

