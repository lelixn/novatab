import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Target, Clock, Flame, BarChart3 } from 'lucide-react';
import { usePomodoroStore } from '../store/pomodoroStore';
import { formatTime, chromeNotify } from '@shared/utils';
import type { PomodoroMode } from '@shared/types';

// ============================================
// Circular Progress Ring
// ============================================
interface CircularProgressProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 240,
  strokeWidth = 8,
  color = 'var(--nova-purple)',
  children,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(168,85,247,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      {/* Children centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================
// Mode Config
// ============================================
const MODE_CONFIG: Record<PomodoroMode, { label: string; color: string; icon: React.ReactNode; emoji: string }> = {
  focus: { label: 'FOCUS', color: 'var(--nova-purple)', icon: <Target size={14} />, emoji: '🎯' },
  short_break: { label: 'SHORT BREAK', color: 'var(--nova-green)', icon: <Coffee size={14} />, emoji: '☕' },
  long_break: { label: 'LONG BREAK', color: 'var(--nova-cyan)', icon: <Coffee size={14} />, emoji: '🌿' },
};

// ============================================
// Pomodoro Page
// ============================================
export const PomodoroPage: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionCount,
    currentTaskTitle,
    stats,
    sessions,
    setMode,
    setRunning,
    setCurrentTask,
    tick,
    reset,
    completeSession,
  } = usePomodoroStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const config = MODE_CONFIG[mode];

  const totalDuration =
    mode === 'focus' ? focusDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  // Session complete
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setRunning(false);
      const msg = mode === 'focus'
        ? '🎯 Focus session complete! Time for a break.'
        : '⚡ Break over! Ready to focus?';
      chromeNotify('NOVA://OS', msg);
      completeSession();
    }
  }, [timeLeft, isRunning, mode, completeSession, setRunning]);

  const toggleTimer = () => setRunning(!isRunning);

  const recentFocusSessions = sessions.filter((s) => s.mode === 'focus').slice(-7);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Left: Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mode Switcher */}
          <div className="nova-card" style={{ padding: '6px', display: 'flex', gap: 4 }}>
            {(Object.entries(MODE_CONFIG) as [PomodoroMode, typeof MODE_CONFIG[PomodoroMode]][]).map(([modeKey, cfg]) => (
              <motion.button
                key={modeKey}
                onClick={() => !isRunning && setMode(modeKey)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  background: mode === modeKey ? `${cfg.color}18` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: isRunning && mode !== modeKey ? 0.5 : 1,
                  transition: 'all 200ms',
                  borderBottom: mode === modeKey ? `2px solid ${cfg.color}` : '2px solid transparent',
                }}
              >
                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                <span className="font-pixel" style={{ fontSize: '0.65rem', color: mode === modeKey ? cfg.color : 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  {cfg.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="nova-card" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <motion.div
              key={mode}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CircularProgress
                progress={progress}
                size={220}
                strokeWidth={6}
                color={config.color}
              >
                {/* Time Display */}
                <motion.div
                  key={timeLeft}
                  className="font-mono"
                  style={{
                    fontSize: '3rem',
                    fontWeight: 300,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.04em',
                    textShadow: `0 0 30px ${config.color}60`,
                    lineHeight: 1,
                  }}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <div
                  className="font-pixel"
                  style={{ fontSize: '0.65rem', color: config.color, marginTop: 6, letterSpacing: '0.12em' }}
                >
                  {config.emoji} {config.label}
                </div>
              </CircularProgress>
            </motion.div>

            {/* Task Input */}
            <input
              value={currentTaskTitle}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="// Working on..."
              style={{
                background: 'rgba(168,85,247,0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '8px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                width: '100%',
                maxWidth: 300,
                textAlign: 'center',
                outline: 'none',
              }}
            />

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.button
                onClick={reset}
                className="nova-btn nova-btn-ghost"
                style={{ width: 44, height: 44, padding: 0, borderRadius: '50%' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset"
              >
                <RotateCcw size={16} />
              </motion.button>

              <motion.button
                onClick={toggleTimer}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${config.color}80, ${config.color})`,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 30px ${config.color}50`,
                }}
                whileHover={{ scale: 1.05, boxShadow: `0 0 50px ${config.color}70` }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isRunning ? 'pause' : 'play'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isRunning ? <Pause size={26} color="white" /> : <Play size={26} color="white" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              <div style={{ width: 44, height: 44 }} />
            </div>
          </div>

          {/* Session Dots */}
          <div className="nova-card" style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="font-pixel" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                SESSION PROGRESS
              </span>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--nova-purple)' }}>
                {sessionCount % 4}/4 until long break
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: 4 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: i < (sessionCount % 4)
                      ? 'linear-gradient(90deg, var(--nova-purple-dim), var(--nova-purple))'
                      : 'var(--bg-card-hover)',
                    boxShadow: i < (sessionCount % 4) ? '0 0 8px rgba(168,85,247,0.5)' : 'none',
                    transition: 'all 300ms',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Stats Cards */}
          {[
            { icon: <Target size={16} />, label: "Today's Sessions", value: stats.todaySessions, color: 'var(--nova-purple)' },
            { icon: <Flame size={16} />, label: 'Current Streak', value: `${stats.currentStreak} 🔥`, color: 'var(--nova-red)' },
            { icon: <Clock size={16} />, label: 'Total Focus Time', value: `${Math.round(stats.totalFocusTime / 60)}m`, color: 'var(--nova-cyan)' },
            { icon: <BarChart3 size={16} />, label: 'Total Sessions', value: stats.totalFocusSessions, color: 'var(--nova-green)' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="nova-card"
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
              whileHover={{ borderColor: stat.color + '40' }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 600, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </motion.div>
          ))}

          {/* Recent Sessions */}
          <div className="nova-card" style={{ padding: '14px 16px' }}>
            <div className="font-pixel" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              RECENT FOCUS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentFocusSessions.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No sessions yet
                </div>
              ) : (
                recentFocusSessions.slice(-5).reverse().map((session) => (
                  <div
                    key={session.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--nova-purple)',
                        boxShadow: '0 0 4px rgba(168,85,247,0.6)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.taskTitle ?? 'Focus session'}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                        {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--nova-green)' }}>
                      {Math.round(session.duration / 60)}m
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
