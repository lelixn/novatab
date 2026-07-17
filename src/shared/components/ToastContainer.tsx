import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '@store/index';
import type { NovaNotification } from '@shared/types';

const ICONS = {
  success: <CheckCircle size={16} color="var(--nova-green)" />,
  error: <AlertCircle size={16} color="var(--nova-red)" />,
  warning: <AlertTriangle size={16} color="var(--nova-yellow)" />,
  info: <Info size={16} color="var(--nova-cyan)" />,
};

const BORDER_COLORS = {
  success: 'rgba(16, 185, 129, 0.4)',
  error: 'rgba(239, 68, 68, 0.4)',
  warning: 'rgba(245, 158, 11, 0.4)',
  info: 'rgba(6, 182, 212, 0.4)',
};

const Toast: React.FC<{ notification: NovaNotification }> = ({ notification }) => {
  const { removeNotification } = useNotificationStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: 'var(--bg-glass)',
        border: `1px solid ${BORDER_COLORS[notification.type]}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        minWidth: 280,
        maxWidth: 380,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 20px ${BORDER_COLORS[notification.type]}, 0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[notification.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {notification.message}
        </div>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            style={{
              marginTop: 6,
              fontSize: '0.75rem',
              color: 'var(--nova-purple)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'JetBrains Mono',
            }}
          >
            {notification.action.label} →
          </button>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications } = useNotificationStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: notifications.length === 0 ? 'none' : 'all',
      }}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} />
        ))}
      </AnimatePresence>
    </div>
  );
};
