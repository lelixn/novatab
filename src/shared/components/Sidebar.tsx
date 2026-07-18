import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Github,
  Code2,
  Terminal,
  Bookmark,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crosshair,
  Search,
} from 'lucide-react';
import { useUIStore } from '@store/index';
import type { NavView } from '@shared/types';

// ============================================
// Types
// ============================================
interface NavItem {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  shortcut?: string;
}

// ============================================
// Navigation Config
// ============================================
const MAIN_NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, color: 'var(--nova-purple)', shortcut: '1' },
  { id: 'search',     label: 'Search',      icon: Search,          color: 'var(--nova-blue)',   shortcut: 'K' },
  { id: 'tasks',      label: 'Tasks',       icon: CheckSquare,     color: 'var(--nova-cyan)',   shortcut: '2' },
  { id: 'pomodoro',   label: 'Pomodoro',    icon: Timer,           color: 'var(--nova-red)',    shortcut: '3' },
];

const DEV_NAV: NavItem[] = [
  { id: 'github',     label: 'GitHub',      icon: Github,          color: 'var(--nova-green)',  shortcut: '4' },
  { id: 'leetcode',   label: 'LeetCode',    icon: Code2,           color: 'var(--nova-yellow)', shortcut: '5' },
  { id: 'terminal',   label: 'Terminal',    icon: Terminal,        color: 'var(--nova-green)',  shortcut: '6' },
  { id: 'bookmarks',  label: 'Bookmarks',   icon: Bookmark,        color: 'var(--nova-pink)',   shortcut: '7' },
];

const SYSTEM_NAV: NavItem[] = [
  { id: 'settings',   label: 'Settings',    icon: Settings,        color: 'var(--text-secondary)' },
  { id: 'profile',    label: 'Profile',     icon: User,            color: 'var(--text-secondary)' },
];

// ============================================
// Sidebar Component
// ============================================
export const Sidebar: React.FC = memo(() => {
  const { activeView, sidebarCollapsed, setActiveView, toggleSidebar, toggleFocusMode, focusMode } = useUIStore();

  const isCollapsed = sidebarCollapsed;

  return (
    <motion.aside
      className="nova-sidebar"
      initial={false}
      animate={{ width: isCollapsed ? 68 : 220 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      aria-label="Main navigation"
    >
      {/* ── Logo ─────────────────────────────── */}
      <div style={{
        padding: '18px 14px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 64,
        flexShrink: 0,
      }}>
        <motion.div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--nova-purple-dim), var(--nova-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--glow-purple)',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setActiveView('dashboard')}
        >
          <Zap size={16} color="white" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}
            >
              <div className="font-pixel" style={{
                fontSize: '0.82rem',
                color: 'var(--nova-purple)',
                lineHeight: 1.2,
                letterSpacing: '0.06em',
                textShadow: '0 0 12px rgba(168,85,247,0.5)',
              }}>
                NOVA://OS
              </div>
              <div className="font-mono" style={{
                fontSize: '0.58rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                marginTop: 1,
              }}>
                DEVELOPER COCKPIT
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ───────────────────────── */}
      <nav
        style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}
        role="navigation"
      >
        {/* Main section */}
        <NavSection label="MAIN" collapsed={isCollapsed} />
        {MAIN_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={isCollapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}

        {/* Spacer */}
        <div style={{ height: 8 }} />
        <div className="nova-separator" />
        <div style={{ height: 4 }} />

        {/* Developer section */}
        <NavSection label="DEVELOPER" collapsed={isCollapsed} />
        {DEV_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={isCollapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}

        {/* Push system nav to bottom */}
        <div style={{ flex: 1 }} />
        <div className="nova-separator" />

        {/* System section */}
        {SYSTEM_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={isCollapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </nav>

      {/* ── Bottom Controls ───────────────────── */}
      <div style={{
        padding: '10px 8px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
      }}>
        {/* Focus Mode Toggle */}
        <motion.button
          className="nova-btn nova-btn-ghost"
          onClick={toggleFocusMode}
          style={{
            width: '100%',
            padding: '7px 10px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 9,
            background: focusMode ? 'rgba(168,85,247,0.1)' : 'transparent',
            borderColor: focusMode ? 'var(--border-glow)' : 'var(--border-subtle)',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          title="Toggle Focus Mode (F)"
          aria-label="Toggle Focus Mode"
          aria-pressed={focusMode}
        >
          <Crosshair size={14} color={focusMode ? 'var(--nova-purple)' : 'var(--text-muted)'} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{
                  fontSize: '0.78rem',
                  color: focusMode ? 'var(--nova-purple)' : 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                Focus Mode
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse Toggle */}
        <motion.button
          className="nova-btn nova-btn-ghost"
          onClick={toggleSidebar}
          style={{
            width: '100%',
            padding: '7px 10px',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono',
                  letterSpacing: '0.05em',
                }}
              >
                v1.0.0
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronRight size={13} color="var(--text-muted)" />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  );
});

Sidebar.displayName = 'Sidebar';

// ============================================
// Section Label
// ============================================
const NavSection: React.FC<{ label: string; collapsed: boolean }> = ({ label, collapsed }) => (
  <AnimatePresence>
    {!collapsed && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.58rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          padding: '4px 10px 4px',
          overflow: 'hidden',
        }}
      >
        {label}
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================
// NavButton
// ============================================
interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = memo(({ item, isActive, collapsed, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: isActive
          ? 'rgba(168, 85, 247, 0.12)'
          : hovered
          ? 'rgba(168, 85, 247, 0.05)'
          : 'transparent',
        borderLeft: isActive ? '2px solid var(--nova-purple)' : '2px solid transparent',
        transition: 'background 120ms ease, border-color 120ms ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}
      whileHover={{ x: isActive ? 0 : 1 }}
      whileTap={{ scale: 0.96 }}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active background glow */}
      {isActive && (
        <motion.div
          layoutId="nav-active-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            background: 'rgba(168,85,247,0.04)',
          }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Icon */}
      <Icon
        size={15}
        style={{
          color: isActive
            ? item.color
            : hovered
            ? 'var(--text-secondary)'
            : 'var(--text-muted)',
          flexShrink: 0,
          filter: isActive ? `drop-shadow(0 0 5px ${item.color})` : 'none',
          transition: 'color 120ms ease, filter 120ms ease',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.14 }}
            style={{
              fontSize: '0.8rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? 'var(--text-primary)'
                : hovered
                ? 'var(--text-secondary)'
                : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease',
              position: 'relative',
              zIndex: 1,
              flex: 1,
              textAlign: 'left',
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Shortcut hint */}
      {!collapsed && item.shortcut && hovered && !isActive && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: '0.58rem',
            fontFamily: 'JetBrains Mono',
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 3,
            padding: '1px 4px',
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {item.shortcut}
        </motion.span>
      )}

      {/* Collapsed tooltip */}
      {collapsed && hovered && (
        <div className="nova-tooltip" style={{ zIndex: 200 }}>
          {item.label}
          {item.shortcut && (
            <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.6rem' }}>
              [{item.shortcut}]
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
});

NavButton.displayName = 'NavButton';
