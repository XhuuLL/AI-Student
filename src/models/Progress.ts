import { Schema, model, models, type InferSchemaType } from "mongoose";

const ProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
    percent: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, materialId: 1 }, { unique: true });

export type Progress = InferSchemaType<typeof ProgressSchema>;

export const ProgressModel = models.Progress ?? model("Progress", ProgressSchema);

