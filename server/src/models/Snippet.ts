import mongoose, { Schema, Document } from 'mongoose';

export interface ISnippet extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  command: string;
  description?: string;
  category: 'git' | 'docker' | 'npm' | 'pnpm' | 'bun' | 'linux' | 'other';
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SnippetSchema = new Schema<ISnippet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  command: { type: String, required: true, trim: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['git', 'docker', 'npm', 'pnpm', 'bun', 'linux', 'other'],
    default: 'other',
  },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ISnippet>('Snippet', SnippetSchema);
