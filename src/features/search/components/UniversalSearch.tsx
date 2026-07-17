import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ArrowRight,
  Globe,
  Github,
  Youtube,
  Package,
  BookOpen,
  Code,
  HelpCircle,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useUIStore } from '@store/index';
import { parseSearchQuery, buildSearchUrl, debounce } from '@shared/utils';

// ============================================
// Search Engine Configs
// ============================================
interface SearchEngine {
  id: string;
  name: string;
  prefix: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', prefix: '', icon: <Globe size={14} />, color: '#4285f4', placeholder: 'Search the web...' },
  { id: 'github', name: 'GitHub', prefix: 'gh ', icon: <Github size={14} />, color: '#a855f7', placeholder: 'Search repositories...' },
  { id: 'youtube', name: 'YouTube', prefix: 'yt ', icon: <Youtube size={14} />, color: '#ef4444', placeholder: 'Search videos...' },
  { id: 'npm', name: 'npm', prefix: 'npm ', icon: <Package size={14} />, color: '#ef4444', placeholder: 'Search packages...' },
  { id: 'mdn', name: 'MDN', prefix: 'mdn ', icon: <BookOpen size={14} />, color: '#10b981', placeholder: 'Search MDN docs...' },
  { id: 'leetcode', name: 'LeetCode', prefix: 'lc ', icon: <Code size={14} />, color: '#f59e0b', placeholder: 'Search problems...' },
  { id: 'stackoverflow', name: 'Stack Overflow', prefix: 'so ', icon: <HelpCircle size={14} />, color: '#f97316', placeholder: 'Search answers...' },
  { id: 'devdocs', name: 'DevDocs', prefix: 'dd ', icon: <Terminal size={14} />, color: '#06b6d4', placeholder: 'Search DevDocs...' },
];

// ============================================
// Quick Actions
// ============================================
const QUICK_ACTIONS = [
  { label: 'GitHub', hint: 'gh ', icon: <Github size={14} />, color: '#a855f7' },
  { label: 'YouTube', hint: 'yt ', icon: <Youtube size={14} />, color: '#ef4444' },
  { label: 'npm', hint: 'npm ', icon: <Package size={14} />, color: '#ef4444' },
  { label: 'MDN', hint: 'mdn ', icon: <BookOpen size={14} />, color: '#10b981' },
  { label: 'LeetCode', hint: 'lc ', icon: <Code size={14} />, color: '#f59e0b' },
  { label: 'Stack Overflow', hint: 'so ', icon: <HelpCircle size={14} />, color: '#f97316' },
];

// ============================================
// Universal Search Modal
// ============================================
export const UniversalSearch: React.FC = () => {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveEngine(SEARCH_ENGINES[0]);
    }
  }, [searchOpen]);

  // Detect engine from prefix
  useEffect(() => {
    const { engine } = parseSearchQuery(query);
    const found = SEARCH_ENGINES.find((e) => e.id === engine) ?? SEARCH_ENGINES[0];
    setActiveEngine(found);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    const { engine, term } = parseSearchQuery(query);
    const url = buildSearchUrl(engine, term);
    window.open(url, '_blank');
    setSearchOpen(false);
  }, [query, setSearchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const applyPrefix = (prefix: string) => {
    setQuery(prefix);
    inputRef.current?.focus();
  };

  if (!searchOpen) return null;

  const displayQuery = query.replace(activeEngine.prefix, '');

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => { if (e.target === overlayRef.current) setSearchOpen(false); }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 4, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '12vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{
            width: '100%',
            maxWidth: 680,
            background: 'rgba(10, 16, 32, 0.98)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(168,85,247,0.2), 0 30px 80px rgba(0,0,0,0.7)',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {/* Active Engine Icon */}
            <motion.div
              key={activeEngine.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: activeEngine.color, flexShrink: 0 }}
            >
              {activeEngine.icon}
            </motion.div>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeEngine.placeholder}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                caretColor: 'var(--nova-purple)',
              }}
              autoComplete="off"
              spellCheck={false}
            />

            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <X size={14} />
              </motion.button>
            )}

            <motion.button
              onClick={handleSearch}
              className="nova-btn nova-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Search
              <ArrowRight size={13} />
            </motion.button>
          </div>

          {/* Engine Prefix Chips */}
          <div
            style={{
              padding: '12px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.hint}
                onClick={() => applyPrefix(action.hint)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 10px',
                  background: 'rgba(168,85,247,0.04)',
                  border: `1px solid ${
                    activeEngine.id === action.hint.trim() ? action.color : 'var(--border-subtle)'
                  }`,
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: activeEngine.id === action.hint.trim() ? action.color : 'var(--text-muted)',
                  transition: 'all 150ms',
                }}
              >
                <span style={{ color: action.color }}>{action.icon}</span>
                {action.label}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                  "{action.hint.trim()}"
                </span>
              </motion.button>
            ))}
          </div>

          {/* Active Engine Info */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div
                key={activeEngine.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  background: `${activeEngine.color}15`,
                  border: `1px solid ${activeEngine.color}40`,
                  borderRadius: 6,
                }}
              >
                <span style={{ color: activeEngine.color }}>{activeEngine.icon}</span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.72rem',
                    color: activeEngine.color,
                  }}
                >
                  {activeEngine.name}
                </span>
              </motion.div>

              {query && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  → "{displayQuery || query}"
                </motion.div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                fontFamily: 'JetBrains Mono',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>↵ search</span>
              <span>esc close</span>
            </div>
          </div>

          {/* Search Engines Grid */}
          <div
            style={{
              padding: '8px 20px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {SEARCH_ENGINES.map((engine) => (
              <motion.button
                key={engine.id}
                onClick={() => {
                  if (query.trim()) {
                    const { term } = parseSearchQuery(query);
                    window.open(buildSearchUrl(engine.id, term), '_blank');
                    setSearchOpen(false);
                  } else {
                    applyPrefix(engine.prefix);
                  }
                }}
                whileHover={{ scale: 1.03, backgroundColor: `${engine.color}10` }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 6px',
                  background: activeEngine.id === engine.id ? `${engine.color}12` : 'rgba(168,85,247,0.03)',
                  border: `1px solid ${activeEngine.id === engine.id ? engine.color + '50' : 'var(--border-subtle)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <span style={{ color: engine.color }}>{engine.icon}</span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.62rem',
                    color: activeEngine.id === engine.id ? engine.color : 'var(--text-muted)',
                  }}
                >
                  {engine.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
