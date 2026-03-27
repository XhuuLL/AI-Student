import { Schema, model, models, type InferSchemaType } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 10000 },
  },
  { _id: false }
);

const ChatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export type Chat = InferSchemaType<typeof ChatSchema>;

export const ChatModel = models.Chat ?? model("Chat", ChatSchema);

