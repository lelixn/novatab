// ============================================
// NOVA://OS — Shared Types
// ============================================

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Auth ---
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// --- Todo ---
export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoCategory = 'work' | 'personal' | 'learning' | 'health' | 'other';
export type TodoStatus = 'pending' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  category: TodoCategory;
  deadline?: string;
  tags?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// --- Pomodoro ---
export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSession {
  id: string;
  mode: PomodoroMode;
  duration: number;
  completedAt: string;
  taskTitle?: string;
}

export interface PomodoroStats {
  totalFocusSessions: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
  todaySessions: number;
}

// --- Weather ---
export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  country: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  icon: string;
  description: string;
}

// --- GitHub ---
export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
  topics?: string[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

// --- LeetCode ---
export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  acceptanceRate: number;
  ranking: number;
  streak: number;
}

export interface LeetCodeDailyChallenge {
  titleSlug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
  date: string;
}

// --- Search ---
export type SearchEngine = 'google' | 'github' | 'leetcode' | 'stackoverflow' | 'youtube' | 'npm' | 'mdn' | 'devdocs';

export interface SearchEngineConfig {
  id: SearchEngine;
  name: string;
  prefix: string;
  icon: string;
  url: string;
  color: string;
  description: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  type: 'web' | 'bookmark' | 'command' | 'navigation';
}

// --- Bookmark ---
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  category?: string;
  order: number;
  addedAt: string;
}

// --- Terminal Snippet ---
export type SnippetCategory = 'git' | 'docker' | 'npm' | 'pnpm' | 'bun' | 'linux' | 'other';

export interface TerminalSnippet {
  id: string;
  title: string;
  command: string;
  description?: string;
  category: SnippetCategory;
  tags?: string[];
  isFavorite?: boolean;
}

// --- Quote ---
export interface Quote {
  text: string;
  author: string;
  category?: string;
}

// --- Settings ---
export type ClockFormat = '12h' | '24h';
export type WeatherUnit = 'metric' | 'imperial';
export type AccentColor = 'purple' | 'blue' | 'cyan' | 'green' | 'pink';
export type NavView = 
  | 'dashboard'
  | 'search'
  | 'tasks'
  | 'pomodoro'
  | 'github'
  | 'leetcode'
  | 'terminal'
  | 'bookmarks'
  | 'settings'
  | 'profile';

export interface AppSettings {
  clockFormat: ClockFormat;
  weatherUnit: WeatherUnit;
  accentColor: AccentColor;
  showWeather: boolean;
  showQuote: boolean;
  showBackground: boolean;
  showParticles: boolean;
  greetingName: string;
  githubUsername: string;
  leetcodeUsername: string;
  openWeatherApiKey: string;
  focusMode: boolean;
}

// --- API Response ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// --- Notification ---
export interface NovaNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: { label: string; onClick: () => void };
}

// --- Music ---
export type MusicStation = {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  thumbnail: string;
};
