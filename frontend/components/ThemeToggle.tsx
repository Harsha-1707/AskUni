'use client';

import { useEffect, useState, useCallback } from 'react';

const DARK_VARS: Record<string, string> = {
  '--bg-void': '#07090f',
  '--bg-dark': '#0c1018',
  '--bg-surface': '#111622',
  '--bg-elevated': '#171f2e',
  '--bg-card': 'rgba(17, 22, 34, 0.85)',
  '--neon-cyan': '#38bdf8',
  '--neon-blue': '#6096f7',
  '--neon-violet': '#7c5cbb',
  '--neon-purple': '#9d6ee8',
  '--neon-pink': '#d4578a',
  '--neon-green': '#34d399',
  '--neon-amber': '#f59e0b',
  '--text-primary': '#dde5f4',
  '--text-secondary': '#7a95bb',
  '--text-muted': '#40587a',
  '--text-accent': '#38bdf8',
  '--grad-hero': 'linear-gradient(135deg, #6096f7 0%, #9d6ee8 60%, #d4578a 100%)',
  '--grad-cyber': 'linear-gradient(90deg, #38bdf8, #6096f7, #7c5cbb)',
  '--grad-warm': 'linear-gradient(135deg, #d4578a, #9d6ee8, #6096f7)',
  '--grad-glow': 'linear-gradient(135deg, rgba(96, 150, 247, 0.1), rgba(157, 110, 232, 0.1))',
  '--glass-bg': 'rgba(17, 22, 34, 0.75)',
  '--glass-border': 'rgba(96, 150, 247, 0.1)',
  '--glass-border-bright': 'rgba(96, 150, 247, 0.25)',
  '--glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  '--glow-cyan': '0 0 20px rgba(56, 189, 248, 0.4), 0 0 60px rgba(56, 189, 248, 0.15)',
  '--glow-blue': '0 0 20px rgba(96, 150, 247, 0.4), 0 0 60px rgba(96, 150, 247, 0.15)',
  '--glow-purple': '0 0 20px rgba(157, 110, 232, 0.4), 0 0 60px rgba(157, 110, 232, 0.15)',
  '--glow-pink': '0 0 20px rgba(212, 87, 138, 0.4), 0 0 60px rgba(212, 87, 138, 0.15)',
};

const LIGHT_VARS: Record<string, string> = {
  '--bg-void': '#fffbf4',
  '--bg-dark': '#fff5e8',
  '--bg-surface': '#ffefda',
  '--bg-elevated': '#ffe8cc',
  '--bg-card': 'rgba(255, 251, 244, 0.92)',
  '--neon-cyan': '#0fafd4',
  '--neon-blue': '#FFA239',
  '--neon-violet': '#e07020',
  '--neon-purple': '#FF5656',
  '--neon-pink': '#e03030',
  '--neon-green': '#22a06b',
  '--neon-amber': '#d4a800',
  '--text-primary': '#1c1409',
  '--text-secondary': '#5c4830',
  '--text-muted': '#aa8860',
  '--text-accent': '#e07c00',
  '--grad-hero': 'linear-gradient(135deg, #FFA239 0%, #FF5656 60%, #d4578a 100%)',
  '--grad-cyber': 'linear-gradient(90deg, #8CE4FF, #FFA239, #FF5656)',
  '--grad-warm': 'linear-gradient(135deg, #FF5656, #FFA239, #FEEE81)',
  '--grad-glow': 'linear-gradient(135deg, rgba(255, 162, 57, 0.12), rgba(255, 86, 86, 0.08))',
  '--glass-bg': 'rgba(255, 251, 244, 0.82)',
  '--glass-border': 'rgba(255, 162, 57, 0.22)',
  '--glass-border-bright': 'rgba(255, 162, 57, 0.45)',
  '--glass-shadow': '0 8px 32px rgba(200, 100, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
  '--glow-cyan': '0 0 20px rgba(140, 228, 255, 0.6), 0 0 60px rgba(140, 228, 255, 0.25)',
  '--glow-blue': '0 0 20px rgba(255, 162, 57, 0.5), 0 0 60px rgba(255, 162, 57, 0.2)',
  '--glow-purple': '0 0 20px rgba(255, 86, 86, 0.4), 0 0 60px rgba(255, 86, 86, 0.15)',
  '--glow-pink': '0 0 20px rgba(255, 60, 60, 0.4), 0 0 60px rgba(255, 60, 60, 0.15)',
};

function applyTheme(theme: 'dark' | 'light') {
  const vars = theme === 'light' ? LIGHT_VARS : DARK_VARS;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
  root.setAttribute('data-theme', theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('askuni-theme') as 'dark' | 'light') ?? 'dark';
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('askuni-theme', next);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: isDark
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255, 162, 57, 0.12)',
        border: `1px solid ${isDark ? 'rgba(96,150,247,0.18)' : 'rgba(255,162,57,0.35)'}`,
        borderRadius: '9999px',
        padding: '5px 12px 5px 8px',
        cursor: 'pointer',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Toggle track */}
      <span style={{
        position: 'relative',
        width: '32px',
        height: '18px',
        borderRadius: '9px',
        background: isDark
          ? 'rgba(96,150,247,0.25)'
          : 'rgba(255,162,57,0.4)',
        display: 'inline-block',
        transition: 'background 0.3s ease',
        flexShrink: 0,
      }}>
        {/* Knob */}
        <span style={{
          position: 'absolute',
          top: '3px',
          left: isDark ? '3px' : '17px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isDark ? '#6096f7' : '#FFA239',
          transition: 'left 0.3s ease, background 0.3s ease',
          boxShadow: isDark
            ? '0 0 6px rgba(96,150,247,0.5)'
            : '0 0 6px rgba(255,162,57,0.5)',
        }} />
      </span>
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
