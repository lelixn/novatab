import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  AppSettings, 
  NavView, 
  NovaNotification, 
  User,
  AccentColor
} from '@shared/types';

// ============================================
// Settings Store
// ============================================
interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  clockFormat: '24h',
  weatherUnit: 'metric',
  accentColor: 'purple',
  showWeather: true,
  showQuote: true,
  showBackground: true,
  showParticles: true,
  greetingName: 'Developer',
  githubUsername: '',
  leetcodeUsername: '',
  openWeatherApiKey: '',
  focusMode: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'nova-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// UI / Navigation Store
// ============================================
interface UIStore {
  activeView: NavView;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  focusMode: boolean;
  setActiveView: (view: NavView) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleFocusMode: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      activeView: 'dashboard',
      sidebarCollapsed: false,
      searchOpen: false,
      focusMode: false,
      setActiveView: (view) => set({ activeView: view }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleFocusMode: () =>
        set((state) => ({ focusMode: !state.focusMode })),
    }),
    {
      name: 'nova-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
      }),
    }
  )
);

// ============================================
// Auth Store
// ============================================
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'nova-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// Notification Store
// ============================================
interface NotificationStore {
  notifications: NovaNotification[];
  addNotification: (notification: Omit<NovaNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    // Auto-remove after duration
    const duration = notification.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));

// ============================================
// Theme Store
// ============================================
interface ThemeStore {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      accentColor: 'purple',
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    { name: 'nova-theme' }
  )
);
