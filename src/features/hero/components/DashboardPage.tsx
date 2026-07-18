import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  CheckSquare,
  Timer,
  Terminal,
  Bookmark,
  Music,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  Target,
  Clock,
  Github,
  Code2,
} from 'lucide-react';
import { useTodoStore } from '@features/todo/store/todoStore';
import { usePomodoroStore } from '@features/pomodoro/store/pomodoroStore';
import { useSnippetStore } from '@features/terminal/store/snippetStore';
import { useBookmarkStore } from '@features/bookmarks/store/bookmarkStore';
import { useSettingsStore, useUIStore } from '@store/index';
import { formatTime, getFaviconUrl } from '@shared/utils';
import { Widget, WidgetHeader, WidgetBody, WidgetFooter } from '@shared/components/Widget';
import type { MusicStation } from '@shared/types';

// ============================================
// Daily Quote Widget
// ============================================
const QUOTES = [
  { text: "Code is like humor. When you have to explain it, it's bad.", author: 'Cory House' },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: 'Martin Fowler' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: "Simplicity is the soul of efficiency.", author: 'Austin Freeman' },
  { text: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'Before software can be reusable it first has to be usable.', author: 'Ralph Johnson' },
  { text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupéry' },
];

const QuoteWidget: React.FC = memo(() => {
  const [quoteIdx, setQuoteIdx] = useState(() => new Date().getDate() % QUOTES.length);
  const quote = QUOTES[quoteIdx];

  return (
    <Widget glow style={{ gridColumn: 'span 2' }}>
      <WidgetBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div
            style={{
              fontFamily: 'Pixelify Sans, monospace',
              fontSize: '2.5rem',
              color: 'var(--accent)',
              lineHeight: 0.8,
              opacity: 0.3,
              flexShrink: 0,
            }}
          >
            "
          </div>
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8, fontStyle: 'italic' }}>
                  {quote.text}
                </p>
                <p className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>
                  — {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.button
            onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            whileHover={{ rotate: 180, color: 'var(--accent)' }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </WidgetBody>
    </Widget>
  );
});

QuoteWidget.displayName = 'QuoteWidget';

// ============================================
// Todo Summary Widget
// ============================================
const TodoWidget: React.FC = memo(() => {
  const { todos } = useTodoStore();
  const { setActiveView } = useUIStore();
  const active = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);
  const pct = todos.length > 0 ? (completed.length / todos.length) * 100 : 0;

  // Mini progress ring constants
  const size = 52;
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <Widget onClick={() => setActiveView('tasks')}>
      <WidgetHeader
        title="Tasks Matrix"
        icon={<CheckSquare size={13} />}
        iconColor="var(--nova-cyan)"
        badge={`${todos.length} total`}
        badgeColor="var(--nova-cyan)"
      />
      <WidgetBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--nova-cyan)', lineHeight: 1.1 }}>
              {active.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>tasks remaining</div>
          </div>

          {/* Mini circular progress */}
          <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth={strokeW} />
              <motion.circle
                cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--nova-cyan)" strokeWidth={strokeW}
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.6 }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--nova-cyan)', fontWeight: 600 }}>
              {Math.round(pct)}%
            </div>
          </div>
        </div>

        {/* Recent tasks preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {active.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
              ✓ All tasks completed
            </div>
          ) : (
            active.slice(0, 3).map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: t.priority === 'high' ? 'var(--nova-red)' : t.priority === 'medium' ? 'var(--nova-yellow)' : 'var(--nova-green)',
                  boxShadow: `0 0 4px ${t.priority === 'high' ? 'var(--nova-red)' : t.priority === 'medium' ? 'var(--nova-yellow)' : 'var(--nova-green)'}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {t.title}
                </span>
              </div>
            ))
          )}
        </div>
      </WidgetBody>
    </Widget>
  );
});

TodoWidget.displayName = 'TodoWidget';

// ============================================
// Pomodoro Summary Widget
// ============================================
const PomodoroWidget: React.FC = memo(() => {
  const { timeLeft, isRunning, mode, stats, setRunning } = usePomodoroStore();
  const { setActiveView } = useUIStore();

  const modeColors = { focus: 'var(--nova-purple)', short_break: 'var(--nova-green)', long_break: 'var(--nova-cyan)' };
  const color = modeColors[mode];

  // Circular ring details
  const size = 52;
  const strokeW = 4;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  // Focus is 25m, break is 5m/15m
  const total = mode === 'focus' ? 25 * 60 : mode === 'short_break' ? 5 * 60 : 15 * 60;
  const pct = total > 0 ? ((total - timeLeft) / total) * 100 : 0;
  const offset = circ - (pct / 100) * circ;

  return (
    <Widget onClick={() => setActiveView('pomodoro')}>
      <WidgetHeader
        title="Pomodoro Deck"
        icon={<Timer size={13} />}
        iconColor={color}
        actions={
          <motion.button
            onClick={(e) => { e.stopPropagation(); setRunning(!isRunning); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </motion.button>
        }
      />
      <WidgetBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 300, color, textShadow: `0 0 15px ${color}40`, lineHeight: 1.1 }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`,
                animation: isRunning ? 'dotPulse 1.5s ease-in-out infinite' : 'none'
              }} />
              <span className="font-pixel" style={{ fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                {mode === 'focus' ? 'FOCUS' : mode === 'short_break' ? 'SHORT BREAK' : 'LONG BREAK'}
              </span>
            </div>
          </div>

          {/* Mini progress ring */}
          <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
              <motion.circle
                cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
              {stats.todaySessions}d
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>focus time</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 1 }}>
              {Math.round(stats.totalFocusTime / 60)}m
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>current streak</span>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nova-red)', marginTop: 1 }}>
              {stats.currentStreak} 🔥
            </div>
          </div>
        </div>
      </WidgetBody>
    </Widget>
  );
});

PomodoroWidget.displayName = 'PomodoroWidget';

// ============================================
// Quick Bookmarks Widget
// ============================================
const BookmarksWidget: React.FC = memo(() => {
  const { bookmarks } = useBookmarkStore();
  const { setActiveView } = useUIStore();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <Widget>
      <WidgetHeader
        title="Bookmarks Grid"
        icon={<Bookmark size={13} />}
        iconColor="var(--nova-pink)"
        actions={
          <motion.button
            onClick={() => setActiveView('bookmarks')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'JetBrains Mono' }}
            whileHover={{ color: 'var(--nova-pink)' }}
          >
            View all
          </motion.button>
        }
      />
      <WidgetBody>
        {bookmarks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>📌</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No bookmarks loaded</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {bookmarks.slice(0, 8).map((b) => {
              const favicon = b.favicon ?? getFaviconUrl(b.url);
              return (
                <motion.a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  title={b.title}
                  whileHover={{ scale: 1.05, borderColor: 'var(--nova-pink-dim)', backgroundColor: 'var(--bg-glass-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 4px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    transition: 'border-color 150ms ease, background-color 150ms ease',
                  }}
                >
                  <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!imgErrors.has(b.id) ? (
                      <img
                        src={favicon}
                        alt=""
                        width={14}
                        height={14}
                        onError={() => setImgErrors((prev) => {
                          const next = new Set(prev);
                          next.add(b.id);
                          return next;
                        })}
                      />
                    ) : (
                      <ExternalLink size={10} color="var(--text-muted)" />
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.62rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    padding: '0 2px',
                  }}>
                    {b.title}
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}
      </WidgetBody>
    </Widget>
  );
});

BookmarksWidget.displayName = 'BookmarksWidget';

// ============================================
// Terminal Quick Access Widget
// ============================================
const TerminalWidget: React.FC = memo(() => {
  const { snippets } = useSnippetStore();
  const { setActiveView } = useUIStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const favorites = snippets.filter((s) => s.isFavorite).slice(0, 3);

  const copy = async (id: string, cmd: string) => {
    await navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Widget>
      <WidgetHeader
        title="Developer Snippets"
        icon={<Terminal size={13} />}
        iconColor="var(--nova-green)"
        actions={
          <motion.button
            onClick={() => setActiveView('terminal')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'JetBrains Mono' }}
            whileHover={{ color: 'var(--nova-green)' }}
          >
            View all
          </motion.button>
        }
      />
      <WidgetBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {favorites.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0', textAlign: 'center' }}>
              No snippets marked as favorite yet
            </div>
          ) : (
            favorites.map((s) => (
              <motion.div
                key={s.id}
                onClick={() => copy(s.id, s.command)}
                whileHover={{ borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 10px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '2px solid var(--nova-green)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                <span style={{ color: 'var(--nova-green)', fontFamily: 'JetBrains Mono', fontSize: '0.65rem', fontWeight: 600 }}>$</span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.command}
                </span>
                <span style={{ fontSize: '0.6rem', color: copiedId === s.id ? 'var(--nova-green)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
                  {copiedId === s.id ? '✓ copied' : 'copy'}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </WidgetBody>
    </Widget>
  );
});

TerminalWidget.displayName = 'TerminalWidget';

// ============================================
// LoFi Music Widget
// ============================================
const STATIONS: MusicStation[] = [
  { id: 'lofi1', name: 'LoFi Hip Hop', genre: 'lofi', streamUrl: 'https://stream.nightride.fm/nightride.m4a', thumbnail: '🎵' },
  { id: 'lofi2', name: 'Chill Beats', genre: 'chill', streamUrl: 'https://stream.nightride.fm/chillsynth.m4a', thumbnail: '🌙' },
  { id: 'lofi3', name: 'Deep Focus', genre: 'focus', streamUrl: 'https://stream.nightride.fm/spacesynth.m4a', thumbnail: '🚀' },
];

const MusicWidget: React.FC = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentStation.streamUrl);
      audioRef.current.volume = volume;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <Widget>
      <WidgetHeader
        title="Lofi Station"
        icon={<Music size={13} />}
        iconColor="var(--nova-pink)"
      />
      <WidgetBody>
        {/* Station Selector */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {STATIONS.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => {
                setCurrentStation(s);
                if (audioRef.current) {
                  audioRef.current.src = s.streamUrl;
                  if (isPlaying) audioRef.current.play().catch(() => {});
                }
              }}
              whileHover={{ scale: 1.02 }}
              style={{
                flex: 1,
                padding: '4px 2px',
                borderRadius: 6,
                border: `1px solid ${currentStation.id === s.id ? 'rgba(236,72,153,0.4)' : 'var(--border-subtle)'}`,
                background: currentStation.id === s.id ? 'rgba(236,72,153,0.08)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.62rem',
                fontFamily: 'JetBrains Mono',
                color: currentStation.id === s.id ? 'var(--nova-pink)' : 'var(--text-muted)',
                transition: 'all 120ms ease',
                textAlign: 'center',
              }}
            >
              {s.thumbnail} {s.name.split(' ')[0]}
            </motion.button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button
            onClick={togglePlay}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--nova-pink-dim), var(--nova-pink))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isPlaying ? '0 0 15px rgba(236,72,153,0.4)' : 'none',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause size={14} color="white" /> : <Play size={14} color="white" style={{ marginLeft: 2 }} />}
          </motion.button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentStation.name}
            </div>
            {isPlaying && (
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 10, marginTop: 4 }}>
                {[1, 2, 3, 4, 5, 6].map((b) => (
                  <motion.div
                    key={b}
                    style={{ width: 2, borderRadius: 1, background: 'var(--nova-pink)' }}
                    animate={{ height: [3, 8 + b * 1.5, 3] }}
                    transition={{ duration: 0.4 + b * 0.08, repeat: Infinity, ease: 'easeInOut', delay: b * 0.05 }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Volume2 size={11} color="var(--text-muted)" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 50, accentColor: 'var(--nova-pink)', height: 3, cursor: 'pointer' }}
            />
          </div>
        </div>
      </WidgetBody>
    </Widget>
  );
});

MusicWidget.displayName = 'MusicWidget';

// ============================================
// Stats Row Widget (Animated Count Ups)
// ============================================
const StatsRow: React.FC = memo(() => {
  const { todos } = useTodoStore();
  const { stats } = usePomodoroStore();
  const { snippets } = useSnippetStore();
  const { bookmarks } = useBookmarkStore();

  const items = [
    { label: 'Active Tasks', value: todos.filter((t) => !t.completed).length, icon: <CheckSquare size={13} />, color: 'var(--nova-cyan)' },
    { label: 'Focus sessions', value: stats.totalFocusSessions, icon: <Target size={13} />, color: 'var(--nova-purple)' },
    { label: 'Snippets', value: snippets.length, icon: <Terminal size={13} />, color: 'var(--nova-green)' },
    { label: 'Bookmarks', value: bookmarks.length, icon: <Bookmark size={13} />, color: 'var(--nova-pink)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="nova-card"
          style={{ padding: '12px 14px', borderLeft: `2px solid ${item.color}` }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          whileHover={{ borderColor: item.color, boxShadow: `0 4px 12px ${item.color}15` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
          </div>
          <div className="font-mono animate-count-up" style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {item.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

StatsRow.displayName = 'StatsRow';

// ============================================
// Dashboard Page
// ============================================
export const DashboardPage: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {/* Stats Row */}
      <StatsRow />

      {/* Quote */}
      {settings.showQuote && <QuoteWidget />}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <TodoWidget />
        <PomodoroWidget />
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <BookmarksWidget />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MusicWidget />
          <TerminalWidget />
        </div>
      </div>
    </motion.div>
  );
};
