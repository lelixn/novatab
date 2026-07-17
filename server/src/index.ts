import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes';
import todoRoutes from './routes/todoRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import pomodoroRoutes from './routes/pomodoroRoutes';
import snippetRoutes from './routes/snippetRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all chrome extensions / local clients
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: '*', // For chrome extension endpoints
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/snippets', snippetRoutes);

// Socket.io connection handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins room representing their account
  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined their synchronization room`);
  });

  // Client notifies that items were updated
  socket.on('sync-trigger', (data: { userId: string; type: string }) => {
    // Broadcast updates to all other clients for the same user
    socket.to(data.userId).emit('sync-update', { type: data.type });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nova-os';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB successfully connected');
    server.listen(PORT, () => {
      console.log(`NOVA://OS Server is active on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failure:', err);
    process.exit(1);
  });
