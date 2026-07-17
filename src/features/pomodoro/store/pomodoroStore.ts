import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PomodoroMode, PomodoroSession, PomodoroStats } from '@shared/types';
import { generateId } from '@shared/utils';

interface PomodoroStore {
  // Config
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreak: boolean;

  // State
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  sessionCount: number;
  currentTaskTitle: string;

  // History
  sessions: PomodoroSession[];
  stats: PomodoroStats;

  // Actions
  setMode: (mode: PomodoroMode) => void;
  setTimeLeft: (time: number) => void;
  setRunning: (running: boolean) => void;
  setCurrentTask: (title: string) => void;
  tick: () => void;
  reset: () => void;
  completeSession: () => void;
  updateConfig: (config: Partial<Pick<PomodoroStore, 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration' | 'sessionsBeforeLongBreak' | 'autoStartBreak'>>) => void;
}

const DEFAULT_STATS: PomodoroStats = {
  totalFocusSessions: 0,
  totalFocusTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  todaySessions: 0,
};

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      focusDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsBeforeLongBreak: 4,
      autoStartBreak: true,
      mode: 'focus',
      timeLeft: 25 * 60,
      isRunning: false,
      sessionCount: 0,
      currentTaskTitle: '',
      sessions: [],
      stats: DEFAULT_STATS,

      setMode: (mode) => {
        const state = get();
        const durations: Record<PomodoroMode, number> = {
          focus: state.focusDuration,
          short_break: state.shortBreakDuration,
          long_break: state.longBreakDuration,
        };
        set({ mode, timeLeft: durations[mode], isRunning: false });
      },

      setTimeLeft: (time) => set({ timeLeft: time }),
      setRunning: (running) => set({ isRunning: running }),
      setCurrentTask: (title) => set({ currentTaskTitle: title }),

      tick: () =>
        set((state) => {
          if (state.timeLeft <= 0) return state;
          return { timeLeft: state.timeLeft - 1 };
        }),

      reset: () => {
        const state = get();
        const durations: Record<PomodoroMode, number> = {
          focus: state.focusDuration,
          short_break: state.shortBreakDuration,
          long_break: state.longBreakDuration,
        };
        set({ timeLeft: durations[state.mode], isRunning: false });
      },

      completeSession: () =>
        set((state) => {
          const session: PomodoroSession = {
            id: generateId(),
            mode: state.mode,
            duration:
              state.mode === 'focus'
                ? state.focusDuration
                : state.mode === 'short_break'
                ? state.shortBreakDuration
                : state.longBreakDuration,
            completedAt: new Date().toISOString(),
            taskTitle: state.currentTaskTitle || undefined,
          };

          const newSessionCount = state.mode === 'focus' ? state.sessionCount + 1 : state.sessionCount;
          const isLongBreak = newSessionCount % state.sessionsBeforeLongBreak === 0;
          const nextMode: PomodoroMode =
            state.mode === 'focus'
              ? isLongBreak
                ? 'long_break'
                : 'short_break'
              : 'focus';

          const durations: Record<PomodoroMode, number> = {
            focus: state.focusDuration,
            short_break: state.shortBreakDuration,
            long_break: state.longBreakDuration,
          };

          const today = new Date().toDateString();
          const todaySessionCount = state.sessions.filter(
            (s) => s.mode === 'focus' && new Date(s.completedAt).toDateString() === today
          ).length + (state.mode === 'focus' ? 1 : 0);

          return {
            sessions: [...state.sessions.slice(-100), session],
            sessionCount: newSessionCount,
            mode: nextMode,
            timeLeft: durations[nextMode],
            isRunning: state.autoStartBreak && nextMode !== 'focus',
            stats: {
              ...state.stats,
              totalFocusSessions: state.mode === 'focus' ? state.stats.totalFocusSessions + 1 : state.stats.totalFocusSessions,
              totalFocusTime: state.mode === 'focus' ? state.stats.totalFocusTime + state.focusDuration : state.stats.totalFocusTime,
              currentStreak: state.mode === 'focus' ? state.stats.currentStreak + 1 : state.stats.currentStreak,
              longestStreak: Math.max(state.stats.longestStreak, state.mode === 'focus' ? state.stats.currentStreak + 1 : state.stats.currentStreak),
              todaySessions: todaySessionCount,
            },
          };
        }),

      updateConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    {
      name: 'nova-pomodoro',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
