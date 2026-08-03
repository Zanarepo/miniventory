import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { LanguageSelector, Button } from '../components';
import { RefreshCw } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
        position: 'relative',
      }}
      className="animate-fade-in"
    >
      {/* ── Top nav bar ── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px clamp(20px, 4vw, 48px)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'color-mix(in srgb, var(--bg-app) 85%, transparent)',
        }}
      >
        {/* Miniventory logo — top left */}
        <Link
          to="/"
          aria-label="Miniventory home"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <svg viewBox="0 0 34 34" fill="none" style={{ width: 32, height: 32, flexShrink: 0 }}>
            <path
              d="M17 2 30 9v16L17 32 4 25V9L17 2Z"
              stroke="var(--brand-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M17 2v15M17 17 4 9M17 17l13-8M17 17v15"
              stroke="var(--brand-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              lineHeight: 1,
            }}
          >
            <span>Mini</span>
            <span style={{ color: 'var(--brand-primary)' }}>ventory</span>
          </span>
        </Link>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LanguageSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            leftIcon={<RefreshCw size={14} />}
            aria-label="Toggle application theme"
          >
            <span style={{ textTransform: 'capitalize' }}>{theme} Mode</span>
          </Button>
        </div>
      </div>

      {/* ── Page body ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 36px)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '740px' }}>
          {/* Page-level subtitle */}
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Simple business records for every shop owner
          </p>

          <main
            className="glass-panel"
            style={{ padding: '32px', boxShadow: 'var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.12)' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
