import mongoose, { Schema, Document } from 'mongoose';

export interface IPomodoro extends Document {
  user: mongoose.Types.ObjectId;
  mode: 'focus' | 'short_break' | 'long_break';
  durationMinutes: number;
  completedAt: Date;
}

const PomodoroSchema = new Schema<IPomodoro>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['focus', 'short_break', 'long_break'], required: true },
  durationMinutes: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPomodoro>('Pomodoro', PomodoroSchema);
