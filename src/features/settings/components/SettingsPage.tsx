import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Clock,
  Cloud,
  User,
  Github,
  Code2,
  Palette,
  Eye,
  Bell,
  Key,
} from 'lucide-react';
import { useSettingsStore } from '@store/index';
import type { AccentColor, ClockFormat, WeatherUnit } from '@shared/types';

// ============================================
// Section Wrapper
// ============================================
const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="nova-card" style={{ padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <div style={{ color: 'var(--nova-purple)' }}>{icon}</div>
      <h3 className="font-pixel" style={{ fontSize: '0.8rem', color: 'var(--nova-purple)', letterSpacing: '0.06em' }}>
        {title}
      </h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  </div>
);

// ============================================
// Toggle
// ============================================
interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
    <div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
      {description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
    </div>
    <motion.button
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        background: value ? 'linear-gradient(135deg, var(--nova-purple-dim), var(--nova-purple))' : 'var(--bg-card-hover)',
        border: `1px solid ${value ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        boxShadow: value ? '0 0 10px rgba(168,85,247,0.4)' : 'none',
        transition: 'all 200ms',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </motion.button>
  </div>
);

// ============================================
// Select Field
// ============================================
interface SelectFieldProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, description, value, options, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
      {description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="nova-input"
      style={{ width: 160, fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}
    >
      {options.map((o) => <option key={o.value} value={o.value} style={{ background: 'var(--bg-dark)' }}>{o.label}</option>)}
    </select>
  </div>
);

// ============================================
// Text Field
// ============================================
interface TextFieldProps {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  type?: string;
}

const TextField: React.FC<TextFieldProps> = ({ label, description, value, placeholder, onChange, type = 'text' }) => (
  <div>
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
      {description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="nova-input"
    />
  </div>
);

// ============================================
// Accent Color Picker
// ============================================
const ACCENT_COLORS: { value: AccentColor; hex: string; label: string }[] = [
  { value: 'purple', hex: '#a855f7', label: 'Purple' },
  { value: 'blue', hex: '#3b82f6', label: 'Blue' },
  { value: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { value: 'green', hex: '#10b981', label: 'Green' },
  { value: 'pink', hex: '#ec4899', label: 'Pink' },
];

import { ProfilePanel } from '../../auth/components/ProfilePanel';

// ============================================
// Settings Page
// ============================================
export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-purple)', marginBottom: 4 }}>
          SETTINGS & PROFILE
        </h2>
        <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Configure your NOVA://OS developer cockpit & connect your cloud profile
        </div>
      </div>

      {/* Profile/Auth Section */}
      <ProfilePanel />

      {/* Appearance */}
      <SettingSection title="APPEARANCE" icon={<Palette size={16} />}>
        {/* Accent Color */}
        <div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 10 }}>
            Accent Color
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {ACCENT_COLORS.map((c) => (
              <motion.button
                key={c.value}
                onClick={() => updateSettings({ accentColor: c.value })}
                title={c.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: c.hex,
                  border: settings.accentColor === c.value ? `3px solid white` : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: settings.accentColor === c.value ? `0 0 15px ${c.hex}80` : 'none',
                  transition: 'all 200ms',
                }}
              />
            ))}
          </div>
        </div>

        <Toggle
          label="Show Background Animation"
          description="Stars, moon, and particle effects"
          value={settings.showBackground}
          onChange={(v) => updateSettings({ showBackground: v })}
        />

        <Toggle
          label="Show Floating Particles"
          description="Animated particles in the background"
          value={settings.showParticles}
          onChange={(v) => updateSettings({ showParticles: v })}
        />
      </SettingSection>

      {/* General */}
      <SettingSection title="GENERAL" icon={<Settings size={16} />}>
        <TextField
          label="Your Name"
          description="Used in greeting message"
          value={settings.greetingName}
          placeholder="Developer"
          onChange={(v) => updateSettings({ greetingName: v })}
        />

        <SelectField
          label="Clock Format"
          description="12-hour or 24-hour clock"
          value={settings.clockFormat}
          options={[
            { value: '24h', label: '24-hour (23:59)' },
            { value: '12h', label: '12-hour (11:59 PM)' },
          ]}
          onChange={(v) => updateSettings({ clockFormat: v as ClockFormat })}
        />

        <Toggle
          label="Show Daily Quote"
          description="Inspirational quotes on the dashboard"
          value={settings.showQuote}
          onChange={(v) => updateSettings({ showQuote: v })}
        />
      </SettingSection>

      {/* Weather */}
      <SettingSection title="WEATHER" icon={<Cloud size={16} />}>
        <Toggle
          label="Show Weather"
          description="Display weather in the header"
          value={settings.showWeather}
          onChange={(v) => updateSettings({ showWeather: v })}
        />

        {settings.showWeather && (
          <>
            <TextField
              label="OpenWeather API Key"
              description="Free key from openweathermap.org"
              value={settings.openWeatherApiKey}
              placeholder="Your API key..."
              onChange={(v) => updateSettings({ openWeatherApiKey: v })}
              type="password"
            />

            <SelectField
              label="Temperature Unit"
              value={settings.weatherUnit}
              options={[
                { value: 'metric', label: 'Celsius (°C)' },
                { value: 'imperial', label: 'Fahrenheit (°F)' },
              ]}
              onChange={(v) => updateSettings({ weatherUnit: v as WeatherUnit })}
            />
          </>
        )}
      </SettingSection>

      {/* Integrations */}
      <SettingSection title="INTEGRATIONS" icon={<Key size={16} />}>
        <TextField
          label="GitHub Username"
          description="View your GitHub profile and repositories"
          value={settings.githubUsername}
          placeholder="your-github-username"
          onChange={(v) => updateSettings({ githubUsername: v })}
        />

        <TextField
          label="LeetCode Username"
          description="Track your coding challenge progress"
          value={settings.leetcodeUsername}
          placeholder="your-leetcode-username"
          onChange={(v) => updateSettings({ leetcodeUsername: v })}
        />
      </SettingSection>

      {/* About */}
      <div className="nova-card" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="font-pixel" style={{ fontSize: '1.1rem', color: 'var(--nova-purple)', marginBottom: 6 }}>
          NOVA://OS
        </div>
        <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          Developer Cockpit v1.0.0
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Built with React 19 · TypeScript · Framer Motion
        </div>
      </div>
    </div>
  );
};
