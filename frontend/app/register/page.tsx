'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      router.push('/chat');
    } catch {
      // Error handled by store
    }
  };

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: '#f72585', width: '25%' };
    if (password.length < 10) return { label: 'Fair', color: '#ffab00', width: '55%' };
    return { label: 'Strong', color: '#00ff88', width: '100%' };
  })();

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
            <div className="auth-logo-icon">🚀</div>
            <div className="auth-logo-text">
              <span className="logo-gradient">Join AskUni</span>
            </div>
            <div className="auth-logo-sub">Create your free account in seconds</div>
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
              <label htmlFor="reg-email" className="form-label">Email address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉</span>
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="form-label">
                Password
                {passwordStrength && (
                  <span style={{ float: 'right', color: passwordStrength.color, fontSize: '0.72rem' }}>
                    {passwordStrength.label}
                  </span>
                )}
              </label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {passwordStrength && (
                <div style={{
                  height: '3px',
                  background: 'var(--glass-border)',
                  borderRadius: '2px',
                  marginTop: '6px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: passwordStrength.width,
                    background: passwordStrength.color,
                    borderRadius: '2px',
                    transition: 'all 0.4s ease',
                    boxShadow: `0 0 8px ${passwordStrength.color}`,
                  }} />
                </div>
              )}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
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
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          {/* Feature bullets */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {[
              '✅ Free forever for students',
              '✅ Instant AI answers with source citations',
              '✅ No credit card required',
            ].map((item) => (
              <div key={item} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item}
              </div>
            ))}
          </div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Already have an account?</span>
            <div className="auth-divider-line" />
          </div>

          <Link
            href="/login"
            id="goto-login-btn"
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
            Sign in instead
          </Link>
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
