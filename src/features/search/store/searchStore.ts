import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchStore {
  recentSearches: string[];
  clipboardHistory: string[];
  addRecentSearch: (query: string) => void;
  addClipboardItem: (text: string) => void;
  clearSearchHistory: () => void;
  clearClipboardHistory: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      recentSearches: ['git commit', 'docker compose', 'css grid cheat sheet'],
      clipboardHistory: [
        'git commit -m "feat: upgrade background"',
        'npm run dev',
        'docker ps -a',
      ],
      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const filtered = state.recentSearches.filter((s) => s !== trimmed);
          return { recentSearches: [trimmed, ...filtered].slice(0, 10) };
        }),
      addClipboardItem: (text) =>
        set((state) => {
          const trimmed = text.trim();
          if (!trimmed) return state;
          const filtered = state.clipboardHistory.filter((s) => s !== trimmed);
          return { clipboardHistory: [trimmed, ...filtered].slice(0, 10) };
        }),
      clearSearchHistory: () => set({ recentSearches: [] }),
      clearClipboardHistory: () => set({ clipboardHistory: [] }),
    }),
    {
      name: 'nova-search-store',
    }
  )
);
