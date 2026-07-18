import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Zap,
  Wifi,
  WifiOff,
  Crosshair,
} from 'lucide-react';
import { useUIStore, useSettingsStore } from '@store/index';
import { formatClock, formatDate, getGreeting } from '@shared/utils';
import type { WeatherData } from '@shared/types';

// ============================================
// Header Component
// ============================================
export const Header: React.FC = memo(() => {
  const { setSearchOpen, setActiveView, activeView, focusMode } = useUIStore();
  const { settings } = useSettingsStore();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Online status
  useEffect(() => {
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Weather fetch
  useEffect(() => {
    if (settings.showWeather && settings.openWeatherApiKey) {
      fetchWeather();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.showWeather, settings.openWeatherApiKey, settings.weatherUnit]);

  const fetchWeather = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${settings.openWeatherApiKey}&units=${settings.weatherUnit}`
        );
        const data = await res.json();
        if (data.cod === 200) {
          setWeather({
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            city: data.name,
            country: data.sys.country,
          });
        }
      });
    } catch {
      // Fail silently
    }
  };

  const greeting = getGreeting(settings.greetingName);

  // Breadcrumb label
  const VIEW_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    search:    'Search',
    tasks:     'Tasks',
    pomodoro:  'Pomodoro',
    github:    'GitHub',
    leetcode:  'LeetCode',
    terminal:  'Terminal',
    bookmarks: 'Bookmarks',
    settings:  'Settings',
    profile:   'Profile',
  };

  return (
    <header className="nova-header" role="banner">
      {/* ── Left: Greeting + Breadcrumb ───────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <motion.div
          key={greeting}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span className="font-pixel" style={{
            fontSize: '0.82rem',
            color: 'var(--nova-purple)',
            textShadow: '0 0 12px rgba(168,85,247,0.5)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            {greeting}
          </span>
          {focusMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Crosshair size={11} color="var(--nova-purple)" />
              <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--nova-purple)' }}>
                FOCUS
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            NOVA://
          </span>
          <motion.span
            key={activeView}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono"
            style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
          >
            {VIEW_LABELS[activeView] ?? activeView}
          </motion.span>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            / {formatDate(time)}
          </span>
        </div>
      </div>

      {/* ── Center: Clock ─────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={formatClock(time, settings.clockFormat).slice(0, 5)}
            className="font-mono"
            style={{
              fontSize: '1.55rem',
              fontWeight: 300,
              color: 'var(--text-primary)',
              letterSpacing: '0.06em',
              textShadow: '0 0 30px rgba(168,85,247,0.25)',
              lineHeight: 1,
            }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatClock(time, settings.clockFormat)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Right: Actions ────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Online Status */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          title={online ? 'Connected' : 'Offline'}
        >
          {online ? (
            <Wifi size={12} color="var(--nova-green)" />
          ) : (
            <WifiOff size={12} color="var(--nova-red)" />
          )}
        </div>

        {/* Weather Chip */}
        <AnimatePresence>
          {weather && settings.showWeather && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="nova-chip"
              style={{ cursor: 'default', gap: 6 }}
              title={`${weather.description} · ${weather.humidity}% humidity`}
            >
              <WeatherIcon icon={weather.icon} />
              <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {weather.temp}°{settings.weatherUnit === 'metric' ? 'C' : 'F'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {weather.city}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Trigger */}
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="nova-btn nova-btn-ghost nova-btn-sm"
          style={{ gap: 8, fontFamily: 'JetBrains Mono' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          title="Open Search (Ctrl+K)"
          aria-label="Open search palette"
        >
          <Search size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ctrl+K</span>
        </motion.button>

        {/* Profile Avatar */}
        <motion.button
          className="nova-btn nova-btn-circle"
          onClick={() => setActiveView('settings')}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            background: 'linear-gradient(135deg, var(--nova-purple-dim), var(--nova-purple))',
            boxShadow: '0 0 12px rgba(168,85,247,0.35)',
            flexShrink: 0,
          }}
          whileHover={{ scale: 1.06, boxShadow: '0 0 22px rgba(168,85,247,0.55)' }}
          whileTap={{ scale: 0.93 }}
          title="Settings"
          aria-label="Open settings"
        >
          <User size={14} color="white" />
        </motion.button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

// ============================================
// Weather Icon Mapper
// ============================================
const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => {
  if (icon.includes('01') || icon.includes('02')) return <Sun size={13} color="var(--nova-yellow)" />;
  if (icon.includes('09') || icon.includes('10')) return <CloudRain size={13} color="var(--nova-blue)" />;
  if (icon.includes('13')) return <CloudSnow size={13} color="#a5f3fc" />;
  if (icon.includes('11')) return <Zap size={13} color="var(--nova-yellow)" />;
  return <Cloud size={13} color="var(--text-muted)" />;
};
