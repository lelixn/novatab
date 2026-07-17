import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TodoPriority } from '@shared/types';
export { chromeNotify, chromeStorage, chromeAlarm } from './chrome';

// Tailwind class merger
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

// Format time (seconds → mm:ss)
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Get time of day greeting
export const getGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good Morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}`;
  if (hour >= 17 && hour < 21) return `Good Evening, ${name}`;
  return `Good Night, ${name}`;
};

// Format date
export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format clock
export const formatClock = (date: Date, format: '12h' | '24h'): string => {
  if (format === '24h') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

// Priority color
export const getPriorityColor = (priority: TodoPriority): string => {
  const colors: Record<TodoPriority, string> = {
    low: 'var(--nova-green)',
    medium: 'var(--nova-yellow)',
    high: 'var(--nova-red)',
  };
  return colors[priority];
};

// Truncate text
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Debounce
export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Generate ID
export const generateId = (): string => crypto.randomUUID();

// Parse search prefix
export const parseSearchQuery = (query: string): { engine: string; term: string } => {
  const prefixMap: Record<string, string> = {
    'gh ': 'github',
    'yt ': 'youtube',
    'npm ': 'npm',
    'mdn ': 'mdn',
    'lc ': 'leetcode',
    'so ': 'stackoverflow',
    'dd ': 'devdocs',
  };
  for (const [prefix, engine] of Object.entries(prefixMap)) {
    if (query.toLowerCase().startsWith(prefix)) {
      return { engine, term: query.slice(prefix.length) };
    }
  }
  return { engine: 'google', term: query };
};

// Build search URL
export const buildSearchUrl = (engine: string, term: string): string => {
  const engines: Record<string, string> = {
    google: `https://www.google.com/search?q=${encodeURIComponent(term)}`,
    github: `https://github.com/search?q=${encodeURIComponent(term)}`,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`,
    npm: `https://www.npmjs.com/search?q=${encodeURIComponent(term)}`,
    mdn: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(term)}`,
    leetcode: `https://leetcode.com/search/?q=${encodeURIComponent(term)}`,
    stackoverflow: `https://stackoverflow.com/search?q=${encodeURIComponent(term)}`,
    devdocs: `https://devdocs.io/#q=${encodeURIComponent(term)}`,
  };
  return engines[engine] ?? engines.google;
};

// Relative time
export const relativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Clamp number
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Get favicon URL
export const getFaviconUrl = (url: string): string => {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return '';
  }
};
