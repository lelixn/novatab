import React, { memo } from 'react';
import { motion } from 'framer-motion';

// ============================================
// Widget Props Types
// ============================================
export interface WidgetProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Enable glow border variant */
  glow?: boolean;
  /** Make the widget clickable */
  onClick?: () => void;
  /** Entrance animation */
  animate?: boolean;
  /** Animation delay for stagger */
  delay?: number;
}

export interface WidgetHeaderProps {
  title: string;
  icon?: React.ReactNode;
  iconColor?: string;
  badge?: string | number;
  badgeColor?: string;
  actions?: React.ReactNode;
  /** Override padding */
  compact?: boolean;
}

export interface WidgetBodyProps {
  children: React.ReactNode;
  noPadding?: boolean;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

export interface WidgetFooterProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// ============================================
// Widget (Base Container)
// ============================================
export const Widget: React.FC<WidgetProps> = memo(({
  children,
  className = '',
  style,
  glow = false,
  onClick,
  animate = true,
  delay = 0,
}) => {
  const content = (
    <div
      className={`nova-widget ${glow ? 'nova-card-glow' : ''} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {content}
    </motion.div>
  );
});

Widget.displayName = 'Widget';

// ============================================
// WidgetHeader
// ============================================
export const WidgetHeader: React.FC<WidgetHeaderProps> = memo(({
  title,
  icon,
  iconColor = 'var(--accent)',
  badge,
  badgeColor = 'var(--accent)',
  actions,
  compact = false,
}) => (
  <div
    className="nova-widget-header"
    style={{ padding: compact ? 'var(--space-3) var(--space-4)' : undefined }}
  >
    <div className="nova-widget-title">
      {icon && (
        <span style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      <span>{title}</span>
      {badge !== undefined && (
        <span
          className="font-mono"
          style={{
            fontSize: '0.62rem',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
            background: `${badgeColor}18`,
            color: badgeColor,
            border: `1px solid ${badgeColor}30`,
            letterSpacing: '0.04em',
          }}
        >
          {badge}
        </span>
      )}
    </div>
    {actions && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {actions}
      </div>
    )}
  </div>
));

WidgetHeader.displayName = 'WidgetHeader';

// ============================================
// WidgetBody
// ============================================
export const WidgetBody: React.FC<WidgetBodyProps> = memo(({
  children,
  noPadding = false,
  scrollable = false,
  style,
}) => (
  <div
    className={`nova-widget-body ${scrollable ? 'nova-scroll' : ''}`}
    style={{
      padding: noPadding ? 0 : undefined,
      overflow: scrollable ? 'auto' : 'visible',
      ...style,
    }}
  >
    {children}
  </div>
));

WidgetBody.displayName = 'WidgetBody';

// ============================================
// WidgetFooter
// ============================================
export const WidgetFooter: React.FC<WidgetFooterProps> = memo(({ children, style }) => (
  <div className="nova-widget-footer" style={style}>
    {children}
  </div>
));

WidgetFooter.displayName = 'WidgetFooter';

// ============================================
// WidgetLoading (Shimmer Skeleton)
// ============================================
export interface WidgetLoadingProps {
  rows?: number;
  height?: number | string;
}

export const WidgetLoading: React.FC<WidgetLoadingProps> = memo(({
  rows = 4,
  height = 14,
}) => (
  <div className="nova-widget" style={{ padding: 'var(--space-5)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="nova-skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
        <div className="nova-skeleton" style={{ width: 80, height: 10 }} />
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="nova-skeleton"
          style={{
            height,
            width: `${100 - (i % 3) * 15}%`,
            opacity: 1 - i * 0.1,
          }}
        />
      ))}
    </div>
  </div>
));

WidgetLoading.displayName = 'WidgetLoading';

// ============================================
// WidgetError
// ============================================
export interface WidgetErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export const WidgetError: React.FC<WidgetErrorProps> = memo(({
  title = 'Something went wrong',
  message,
  onRetry,
  icon = '⚠️',
}) => (
  <div className="nova-widget" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
    <div className="font-pixel" style={{ fontSize: '0.78rem', color: 'var(--nova-red)', marginBottom: 6 }}>
      {title}
    </div>
    {message && (
      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 14 }}>
        {message}
      </div>
    )}
    {onRetry && (
      <button className="nova-btn nova-btn-ghost nova-btn-sm" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
));

WidgetError.displayName = 'WidgetError';

// ============================================
// WidgetEmpty
// ============================================
export interface WidgetEmptyProps {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const WidgetEmpty: React.FC<WidgetEmptyProps> = memo(({
  icon = '📭',
  title = 'Nothing here',
  description,
  action,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ textAlign: 'center', padding: 'var(--space-8)' }}
  >
    <div style={{ fontSize: '2rem', marginBottom: 10 }}>{icon}</div>
    <div className="font-pixel" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
      {title}
    </div>
    {description && (
      <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        {description}
      </div>
    )}
    {action}
  </motion.div>
));

WidgetEmpty.displayName = 'WidgetEmpty';

// ============================================
// WidgetSkeleton (single-line)
// ============================================
export const WidgetSkeleton: React.FC<{ width?: string | number; height?: string | number }> = ({
  width = '100%',
  height = 14,
}) => (
  <div className="nova-skeleton" style={{ width, height }} />
);
