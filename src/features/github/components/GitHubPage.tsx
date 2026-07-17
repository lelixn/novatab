import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Loader2,
  Lock,
  Globe,
  BookOpen,
  Users,
  AlertCircle,
  Flame,
  Code2,
} from 'lucide-react';
import { useSettingsStore } from '@store/index';
import type { GitHubUser, GitHubRepo, ContributionDay } from '@shared/types';
import { relativeTime } from '@shared/utils';

// ============================================
// API Fetchers
// ============================================
const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  const res = await fetch(`https://api.github.com/users/${username}`);
  if (!res.ok) throw new Error('User not found');
  return res.json();
};

const fetchGitHubRepos = async (username: string): Promise<GitHubRepo[]> => {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=public`
  );
  if (!res.ok) throw new Error('Failed to fetch repos');
  return res.json();
};

// ============================================
// Contribution Heatmap (mock data generator)
// ============================================
function generateMockContributions(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const count = Math.random() < 0.6 ? Math.floor(Math.random() * 12) : 0;
    const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    days.push({ date: d.toISOString().split('T')[0], count, level });
  }
  return days;
}

const CONTRIBUTION_COLORS = [
  'rgba(168,85,247,0.06)',
  'rgba(168,85,247,0.25)',
  'rgba(168,85,247,0.5)',
  'rgba(168,85,247,0.75)',
  'rgba(168,85,247,1)',
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
  'C++': '#f34b7d',
  Vue: '#41b883',
  React: '#61dafb',
  Shell: '#89e051',
};

// ============================================
// GitHub Page
// ============================================
export const GitHubPage: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [inputUsername, setInputUsername] = useState(settings.githubUsername);
  const [searchUsername, setSearchUsername] = useState(settings.githubUsername);

  const userQuery = useQuery({
    queryKey: ['github-user', searchUsername],
    queryFn: () => fetchGitHubUser(searchUsername),
    enabled: !!searchUsername,
    staleTime: 5 * 60 * 1000,
  });

  const reposQuery = useQuery({
    queryKey: ['github-repos', searchUsername],
    queryFn: () => fetchGitHubRepos(searchUsername),
    enabled: !!searchUsername,
    staleTime: 5 * 60 * 1000,
  });

  const contributions = React.useMemo(() => generateMockContributions(), []);
  const weeks = React.useMemo(() => {
    const result: ContributionDay[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
      result.push(contributions.slice(i, i + 7));
    }
    return result;
  }, [contributions]);

  const handleSearch = () => {
    if (!inputUsername.trim()) return;
    setSearchUsername(inputUsername.trim());
    updateSettings({ githubUsername: inputUsername.trim() });
  };

  const user = userQuery.data;
  const repos = reposQuery.data ?? [];
  const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-green)' }}>
          GITHUB COCKPIT
        </h2>
        {/* Username Search */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="// github username"
            className="nova-input"
            style={{ width: 200 }}
          />
          <motion.button
            onClick={handleSearch}
            className="nova-btn nova-btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Github size={14} />
            Connect
          </motion.button>
        </div>
      </div>

      {/* Loading */}
      {userQuery.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <Loader2 size={20} color="var(--nova-purple)" style={{ animation: 'spin 1s linear infinite' }} />
          <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Connecting to GitHub API...
          </span>
        </div>
      )}

      {/* Error */}
      {userQuery.isError && (
        <div className="nova-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={20} color="var(--nova-red)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--nova-red)' }}>User not found</div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Check the username and try again
            </div>
          </div>
        </div>
      )}

      {/* No username */}
      {!searchUsername && (
        <div className="nova-card" style={{ padding: 40, textAlign: 'center' }}>
          <Github size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
            Connect Your GitHub
          </div>
          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Enter your GitHub username above to view your profile
          </div>
        </div>
      )}

      {/* Profile */}
      <AnimatePresence>
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {/* User Card */}
            <div className="nova-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.4)', boxShadow: 'var(--glow-purple)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.name ?? user.login}
                    </h3>
                    <a href={user.html_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </a>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--nova-purple)', marginBottom: 6 }}>
                    @{user.login}
                  </div>
                  {user.bio && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {user.bio}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { icon: <BookOpen size={13} />, label: `${user.public_repos} Repos` },
                      { icon: <Users size={13} />, label: `${user.followers} Followers` },
                      { icon: <Users size={13} />, label: `${user.following} Following` },
                    ].map((stat) => (
                      <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--nova-purple)' }}>{stat.icon}</span>
                        {stat.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Heatmap */}
            <div className="nova-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 className="font-pixel" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  CONTRIBUTION ACTIVITY
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Less</span>
                  {[0,1,2,3,4].map((l) => (
                    <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: CONTRIBUTION_COLORS[l] }} />
                  ))}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>More</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {week.map((day, di) => (
                      <motion.div
                        key={day.date}
                        title={`${day.date}: ${day.count} contributions`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (wi * 7 + di) * 0.001 }}
                        whileHover={{ scale: 1.4 }}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: CONTRIBUTION_COLORS[day.level],
                          cursor: 'default',
                          boxShadow: day.level > 0 ? `0 0 3px ${CONTRIBUTION_COLORS[day.level]}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Repositories */}
            <div>
              <h4 className="font-pixel" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                TOP REPOSITORIES
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {sortedRepos.slice(0, 6).map((repo) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="nova-card"
                    style={{ padding: '14px 16px', textDecoration: 'none', display: 'block' }}
                    whileHover={{ borderColor: 'var(--border-glow)', transform: 'translateY(-2px)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      {repo.private ? <Lock size={12} color="var(--nova-yellow)" /> : <Globe size={12} color="var(--nova-green)" />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--nova-purple)' }}>
                        {repo.name}
                      </span>
                    </div>
                    {repo.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {repo.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {repo.language && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[repo.language] ?? 'var(--text-muted)' }} />
                          <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {repo.language}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={11} color="var(--nova-yellow)" />
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {repo.stargazers_count}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <GitFork size={11} color="var(--text-muted)" />
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {repo.forks_count}
                        </span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
