import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  CheckSquare,
  Timer,
  Terminal,
  Bookmark,
  Github,
  Code2,
  Music,
  Play,
  Pause,
  Volume2,
  Loader2,
  ExternalLink,
  Target,
  Clock,
} from 'lucide-react';
import { useTodoStore } from '@features/todo/store/todoStore';
import { usePomodoroStore } from '@features/pomodoro/store/pomodoroStore';
import { useSnippetStore } from '@features/terminal/components/TerminalPage';
import { useBookmarkStore } from '@features/bookmarks/components/BookmarksPage';
import { useSettingsStore, useUIStore } from '@store/index';
import { formatTime, getFaviconUrl } from '@shared/utils';
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

const QuoteWidget: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = useState(() => new Date().getDate() % QUOTES.length);
  const quote = QUOTES[quoteIdx];

  return (
    <div className="nova-card" style={{ padding: '20px', gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            fontFamily: 'Pixelify Sans, monospace',
            fontSize: '2.5rem',
            color: 'var(--nova-purple)',
            lineHeight: 0.8,
            opacity: 0.4,
            flexShrink: 0,
          }}
        >
          "
        </div>
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8, fontStyle: 'italic' }}>
                {quote.text}
              </p>
              <p className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--nova-purple)' }}>
                — {quote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.button
          onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          whileHover={{ rotate: 180, color: 'var(--nova-purple)' }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw size={15} />
        </motion.button>
      </div>
    </div>
  );
};

// ============================================
// Todo Summary Widget
// ============================================
const TodoWidget: React.FC = () => {
  const { todos } = useTodoStore();
  const { setActiveView } = useUIStore();
  const active = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);
  const pct = todos.length > 0 ? (completed.length / todos.length) * 100 : 0;

  return (
    <div
      className="nova-card"
      style={{ padding: '18px', cursor: 'pointer' }}
      onClick={() => setActiveView('tasks')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckSquare size={16} color="var(--nova-cyan)" />
          <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>TASKS</span>
        </div>
        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--nova-cyan)' }}>{todos.length} total</span>
      </div>

      <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--nova-cyan)', marginBottom: 4 }}>
        {active.length}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>tasks remaining</div>

      <div className="nova-progress">
        <motion.div className="nova-progress-fill" style={{ background: 'linear-gradient(90deg, #0891b2, #06b6d4)' }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
        {Math.round(pct)}% done
      </div>

      {/* Recent tasks */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {active.slice(0, 3).map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.priority === 'high' ? 'var(--nova-red)' : t.priority === 'medium' ? 'var(--nova-yellow)' : 'var(--nova-green)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Pomodoro Widget
// ============================================
const PomodoroWidget: React.FC = () => {
  const { timeLeft, isRunning, mode, stats, setRunning } = usePomodoroStore();
  const { setActiveView } = useUIStore();

  const modeColors = { focus: 'var(--nova-purple)', short_break: 'var(--nova-green)', long_break: 'var(--nova-cyan)' };
  const color = modeColors[mode];

  return (
    <div className="nova-card" style={{ padding: '18px', cursor: 'pointer' }} onClick={() => setActiveView('pomodoro')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Timer size={16} color={color} />
          <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>POMODORO</span>
        </div>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setRunning(!isRunning); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </motion.button>
      </div>

      <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 300, color, textShadow: `0 0 20px ${color}60`, marginBottom: 4 }}>
        {formatTime(timeLeft)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, animation: isRunning ? 'pulse-glow 1.5s ease-in-out infinite' : 'none' }} />
        <span className="font-pixel" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {mode === 'focus' ? 'FOCUSING' : mode === 'short_break' ? 'SHORT BREAK' : 'LONG BREAK'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color }}>{stats.todaySessions}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>today</div>
        </div>
        <div>
          <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--nova-red)' }}>{stats.currentStreak}🔥</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>streak</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Quick Bookmarks Widget
// ============================================
const BookmarksWidget: React.FC = () => {
  const { bookmarks } = useBookmarkStore();
  const { setActiveView } = useUIStore();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <div className="nova-card" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bookmark size={16} color="var(--nova-pink)" />
          <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>BOOKMARKS</span>
        </div>
        <motion.button
          onClick={() => setActiveView('bookmarks')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}
          whileHover={{ color: 'var(--nova-pink)' }}
        >
          View all
        </motion.button>
      </div>
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
              whileHover={{ scale: 1.08, backgroundColor: 'var(--bg-card-hover)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                padding: '10px 6px',
                borderRadius: 8,
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-subtle)',
                textDecoration: 'none',
                transition: 'all 150ms',
              }}
            >
              <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!imgErrors.has(b.id) ? (
                  <img src={favicon} alt="" width={16} height={16} onError={() => setImgErrors(new Set([...imgErrors, b.id]))} />
                ) : (
                  <ExternalLink size={12} color="var(--text-muted)" />
                )}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {b.title}
              </span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Terminal Quick Access Widget
// ============================================
const TerminalWidget: React.FC = () => {
  const { snippets } = useSnippetStore();
  const { setActiveView } = useUIStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const favorites = snippets.filter((s) => s.isFavorite).slice(0, 4);

  const copy = async (id: string, cmd: string) => {
    await navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="nova-card" style={{ padding: '18px', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={16} color="var(--nova-green)" />
          <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>QUICK SNIPPETS</span>
        </div>
        <motion.button
          onClick={() => setActiveView('terminal')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono' }}
          whileHover={{ color: 'var(--nova-green)' }}
        >
          View all
        </motion.button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {favorites.map((s) => (
          <motion.div
            key={s.id}
            onClick={() => copy(s.id, s.command)}
            whileHover={{ borderColor: 'rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.04)' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '2px solid var(--nova-green)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            <span style={{ color: 'var(--nova-green)', fontFamily: 'JetBrains Mono', fontSize: '0.7rem' }}>$</span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.command}
            </span>
            <span style={{ fontSize: '0.62rem', color: copiedId === s.id ? 'var(--nova-green)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
              {copiedId === s.id ? '✓ copied' : 'click to copy'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// LoFi Music Widget
// ============================================
const STATIONS: MusicStation[] = [
  { id: 'lofi1', name: 'LoFi Hip Hop', genre: 'lofi', streamUrl: 'https://stream.nightride.fm/nightride.m4a', thumbnail: '🎵' },
  { id: 'lofi2', name: 'Chill Beats', genre: 'chill', streamUrl: 'https://stream.nightride.fm/chillsynth.m4a', thumbnail: '🌙' },
  { id: 'lofi3', name: 'Deep Focus', genre: 'focus', streamUrl: 'https://stream.nightride.fm/spacesynth.m4a', thumbnail: '🚀' },
];

const MusicWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStation, setCurrentStation] = useState(STATIONS[0]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

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

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="nova-card" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Music size={16} color="var(--nova-pink)" />
        <span className="font-pixel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>LOFI RADIO</span>
      </div>

      {/* Station selector */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
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
            whileHover={{ scale: 1.04 }}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 6,
              border: `1px solid ${currentStation.id === s.id ? 'rgba(236,72,153,0.5)' : 'var(--border-subtle)'}`,
              background: currentStation.id === s.id ? 'rgba(236,72,153,0.1)' : 'transparent',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontFamily: 'JetBrains Mono',
              color: currentStation.id === s.id ? 'var(--nova-pink)' : 'var(--text-muted)',
              transition: 'all 150ms',
              textAlign: 'center',
            }}
          >
            {s.thumbnail} {s.name}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          onClick={togglePlay}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #be185d, #ec4899)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isPlaying ? '0 0 20px rgba(236,72,153,0.5)' : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause size={16} color="white" /> : <Play size={16} color="white" />}
        </motion.button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>
            {currentStation.name}
          </div>
          {isPlaying && (
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
              {[1, 2, 3, 4, 5].map((b) => (
                <motion.div
                  key={b}
                  style={{ width: 3, borderRadius: 2, background: 'var(--nova-pink)' }}
                  animate={{ height: [4, 8 + b * 2, 4] }}
                  transition={{ duration: 0.5 + b * 0.1, repeat: Infinity, ease: 'easeInOut', delay: b * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Volume2 size={13} color="var(--text-muted)" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 60, accentColor: 'var(--nova-pink)' }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// Stats Row Widget
// ============================================
const StatsRow: React.FC = () => {
  const { todos } = useTodoStore();
  const { stats } = usePomodoroStore();
  const { snippets } = useSnippetStore();
  const { bookmarks } = useBookmarkStore();

  const items = [
    { label: 'Active Tasks', value: todos.filter((t) => !t.completed).length, icon: <CheckSquare size={14} />, color: 'var(--nova-cyan)' },
    { label: 'Focus Sessions', value: stats.totalFocusSessions, icon: <Target size={14} />, color: 'var(--nova-purple)' },
    { label: 'Snippets', value: snippets.length, icon: <Terminal size={14} />, color: 'var(--nova-green)' },
    { label: 'Bookmarks', value: bookmarks.length, icon: <Bookmark size={14} />, color: 'var(--nova-pink)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="nova-card"
          style={{ padding: '14px 16px' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ borderColor: item.color + '50' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ color: item.color }}>{item.icon}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{item.label}</span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 600, color: item.color }}>
            {item.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// Dashboard Page
// ============================================
export const DashboardPage: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Row */}
      <StatsRow />

      {/* Quote */}
      {settings.showQuote && <QuoteWidget />}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <TodoWidget />
        <PomodoroWidget />
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <BookmarksWidget />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MusicWidget />
          <TerminalWidget />
        </div>
      </div>
    </div>
  );
};
