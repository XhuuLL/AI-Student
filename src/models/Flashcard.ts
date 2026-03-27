import { Schema, model, models, type InferSchemaType } from "mongoose";

const FlashcardItemSchema = new Schema(
  {
    question: { type: String, required: true, maxlength: 500 },
    answer: { type: String, required: true, maxlength: 5000 },
  },
  { _id: false }
);

const FlashcardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
    cards: { type: [FlashcardItemSchema], default: [] },
  },
  { timestamps: true }
);

export type FlashcardDoc = InferSchemaType<typeof FlashcardSchema>;

export const FlashcardModel = models.Flashcard ?? model("Flashcard", FlashcardSchema);

