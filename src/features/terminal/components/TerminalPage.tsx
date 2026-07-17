import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Search, Terminal, Plus, Trash2, Star, Tag, ChevronDown } from 'lucide-react';
import type { TerminalSnippet, SnippetCategory } from '@shared/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@shared/utils';

// ============================================
// Snippet Store
// ============================================
interface SnippetStore {
  snippets: TerminalSnippet[];
  addSnippet: (s: Omit<TerminalSnippet, 'id'>) => void;
  deleteSnippet: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const DEFAULT_SNIPPETS: TerminalSnippet[] = [
  { id: '1', title: 'Git commit', command: 'git commit -m "feat: "', description: 'Create a conventional commit', category: 'git', tags: ['git', 'commit'], isFavorite: true },
  { id: '2', title: 'Git status', command: 'git status --short', description: 'Concise git status', category: 'git', tags: ['git'] },
  { id: '3', title: 'Git log pretty', command: "git log --oneline --graph --decorate --all", description: 'Pretty git log', category: 'git', tags: ['git', 'log'] },
  { id: '4', title: 'Git stash', command: 'git stash push -m "wip: description"', description: 'Stash with message', category: 'git', tags: ['git'] },
  { id: '5', title: 'Docker list containers', command: 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', description: 'List all containers', category: 'docker', tags: ['docker'] },
  { id: '6', title: 'Docker prune', command: 'docker system prune -af --volumes', description: 'Remove unused Docker data', category: 'docker', tags: ['docker', 'cleanup'] },
  { id: '7', title: 'Docker compose up', command: 'docker compose up -d --build', description: 'Start services in background', category: 'docker', tags: ['docker'] },
  { id: '8', title: 'npm install', command: 'npm install --legacy-peer-deps', description: 'Install with legacy peers', category: 'npm', tags: ['npm'] },
  { id: '9', title: 'npm run dev', command: 'npm run dev -- --host', description: 'Dev server with host flag', category: 'npm', tags: ['npm', 'dev'] },
  { id: '10', title: 'pnpm add', command: 'pnpm add -D @types/node', description: 'Add devDependency', category: 'pnpm', tags: ['pnpm'] },
  { id: '11', title: 'bun dev', command: 'bun run dev', description: 'Start Bun dev server', category: 'bun', tags: ['bun'] },
  { id: '12', title: 'Kill port 3000', command: 'lsof -ti:3000 | xargs kill -9', description: 'Kill process on port 3000', category: 'linux', tags: ['linux', 'port'] },
];

export const useSnippetStore = create<SnippetStore>()(
  persist(
    (set) => ({
      snippets: DEFAULT_SNIPPETS,
      addSnippet: (s) => set((state) => ({ snippets: [...state.snippets, { ...s, id: generateId() }] })),
      deleteSnippet: (id) => set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          snippets: state.snippets.map((s) => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s),
        })),
    }),
    { name: 'nova-snippets' }
  )
);

// ============================================
// Category Colors
// ============================================
const CAT_CONFIG: Record<SnippetCategory, { color: string; bg: string; label: string }> = {
  git: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: 'Git' },
  docker: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Docker' },
  npm: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'npm' },
  pnpm: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'pnpm' },
  bun: { color: '#f0e060', bg: 'rgba(240,224,96,0.1)', label: 'Bun' },
  linux: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Linux' },
  other: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'Other' },
};

const CATEGORIES: SnippetCategory[] = ['git', 'docker', 'npm', 'pnpm', 'bun', 'linux', 'other'];

// ============================================
// Copy Button
// ============================================
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={copy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.1)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(168,85,247,0.3)'}`,
        borderRadius: 6,
        padding: '4px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 200ms',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={copied ? 'check' : 'copy'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {copied ? <Check size={12} color="var(--nova-green)" /> : <Copy size={12} color="var(--nova-purple)" />}
        </motion.div>
      </AnimatePresence>
      <span
        className="font-mono"
        style={{ fontSize: '0.65rem', color: copied ? 'var(--nova-green)' : 'var(--nova-purple)' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </motion.button>
  );
};

// ============================================
// Terminal Page
// ============================================
export const TerminalPage: React.FC = () => {
  const { snippets, deleteSnippet, toggleFavorite } = useSnippetStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | 'all' | 'favorites'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: '', command: '', description: '', category: 'git' as SnippetCategory });
  const { addSnippet } = useSnippetStore();

  const filtered = snippets.filter((s) => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.command.toLowerCase().includes(search.toLowerCase()) || (s.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || (activeCategory === 'favorites' ? s.isFavorite : s.category === activeCategory);
    return matchSearch && matchCat;
  });

  const handleAdd = () => {
    if (!newSnippet.title || !newSnippet.command) return;
    addSnippet({ ...newSnippet, tags: [], isFavorite: false });
    setNewSnippet({ title: '', command: '', description: '', category: 'git' });
    setShowAddForm(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-green)' }}>
          TERMINAL SNIPPETS
        </h2>
        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          className="nova-btn nova-btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={15} />
          Add Snippet
        </motion.button>
      </div>

      {/* Add Snippet Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nova-card-glow"
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 className="font-pixel" style={{ fontSize: '0.75rem', color: 'var(--nova-cyan)' }}>NEW SNIPPET</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={newSnippet.title} onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })} placeholder="// Title" className="nova-input" />
                <select
                  value={newSnippet.category}
                  onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value as SnippetCategory })}
                  className="nova-input"
                  style={{ fontFamily: 'JetBrains Mono' }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: 'var(--bg-dark)' }}>{c}</option>)}
                </select>
              </div>
              <input value={newSnippet.command} onChange={(e) => setNewSnippet({ ...newSnippet, command: e.target.value })} placeholder="$ command --flags" className="nova-input" style={{ fontFamily: 'JetBrains Mono' }} />
              <input value={newSnippet.description} onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })} placeholder="// Description (optional)" className="nova-input" />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddForm(false)} className="nova-btn nova-btn-ghost">Cancel</button>
                <button onClick={handleAdd} className="nova-btn nova-btn-primary"><Plus size={14} />Save</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets..."
            className="nova-input"
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'favorites', ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as SnippetCategory | 'all' | 'favorites')}
              className="nova-chip"
              style={{
                cursor: 'pointer',
                background: activeCategory === cat ? (cat === 'all' || cat === 'favorites' ? 'rgba(168,85,247,0.15)' : CAT_CONFIG[cat as SnippetCategory]?.bg) : 'transparent',
                borderColor: activeCategory === cat ? (cat === 'all' || cat === 'favorites' ? 'var(--border-glow)' : CAT_CONFIG[cat as SnippetCategory]?.color + '60') : 'var(--border-subtle)',
                color: activeCategory === cat ? (cat === 'all' || cat === 'favorites' ? 'var(--nova-purple)' : CAT_CONFIG[cat as SnippetCategory]?.color) : 'var(--text-muted)',
              }}
            >
              {cat === 'favorites' ? '⭐ Favorites' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((snippet) => {
            const cfg = CAT_CONFIG[snippet.category];
            return (
              <motion.div
                key={snippet.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="nova-card"
                style={{ padding: '14px 16px' }}
                whileHover={{ borderColor: cfg.color + '50' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Terminal Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: cfg.bg,
                      border: `1px solid ${cfg.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Terminal size={15} color={cfg.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {snippet.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}30`,
                          fontFamily: 'JetBrains Mono',
                        }}
                      >
                        {cfg.label}
                      </span>
                      {snippet.isFavorite && <Star size={12} color="var(--nova-yellow)" fill="var(--nova-yellow)" />}
                    </div>

                    {snippet.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                        {snippet.description}
                      </div>
                    )}

                    {/* Command */}
                    <div className="nova-code" style={{ padding: '8px 12px', position: 'relative' }}>
                      <span style={{ color: 'var(--nova-green)', marginRight: 8 }}>$</span>
                      <span style={{ userSelect: 'all' }}>{snippet.command}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <CopyButton text={snippet.command} />
                    <motion.button
                      onClick={() => toggleFavorite(snippet.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      title="Toggle Favorite"
                    >
                      <Star size={14} color={snippet.isFavorite ? 'var(--nova-yellow)' : 'var(--text-muted)'} fill={snippet.isFavorite ? 'var(--nova-yellow)' : 'none'} />
                    </motion.button>
                    <motion.button
                      onClick={() => deleteSnippet(snippet.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="var(--text-muted)" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="nova-card" style={{ padding: 40, textAlign: 'center' }}>
            <Terminal size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No snippets found
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
