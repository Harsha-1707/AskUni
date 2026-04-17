'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/chat');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="page-bg">
        <div className="bg-orb-3" />
      </div>
      <div className="grid-overlay" />

      <div className="auth-container">
        <div className="glass-card auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">🎓</div>
            <div className="auth-logo-text">
              <span className="logo-gradient">AskUni</span>
            </div>
            <div className="auth-logo-sub">Sign in to your account</div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉</span>
                <input
                  id="login-email"
                  type="email"
                  className="form-input has-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@anurag.edu.in"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    padding: 0,
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">New to AskUni?</span>
            <div className="auth-divider-line" />
          </div>

          <Link
            href="/register"
            id="goto-register-btn"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.7rem',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.02)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border-bright)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            Create a free account
          </Link>

          <p className="auth-footer">
            By signing in, you agree to the{' '}
            <a href="#" className="auth-link">Terms of Service</a>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}>
            ← Back to home
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
