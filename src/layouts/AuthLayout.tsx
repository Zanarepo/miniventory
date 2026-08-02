import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { LanguageSelector, Button } from '../components';
import { TrendingUp, RefreshCw } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(16px, 3vw, 36px)',
    backgroundColor: 'var(--bg-app)',
    position: 'relative',
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '740px',
    zIndex: 1,
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
  };

  const topControlsStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '740px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    zIndex: 10,
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      {/* Clean single-line horizontal top utility bar */}
      <div style={topControlsStyle}>
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

      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={38} color="var(--brand-primary)" strokeWidth={2.5} />
            <span
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.6rem)',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Biz<span className="text-gradient">Track</span>
            </span>
          </Link>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
              marginTop: '8px',
              fontWeight: 500,
            }}
          >
            Enterprise Record Keeping & Reconciliation for Everyday Entrepreneurs
          </p>
        </div>

        <main
          className="glass-panel"
          style={{ padding: '32px', boxShadow: 'var(--shadow-lg), 0 0 40px rgba(0, 0, 0, 0.12)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
