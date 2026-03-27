import { Schema, model, models, type InferSchemaType } from "mongoose";

const QuizQuestionSchema = new Schema(
  {
    question: { type: String, required: true, maxlength: 500 },
    options: { type: [String], required: true, validate: [(v: string[]) => v.length === 4, "options must be 4 items"] },
    answer: { type: String, required: true, maxlength: 500 },
  },
  { _id: false }
);

const QuizSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
    questions: { type: [QuizQuestionSchema], default: [] },
  },
  { timestamps: true }
);

export type Quiz = InferSchemaType<typeof QuizSchema>;

export const QuizModel = models.Quiz ?? model("Quiz", QuizSchema);

