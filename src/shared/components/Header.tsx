import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, Cloud, CloudRain, Sun, CloudSnow, Zap } from 'lucide-react';
import { useUIStore, useSettingsStore } from '@store/index';
import { formatClock, formatDate, getGreeting } from '@shared/utils';
import type { WeatherData } from '@shared/types';

// ============================================
// Header Component
// ============================================
export const Header: React.FC = () => {
  const { setSearchOpen, setActiveView } = useUIStore();
  const { settings } = useSettingsStore();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings.showWeather && settings.openWeatherApiKey) {
      fetchWeather();
    }
  }, [settings.showWeather, settings.openWeatherApiKey]);

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

  return (
    <header className="nova-header">
      {/* Left: Greeting + Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <motion.h1
          key={greeting}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel"
          style={{
            fontSize: '0.9rem',
            color: 'var(--nova-purple)',
            textShadow: '0 0 15px rgba(168,85,247,0.5)',
            letterSpacing: '0.04em',
          }}
        >
          {greeting}
        </motion.h1>
        <div
          className="font-mono"
          style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}
        >
          {formatDate(time)}
        </div>
      </div>

      {/* Center: Clock */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <motion.div
          className="font-mono"
          style={{
            fontSize: '1.6rem',
            fontWeight: 300,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textShadow: '0 0 30px rgba(168,85,247,0.3)',
          }}
          key={formatClock(time, settings.clockFormat)}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
        >
          {formatClock(time, settings.clockFormat)}
        </motion.div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Weather Chip */}
        <AnimatePresence>
          {weather && settings.showWeather && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="nova-chip"
              style={{ cursor: 'default' }}
            >
              <WeatherIcon icon={weather.icon} />
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {weather.temp}°{settings.weatherUnit === 'metric' ? 'C' : 'F'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {weather.city}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Trigger */}
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="nova-btn nova-btn-ghost"
          style={{ gap: 8, padding: '6px 12px' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          title="Open Search (Ctrl+K)"
        >
          <Search size={14} color="var(--text-muted)" />
          <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Ctrl+K
          </span>
        </motion.button>

        {/* Profile Avatar */}
        <motion.button
          className="nova-btn"
          onClick={() => setActiveView('settings')}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            padding: 0,
            background: 'linear-gradient(135deg, var(--nova-purple-dim), var(--nova-purple))',
            boxShadow: '0 0 15px rgba(168,85,247,0.4)',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168,85,247,0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <User size={15} color="white" />
        </motion.button>
      </div>
    </header>
  );
};

// ============================================
// Weather Icon Mapper
// ============================================
const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => {
  if (icon.includes('01') || icon.includes('02')) return <Sun size={14} color="var(--nova-yellow)" />;
  if (icon.includes('09') || icon.includes('10')) return <CloudRain size={14} color="var(--nova-blue)" />;
  if (icon.includes('13')) return <CloudSnow size={14} color="#a5f3fc" />;
  if (icon.includes('11')) return <Zap size={14} color="var(--nova-yellow)" />;
  return <Cloud size={14} color="var(--text-muted)" />;
};
