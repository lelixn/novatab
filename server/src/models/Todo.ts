import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'learning' | 'health' | 'other';
  deadline?: Date;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, enum: ['work', 'personal', 'learning', 'health', 'other'], default: 'work' },
  deadline: { type: Date },
  tags: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<ITodo>('Todo', TodoSchema);
