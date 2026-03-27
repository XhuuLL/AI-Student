import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 120 },
    password: { type: String, required: true, minlength: 6, maxlength: 200 },
    role: { type: String, enum: ["free"], default: "free" },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof UserSchema>;

export const UserModel = models.User ?? model("User", UserSchema);

