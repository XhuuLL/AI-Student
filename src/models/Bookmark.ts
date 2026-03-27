import { Schema, model, models, type InferSchemaType } from "mongoose";

const BookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, materialId: 1 }, { unique: true });

export type Bookmark = InferSchemaType<typeof BookmarkSchema>;

export const BookmarkModel = models.Bookmark ?? model("Bookmark", BookmarkSchema);

