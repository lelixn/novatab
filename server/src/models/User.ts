import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISettings {
  clockFormat: '12h' | '24h';
  weatherUnit: 'metric' | 'imperial';
  accentColor: 'purple' | 'blue' | 'cyan' | 'green' | 'pink';
  showWeather: boolean;
  showQuote: boolean;
  showBackground: boolean;
  showParticles: boolean;
  greetingName: string;
  githubUsername: string;
  leetcodeUsername: string;
  openWeatherApiKey: string;
  focusMode: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  settings: ISettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const SettingsSchema = new Schema<ISettings>({
  clockFormat: { type: String, enum: ['12h', '24h'], default: '24h' },
  weatherUnit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  accentColor: { type: String, enum: ['purple', 'blue', 'cyan', 'green', 'pink'], default: 'purple' },
  showWeather: { type: Boolean, default: true },
  showQuote: { type: Boolean, default: true },
  showBackground: { type: Boolean, default: true },
  showParticles: { type: Boolean, default: true },
  greetingName: { type: String, default: 'Developer' },
  githubUsername: { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  openWeatherApiKey: { type: String, default: '' },
  focusMode: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String },
  avatar: { type: String },
  settings: { type: SettingsSchema, default: () => ({}) },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
