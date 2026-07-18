import React, { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, Cpu, MemoryStick } from 'lucide-react';

// ============================================
// Footer Component
// ============================================
export const Footer: React.FC = memo(() => {
  const [online, setOnline] = useState(navigator.onLine);
  const [memUsage, setMemUsage] = useState<number | null>(null);
  const [cpuMock, setCpuMock] = useState(0);
  const [uptime, setUptime] = useState(0);

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

  // Memory usage (Chrome only via performance.memory)
  useEffect(() => {
    const updateMem = () => {
      const perf = performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      };
      if (perf.memory) {
        const used = perf.memory.usedJSHeapSize / 1024 / 1024;
        setMemUsage(Math.round(used));
      }
    };
    updateMem();
    const interval = setInterval(updateMem, 5000);
    return () => clearInterval(interval);
  }, []);

  // CPU mock (simulated fluctuation)
  useEffect(() => {
    const update = () => {
      setCpuMock((prev) => {
        const delta = (Math.random() - 0.5) * 15;
        return Math.min(90, Math.max(5, prev + delta));
      });
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  // Uptime counter (seconds since page load)
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const cpuColor = cpuMock > 70 ? 'var(--nova-red)' : cpuMock > 40 ? 'var(--nova-yellow)' : 'var(--nova-green)';

  return (
    <footer className="nova-footer" role="contentinfo" aria-label="System status">
      {/* Left: Version + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          NOVA://OS <span style={{ color: 'var(--nova-purple)' }}>v1.0.0</span>
        </span>

        <div className="nova-separator-v" style={{ height: 12 }} />

        {/* Online status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <motion.div
            animate={online ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {online ? (
              <Wifi size={10} color="var(--nova-green)" />
            ) : (
              <WifiOff size={10} color="var(--nova-red)" />
            )}
          </motion.div>
          <span className="font-mono" style={{ fontSize: '0.6rem', color: online ? 'var(--nova-green)' : 'var(--nova-red)' }}>
            {online ? 'online' : 'offline'}
          </span>
        </div>
      </div>

      {/* Center: System Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* CPU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} title={`CPU: ${Math.round(cpuMock)}%`}>
          <Cpu size={10} color={cpuColor} />
          <span className="font-mono" style={{ fontSize: '0.6rem', color: cpuColor }}>
            {Math.round(cpuMock)}%
          </span>
          {/* Mini bar */}
          <div style={{ width: 32, height: 3, background: 'var(--bg-card-hover)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: cpuColor, borderRadius: 2 }}
              animate={{ width: `${cpuMock}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Memory */}
        {memUsage !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} title={`Memory: ${memUsage}MB`}>
            <Activity size={10} color="var(--nova-blue)" />
            <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--nova-blue)' }}>
              {memUsage}MB
            </span>
          </div>
        )}
      </div>

      {/* Right: Uptime */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          uptime <span style={{ color: 'var(--text-secondary)' }}>{formatUptime(uptime)}</span>
        </span>
        <AnimatePresence>
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--nova-green)', flexShrink: 0 }}
          />
        </AnimatePresence>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
