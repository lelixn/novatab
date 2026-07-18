import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Globe,
  Github,
  Youtube,
  Package,
  BookOpen,
  Code,
  HelpCircle,
  Terminal,
  Calculator,
  Compass,
  Zap,
  Clipboard,
  History,
  CornerDownLeft,
} from 'lucide-react';
import { useUIStore, useSettingsStore } from '@store/index';
import { useSearchStore } from '../store/searchStore';
import { useTodoStore } from '@features/todo/store/todoStore';
import { usePomodoroStore } from '@features/pomodoro/store/pomodoroStore';
import { parseSearchQuery, buildSearchUrl } from '@shared/utils';

// ============================================
// Types
// ============================================
interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Commands' | 'Search Engines' | 'Calculator' | 'History' | 'Clipboard';
  icon: React.ReactNode;
  color: string;
  action: () => void;
  shortcutHint?: string;
}

// Math evaluation helper
const evaluateMath = (str: string): number | null => {
  const clean = str.replace(/[^0-9+\-*/().%\s]/g, '');
  if (!clean || clean.trim() === '' || /^[\s+\-*/().%]+$/.test(clean)) return null;
  try {
    const fn = new Function(`return (${clean})`);
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return val;
    }
  } catch {
    // Fail silently
  }
  return null;
};

// ============================================
// Universal Search Component
// ============================================
export const UniversalSearch: React.FC = () => {
  const { searchOpen, setSearchOpen, setActiveView, toggleFocusMode, focusMode } = useUIStore();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { clearCompleted } = useTodoStore();
  const { isRunning, setRunning, reset: resetPomodoro } = usePomodoroStore();
  const {
    recentSearches,
    clipboardHistory,
    addRecentSearch,
    addClipboardItem,
    clearSearchHistory,
    clearClipboardHistory,
  } = useSearchStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Focus input on open
  useEffect(() => {
    if (searchOpen) {
      setSelectedIndex(0);
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Global listener for toggling command palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Command palette entries list
  const listItems = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    // 1. Calculator/Math
    const mathQuery = query.startsWith('=') ? query.slice(1) : query;
    const mathResult = evaluateMath(mathQuery);
    if (mathResult !== null) {
      items.push({
        id: 'calculator-result',
        title: `Result: ${mathResult}`,
        description: `Mathematical expression result for "${mathQuery}"`,
        category: 'Calculator',
        icon: <Calculator size={14} />,
        color: 'var(--nova-yellow)',
        action: () => {
          navigator.clipboard.writeText(String(mathResult));
          addClipboardItem(String(mathResult));
          setSearchOpen(false);
        },
        shortcutHint: '↵ Copy',
      });
    }

    // 2. Navigation items
    const navs: { name: string; view: Parameters<typeof setActiveView>[0]; desc: string; col: string }[] = [
      { name: 'Dashboard Page', view: 'dashboard', desc: 'Main workspace and core metric widgets', col: 'var(--nova-purple)' },
      { name: 'Tasks Matrix', view: 'tasks', desc: 'Manage todos, priorities, categories, and due dates', col: 'var(--nova-cyan)' },
      { name: 'Pomodoro Deck', view: 'pomodoro', desc: 'Premium custom focus timer and daily stats', col: 'var(--nova-red)' },
      { name: 'GitHub Integration', view: 'github', desc: 'Contribution board, issue tracker, pull requests', col: 'var(--nova-green)' },
      { name: 'LeetCode Analytics', view: 'leetcode', desc: 'User profile heatmap and daily challenges', col: 'var(--nova-yellow)' },
      { name: 'Terminal Snippets', view: 'terminal', desc: 'Quick developer command snippet copy sheet', col: 'var(--nova-green)' },
      { name: 'Bookmarks List', view: 'bookmarks', desc: 'Speed dials, tags, and custom links list', col: 'var(--nova-pink)' },
      { name: 'System Settings', view: 'settings', desc: 'Change accent colors, widgets, backgrounds', col: 'var(--text-secondary)' },
    ];

    navs.forEach((n) => {
      items.push({
        id: `nav-${n.view}`,
        title: `Go to ${n.name}`,
        description: n.desc,
        category: 'Navigation',
        icon: <Compass size={14} />,
        color: n.col,
        action: () => {
          setActiveView(n.view);
          setSearchOpen(false);
        },
      });
    });

    // 3. Custom Commands
    const commandsList = [
      {
        id: 'cmd-focus',
        title: 'Toggle Focus Mode',
        description: focusMode ? 'Enable layout and display sidebar/header' : 'Hide sidebar and header for ultimate focus',
        action: () => toggleFocusMode(),
      },
      {
        id: 'cmd-particles',
        title: 'Toggle Stars Background',
        description: settings.showParticles ? 'Turn off parallax background stars' : 'Turn on animated cyberpunk stars',
        action: () => updateSettings({ showParticles: !settings.showParticles }),
      },
      {
        id: 'cmd-reset-settings',
        title: 'Reset Application Settings',
        description: 'Restore settings to factory defaults',
        action: () => resetSettings(),
      },
      {
        id: 'cmd-clear-done-tasks',
        title: 'Clear Completed Tasks',
        description: 'Permanently remove finished todos from local cache',
        action: () => clearCompleted(),
      },
      {
        id: 'cmd-pomodoro-toggle',
        title: isRunning ? 'Stop Pomodoro Focus Timer' : 'Start Pomodoro Focus Timer',
        description: isRunning ? 'Pause current active timer countdown' : 'Initiate focus timer countdown',
        action: () => setRunning(!isRunning),
      },
      {
        id: 'cmd-pomodoro-reset',
        title: 'Reset Pomodoro Session',
        description: 'Revert pomodoro session timers to defaults',
        action: () => resetPomodoro(),
      },
      {
        id: 'cmd-clear-search-history',
        title: 'Clear Command Palette Search History',
        description: 'Remove recent queries from command cache',
        action: () => clearSearchHistory(),
      },
      {
        id: 'cmd-clear-clipboard-history',
        title: 'Clear Clipboard Copy History',
        description: 'Flush locally stored terminal copied records',
        action: () => clearClipboardHistory(),
      },
    ];

    commandsList.forEach((c) => {
      items.push({
        id: c.id,
        title: c.title,
        description: c.description,
        category: 'Commands',
        icon: <Zap size={14} />,
        color: 'var(--accent)',
        action: () => {
          c.action();
          setSearchOpen(false);
        },
      });
    });

    // 4. Search Web / Engines
    const engines = [
      { id: 'google', name: 'Google Search', icon: <Globe size={14} />, color: '#4285f4' },
      { id: 'github', name: 'GitHub Search', icon: <Github size={14} />, color: '#a855f7' },
      { id: 'youtube', name: 'YouTube Search', icon: <Youtube size={14} />, color: '#ef4444' },
      { id: 'npm', name: 'npm Registry Search', icon: <Package size={14} />, color: '#ef4444' },
      { id: 'mdn', name: 'MDN Docs Search', icon: <BookOpen size={14} />, color: '#10b981' },
      { id: 'leetcode', name: 'LeetCode Search', icon: <Code size={14} />, color: '#f59e0b' },
      { id: 'stackoverflow', name: 'Stack Overflow Search', icon: <HelpCircle size={14} />, color: '#f97316' },
      { id: 'devdocs', name: 'DevDocs API Search', icon: <Terminal size={14} />, color: '#06b6d4' },
    ];

    engines.forEach((e) => {
      items.push({
        id: `engine-${e.id}`,
        title: `Search in ${e.name}`,
        description: `Perform search query on ${e.name} page`,
        category: 'Search Engines',
        icon: e.icon,
        color: e.color,
        action: () => {
          const { term } = parseSearchQuery(query);
          const url = buildSearchUrl(e.id, term || query);
          window.open(url, '_blank');
          addRecentSearch(query || 'Search: ' + e.name);
          setSearchOpen(false);
        },
      });
    });

    // 5. Search History
    recentSearches.forEach((h, idx) => {
      items.push({
        id: `history-${idx}`,
        title: h,
        description: 'Previous query from search logs',
        category: 'History',
        icon: <History size={14} />,
        color: 'var(--text-muted)',
        action: () => {
          setQuery(h);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        },
      });
    });

    // 6. Clipboard History
    clipboardHistory.forEach((c, idx) => {
      items.push({
        id: `clip-${idx}`,
        title: c,
        description: 'Copy command back to clipboard',
        category: 'Clipboard',
        icon: <Clipboard size={14} />,
        color: 'var(--nova-green)',
        action: () => {
          navigator.clipboard.writeText(c);
          setSearchOpen(false);
        },
        shortcutHint: '↵ Copy',
      });
    });

    return items;
  }, [
    query,
    focusMode,
    settings.showParticles,
    isRunning,
    recentSearches,
    clipboardHistory,
    setActiveView,
    setSearchOpen,
    toggleFocusMode,
    updateSettings,
    resetSettings,
    clearCompleted,
    setRunning,
    resetPomodoro,
    clearSearchHistory,
    clearClipboardHistory,
    addClipboardItem,
    addRecentSearch,
  ]);

  // Filter items in real time
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Default views: navigation, commands, recent clipboard
      return listItems.filter(
        (item) =>
          item.category === 'Navigation' ||
          item.category === 'Commands' ||
          item.category === 'Clipboard'
      );
    }

    const { term } = parseSearchQuery(query);
    const normalizedTerm = (term || query).toLowerCase().trim();

    return listItems.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedTerm) ||
        item.description.toLowerCase().includes(normalizedTerm) ||
        item.category.toLowerCase().includes(normalizedTerm)
    );
  }, [query, listItems]);

  // Handle keyboard scrolling / active index
  useEffect(() => {
    if (filteredItems.length === 0) return;
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(filteredItems.length - 1);
    }
  }, [filteredItems, selectedIndex]);

  // Ensure scroll into view
  useEffect(() => {
    if (itemsRef.current[selectedIndex] && scrollContainerRef.current) {
      const activeEl = itemsRef.current[selectedIndex];
      const container = scrollContainerRef.current;
      if (!activeEl) return;

      const activeTop = activeEl.offsetTop;
      const activeHeight = activeEl.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.offsetHeight;

      if (activeTop < containerScrollTop) {
        container.scrollTop = activeTop;
      } else if (activeTop + activeHeight > containerScrollTop + containerHeight) {
        container.scrollTop = activeTop + activeHeight - containerHeight;
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  // Group items by category to display nicely
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Flattened ordered categories list
  const orderedCategories = ['Calculator', 'Navigation', 'Commands', 'Search Engines', 'History', 'Clipboard'];

  // Keep track of total index dynamically for keyboard navigation
  let flatIndexCounter = 0;

  return (
    <AnimatePresence>
      <div
        className="nova-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSearchOpen(false);
        }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="nova-modal"
          style={{ width: '100%', maxWidth: 660, display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}
        >
          {/* Top input bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Search size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search views, run actions, calculate math, or search the web..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                caretColor: 'var(--accent)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
              >
                <X size={13} />
              </button>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '0.62rem',
              fontFamily: 'JetBrains Mono',
              color: 'var(--text-muted)',
            }}>
              esc
            </div>
          </div>

          {/* Results list */}
          <div
            ref={scrollContainerRef}
            className="nova-scroll"
            style={{ flex: 1, padding: 10, overflowY: 'auto' }}
          >
            {filteredItems.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                  No matching commands or pages found.
                </div>
              </div>
            ) : (
              orderedCategories.map((cat) => {
                const catItems = groupedItems[cat];
                if (!catItems || catItems.length === 0) return null;

                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    {/* Category Label */}
                    <div style={{
                      fontSize: '0.58rem',
                      fontFamily: 'JetBrains Mono',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '4px 8px 6px',
                    }}>
                      {cat}
                    </div>

                    {/* Category Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {catItems.map((item) => {
                        const currentFlatIndex = flatIndexCounter++;
                        const isSelected = selectedIndex === currentFlatIndex;

                        return (
                          <div
                            key={item.id}
                            ref={(el) => {
                              itemsRef.current[currentFlatIndex] = el;
                            }}
                            onClick={() => {
                              setSelectedIndex(currentFlatIndex);
                              item.action();
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                              borderLeft: `2px solid ${isSelected ? item.color : 'transparent'}`,
                              transition: 'background 120ms ease, border-left 120ms ease',
                            }}
                          >
                            {/* Icon */}
                            <div style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: isSelected ? 'transparent' : 'var(--bg-card-hover)',
                              border: `1px solid ${isSelected ? item.color + '50' : 'var(--border-subtle)'}`,
                              color: isSelected ? item.color : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              filter: isSelected ? `drop-shadow(0 0 4px ${item.color})` : 'none',
                            }}>
                              {item.icon}
                            </div>

                            {/* Text Details */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '0.82rem',
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {item.title}
                              </div>
                              <div style={{
                                fontSize: '0.68rem',
                                color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginTop: 1,
                              }}>
                                {item.description}
                              </div>
                            </div>

                            {/* Shortcut Badges */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'var(--bg-card-hover)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 4,
                                  padding: '2px 6px',
                                  fontSize: '0.62rem',
                                  fontFamily: 'JetBrains Mono',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {item.shortcutHint ? (
                                  <span>{item.shortcutHint}</span>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <span>Select</span>
                                    <CornerDownLeft size={8} />
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer hint */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              Press <kbd style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: 3, padding: '1px 4px', color: 'var(--accent)' }}>↑↓</kbd> to navigate, <kbd style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: 3, padding: '1px 4px', color: 'var(--accent)' }}>Enter</kbd> to select
            </span>
            <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              NOVA://SEARCH
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
