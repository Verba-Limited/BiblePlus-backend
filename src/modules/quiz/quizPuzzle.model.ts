import mongoose, { Schema, Document } from "mongoose";

export interface IQuizPuzzle extends Document {
  type: string;
  level: number;
  prompt: string;
  data: any;
  answer: any;
}

const quizPuzzleSchema = new Schema<IQuizPuzzle>(
  {
    type: { type: String, required: true },
    level: { type: Number, required: true },
    prompt: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    answer: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const QuizPuzzle = mongoose.model<IQuizPuzzle>(
  "QuizPuzzle",
  quizPuzzleSchema
);