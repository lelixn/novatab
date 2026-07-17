import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/index';
import { User, Lock, Mail, Loader2, LogOut, CheckCircle, ShieldAlert, Key } from 'lucide-react';

export const ProfilePanel: React.FC = () => {
  const { user, token, isAuthenticated, setUser, setToken, logout } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API_URL = 'http://localhost:5000/api/auth';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body = isRegister ? { name, email, password } : { email, password };

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setToken(data.token);
      setUser(data.user);
      setSuccessMsg(`Welcome, ${data.user.name}! Successfully authenticated.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nova-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Key size={16} color="var(--nova-purple)" />
        <h3 className="font-pixel" style={{ fontSize: '0.8rem', color: 'var(--nova-purple)', letterSpacing: '0.06em' }}>
          {isAuthenticated ? 'COCKPIT ACCOUNT' : 'CONNECT COCKPIT ACCOUNT'}
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {isAuthenticated && user ? (
          <motion.div
            key="logged-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--nova-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="var(--nova-purple)" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginTop: 8 }}>
              <CheckCircle size={14} color="var(--nova-green)" />
              <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--nova-green)' }}>
                Real-time synchronization connected
              </span>
            </div>

            <motion.button
              onClick={logout}
              className="nova-btn nova-btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={13} />
              Logout
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ShieldAlert size={14} color="var(--nova-red)" />
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--nova-red)' }}>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle size={14} color="var(--nova-green)" />
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--nova-green)' }}>{successMsg}</span>
              </div>
            )}

            {isRegister && (
              <div style={{ position: 'relative' }}>
                <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  required
                  type="text"
                  placeholder="Your Name"
                  className="nova-input"
                  style={{ paddingLeft: 34 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="nova-input"
                style={{ paddingLeft: 34 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                required
                type="password"
                placeholder="Password"
                className="nova-input"
                style={{ paddingLeft: 34 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="nova-btn nova-btn-primary"
              style={{ justifyContent: 'center', marginTop: 6 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Log In'
              )}
            </motion.button>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <button
                type="button"
                className="font-mono"
                style={{ background: 'none', border: 'none', color: 'var(--nova-purple)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Already have an account? Log In' : "Don't have an account? Create Account"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
