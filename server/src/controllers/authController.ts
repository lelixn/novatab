import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      settings: user.settings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Merge settings
    user.settings = { ...user.settings, ...req.body };
    await user.save();

    res.status(200).json({
      settings: user.settings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const googleAuth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token: googleToken, profile } = req.body;
    // For simplicity, in production we would verify the Google Token via OAuth client.
    // If validated, get or create the user.
    if (!profile || !profile.email) {
      res.status(400).json({ message: 'Invalid Google profile info' });
      return;
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        name: profile.name || 'Google User',
        email: profile.email,
        googleId: profile.sub,
        avatar: profile.picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      user.avatar = profile.picture;
      await user.save();
    }

    const token = generateToken(user._id.toString());
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Google Auth Failed' });
  }
};
