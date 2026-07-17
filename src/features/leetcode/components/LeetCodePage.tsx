import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Code2, Target, Flame, Trophy, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useSettingsStore } from '@store/index';
import type { LeetCodeStats } from '@shared/types';

// ============================================
// LeetCode data via public API / GraphQL proxy
// We use a public proxy since LeetCode doesn't have CORS-friendly API
// ============================================
const fetchLeetCodeStats = async (username: string): Promise<LeetCodeStats> => {
  // Using leetcode-stats-api (open source proxy)
  const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
  if (!res.ok) throw new Error('User not found');
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message ?? 'Not found');
  return {
    username,
    totalSolved: data.totalSolved ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    easySolved: data.easySolved ?? 0,
    easyTotal: data.totalEasy ?? 0,
    mediumSolved: data.mediumSolved ?? 0,
    mediumTotal: data.totalMedium ?? 0,
    hardSolved: data.hardSolved ?? 0,
    hardTotal: data.totalHard ?? 0,
    acceptanceRate: data.acceptanceRate ?? 0,
    ranking: data.ranking ?? 0,
    streak: 0,
  };
};

// ============================================
// Difficulty Ring
// ============================================
interface DiffRingProps {
  label: string;
  solved: number;
  total: number;
  color: string;
}

const DiffRing: React.FC<DiffRingProps> = ({ label, solved, total, color }) => {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const size = 80;
  const strokeW = 5;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}15`} strokeWidth={strokeW} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color }}>{solved}</span>
          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>/{total}</span>
        </div>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color, fontFamily: 'JetBrains Mono' }}>{label}</span>
    </div>
  );
};

// ============================================
// LeetCode Page
// ============================================
export const LeetCodePage: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [inputUsername, setInputUsername] = useState(settings.leetcodeUsername);
  const [searchUsername, setSearchUsername] = useState(settings.leetcodeUsername);

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['leetcode-stats', searchUsername],
    queryFn: () => fetchLeetCodeStats(searchUsername),
    enabled: !!searchUsername,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const handleSearch = () => {
    if (!inputUsername.trim()) return;
    setSearchUsername(inputUsername.trim());
    updateSettings({ leetcodeUsername: inputUsername.trim() });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-yellow)' }}>
          LEETCODE TRACKER
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="// leetcode username"
            className="nova-input"
            style={{ width: 200 }}
          />
          <motion.button
            onClick={handleSearch}
            className="nova-btn"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', boxShadow: '0 0 15px rgba(245,158,11,0.3)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Code2 size={14} />
            Track
          </motion.button>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <Loader2 size={20} color="var(--nova-yellow)" style={{ animation: 'spin 1s linear infinite' }} />
          <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Fetching LeetCode stats...
          </span>
        </div>
      )}

      {isError && (
        <div className="nova-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={20} color="var(--nova-red)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--nova-red)' }}>Could not fetch stats</div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {(error as Error).message}
            </div>
          </div>
        </div>
      )}

      {!searchUsername && (
        <div className="nova-card" style={{ padding: 40, textAlign: 'center' }}>
          <Code2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
            Connect Your LeetCode
          </div>
          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Enter your LeetCode username above
          </div>
        </div>
      )}

      <AnimatePresence>
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { icon: <Target size={18} />, label: 'Problems Solved', value: stats.totalSolved, sub: `of ${stats.totalQuestions}`, color: 'var(--nova-purple)' },
                { icon: <Trophy size={18} />, label: 'Global Ranking', value: `#${stats.ranking.toLocaleString()}`, sub: '', color: 'var(--nova-yellow)' },
                { icon: <Code2 size={18} />, label: 'Acceptance Rate', value: `${stats.acceptanceRate.toFixed(1)}%`, sub: '', color: 'var(--nova-cyan)' },
              ].map((stat) => (
                <div key={stat.label} className="nova-card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 600, color: stat.color, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  {stat.sub && (
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {stat.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Difficulty Breakdown */}
            <div className="nova-card" style={{ padding: '24px' }}>
              <h4 className="font-pixel" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                DIFFICULTY BREAKDOWN
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
                <DiffRing label="Easy" solved={stats.easySolved} total={stats.easyTotal} color="var(--nova-green)" />
                <DiffRing label="Medium" solved={stats.mediumSolved} total={stats.mediumTotal} color="var(--nova-yellow)" />
                <DiffRing label="Hard" solved={stats.hardSolved} total={stats.hardTotal} color="var(--nova-red)" />
              </div>

              {/* Progress Bars */}
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Easy', solved: stats.easySolved, total: stats.easyTotal, color: 'var(--nova-green)' },
                  { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal, color: 'var(--nova-yellow)' },
                  { label: 'Hard', solved: stats.hardSolved, total: stats.hardTotal, color: 'var(--nova-red)' },
                ].map((d) => (
                  <div key={d.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: d.color, fontFamily: 'JetBrains Mono' }}>{d.label}</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {d.solved}/{d.total}
                      </span>
                    </div>
                    <div className="nova-progress">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.total > 0 ? (d.solved / d.total) * 100 : 0}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 2, background: d.color, boxShadow: `0 0 6px ${d.color}80` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Link */}
            <motion.a
              href={`https://leetcode.com/${stats.username}`}
              target="_blank"
              rel="noreferrer"
              className="nova-btn nova-btn-ghost"
              style={{ alignSelf: 'flex-start', gap: 8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <ExternalLink size={14} />
              View on LeetCode
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
