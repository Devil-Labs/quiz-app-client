import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizResult extends Document {
  name: string;
  email: string;
  phone: string;
  score: number;
  createdAt: Date;
}

const QuizResultSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  score: { type: Number, required: true, index: -1 }, // Indexed for efficient descending leaderboard queries
  createdAt: { type: Date, default: Date.now, expires: 172800 } // TTL index: Automatically delete after 48 hours (172800 seconds)
});

export default mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
