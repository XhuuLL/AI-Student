import { Schema, model, models, type InferSchemaType } from "mongoose";

const MaterialSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    fileUrl: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type Material = InferSchemaType<typeof MaterialSchema>;

export const MaterialModel = models.Material ?? model("Material", MaterialSchema);

