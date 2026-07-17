import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
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
  Moon,
  Sun,
  Crosshair,
} from 'lucide-react';
import { useUIStore } from '@store/index';
import type { NavView } from '@shared/types';

interface NavItem {
  id: NavView;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: string | number;
  color?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'var(--nova-purple)' },
  { id: 'search', label: 'Search', icon: Search, color: 'var(--nova-blue)' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'var(--nova-cyan)' },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer, color: 'var(--nova-red)' },
  { id: 'github', label: 'GitHub', icon: Github, color: 'var(--nova-green)' },
  { id: 'leetcode', label: 'LeetCode', icon: Code2, color: 'var(--nova-yellow)' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'var(--nova-green)' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'var(--nova-pink)' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const { activeView, sidebarCollapsed, setActiveView, toggleSidebar, toggleFocusMode, focusMode } = useUIStore();

  return (
    <motion.aside
      className="nova-sidebar"
      animate={{ width: sidebarCollapsed ? 68 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden' }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 70,
        }}
      >
        <motion.div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--glow-purple)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap size={18} color="white" />
        </motion.div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <div
                className="font-pixel"
                style={{ fontSize: '0.85rem', color: 'var(--nova-purple)', lineHeight: 1.2, letterSpacing: '0.05em' }}
              >
                NOVA://OS
              </div>
              <div
                className="font-mono"
                style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}
              >
                DEVELOPER COCKPIT
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '6px 8px 8px',
              }}
            >
              Navigation
            </motion.div>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={sidebarCollapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}

        <div style={{ flex: 1 }} />
        <div className="nova-separator" />

        {BOTTOM_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={sidebarCollapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </nav>

      {/* Bottom Controls */}
      <div
        style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Focus Mode Toggle */}
        <motion.button
          className="nova-btn nova-btn-ghost"
          onClick={toggleFocusMode}
          style={{
            width: '100%',
            padding: '8px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: 10,
            background: focusMode ? 'rgba(168,85,247,0.12)' : 'transparent',
            borderColor: focusMode ? 'var(--border-glow)' : 'var(--border-subtle)',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          title="Toggle Focus Mode"
        >
          <Crosshair size={15} color={focusMode ? 'var(--nova-purple)' : 'var(--text-muted)'} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: '0.8rem',
                  color: focusMode ? 'var(--nova-purple)' : 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono',
                  whiteSpace: 'nowrap',
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
            padding: '8px',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              >
                v1.0.0
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarCollapsed ? (
            <ChevronRight size={14} color="var(--text-muted)" />
          ) : (
            <ChevronLeft size={14} color="var(--text-muted)" />
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

// ============================================
// NavButton
// ============================================
interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ item, isActive, collapsed, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: isActive
          ? 'rgba(168, 85, 247, 0.12)'
          : hovered
          ? 'rgba(168, 85, 247, 0.05)'
          : 'transparent',
        borderLeft: isActive ? '2px solid var(--nova-purple)' : '2px solid transparent',
        transition: 'all 150ms ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
      whileHover={{ x: isActive ? 0 : 2 }}
      whileTap={{ scale: 0.97 }}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator glow */}
      {isActive && (
        <motion.div
          layoutId="nav-glow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            background: 'rgba(168,85,247,0.05)',
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      <Icon
        size={16}
        className=""
        style={{
          color: isActive ? (item.color ?? 'var(--nova-purple)') : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
          flexShrink: 0,
          filter: isActive ? `drop-shadow(0 0 6px ${item.color ?? 'var(--nova-purple)'})` : 'none',
          transition: 'color 150ms, filter 150ms',
          position: 'relative',
          zIndex: 1,
        }}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize: '0.82rem',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              transition: 'color 150ms',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {collapsed && hovered && (
        <div className="nova-tooltip">{item.label}</div>
      )}
    </motion.button>
  );
};
