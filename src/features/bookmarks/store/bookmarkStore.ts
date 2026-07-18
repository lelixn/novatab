import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark } from '@shared/types';
import { generateId, getFaviconUrl } from '@shared/utils';

// ============================================
// Bookmark Store
// ============================================
interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (b: Omit<Bookmark, 'id' | 'order' | 'addedAt'>) => void;
  deleteBookmark: (id: string) => void;
  reorder: (bookmarks: Bookmark[]) => void;
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', favicon: 'https://github.com/favicon.ico', order: 0, addedAt: new Date().toISOString() },
  { id: '2', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', order: 1, addedAt: new Date().toISOString() },
  { id: '3', title: 'npm Registry', url: 'https://npmjs.com', order: 2, addedAt: new Date().toISOString() },
  { id: '4', title: 'LeetCode', url: 'https://leetcode.com', order: 3, addedAt: new Date().toISOString() },
  { id: '5', title: 'Vercel', url: 'https://vercel.com', order: 4, addedAt: new Date().toISOString() },
  { id: '6', title: 'Linear', url: 'https://linear.app', order: 5, addedAt: new Date().toISOString() },
];

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set) => ({
      bookmarks: DEFAULT_BOOKMARKS,
      addBookmark: (b) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...b,
              id: generateId(),
              order: state.bookmarks.length,
              addedAt: new Date().toISOString(),
              favicon: b.favicon ?? getFaviconUrl(b.url),
            },
          ],
        })),
      deleteBookmark: (id) =>
        set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) })),
      reorder: (bookmarks) => set({ bookmarks }),
    }),
    { name: 'nova-bookmarks' }
  )
);
