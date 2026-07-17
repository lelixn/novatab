import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  url: string;
  favicon?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  favicon: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
