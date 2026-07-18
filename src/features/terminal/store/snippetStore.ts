import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TerminalSnippet, SnippetCategory } from '@shared/types';
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
  { id: '3', title: 'Git log pretty', command: 'git log --oneline --graph --decorate --all', description: 'Pretty git log', category: 'git', tags: ['git', 'log'] },
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
      addSnippet: (s) =>
        set((state) => ({ snippets: [...state.snippets, { ...s, id: generateId() }] })),
      deleteSnippet: (id) =>
        set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) })),
      toggleFavorite: (id) =>
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        })),
    }),
    { name: 'nova-snippets' }
  )
);
