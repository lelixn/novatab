import { Response } from 'express';
import Pomodoro from '../models/Pomodoro';
import { AuthenticatedRequest } from '../middleware/auth';

export const logSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { mode, durationMinutes } = req.body;
    if (!mode || !durationMinutes) {
      res.status(400).json({ message: 'Mode and duration are required' });
      return;
    }

    const session = new Pomodoro({
      user: req.userId,
      mode,
      durationMinutes,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to log focus session' });
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Aggregate sessions
    const totalSessions = await Pomodoro.countDocuments({ user: userId, mode: 'focus' });

    const totalDuration = await Pomodoro.aggregate([
      { $match: { user: userId, mode: 'focus' } },
      { $group: { _id: null, total: { $sum: '$durationMinutes' } } },
    ]);

    const totalMinutes = totalDuration.length > 0 ? totalDuration[0].total : 0;

    // Get today's sessions count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySessions = await Pomodoro.countDocuments({
      user: userId,
      mode: 'focus',
      completedAt: { $gte: startOfToday },
    });

    // Daily breakdown for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBreakdown = await Pomodoro.aggregate([
      {
        $match: {
          user: userId,
          mode: 'focus',
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
          minutes: { $sum: '$durationMinutes' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalFocusSessions: totalSessions,
      totalFocusHours: Math.round((totalMinutes / 60) * 10) / 10,
      todaySessions,
      dailyBreakdown,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to aggregate focus stats' });
  }
};
