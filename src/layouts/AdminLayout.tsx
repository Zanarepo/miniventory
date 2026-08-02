import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { LanguageSelector } from '../components';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Moon,
  Sun,
  Monitor,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { business } = useBusiness();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  // Close mobile sidebar asynchronously upon route change
  useEffect(() => {
    const timer = setTimeout(() => setIsSidebarOpen(false), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const navItemStyle = (path: string): React.CSSProperties => {
    const isActive =
      location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none',
      color: isActive ? '#fff' : 'var(--text-main)',
      backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
      fontWeight: isActive ? 700 : 500,
      marginBottom: '8px',
      transition: 'all var(--transition-fast)',
      boxShadow: isActive ? '0 4px 12px hsla(158, 82%, 48%, 0.25)' : 'none',
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        position: 'relative',
      }}
    >
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`desktop-sidebar ${isSidebarOpen ? 'sidebar-open' : ''} ${!isDesktopOpen ? 'desktop-closed' : ''}`}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '0 8px',
          }}
        >
          <Link
            to="/admin"
            onClick={() => setIsSidebarOpen(false)}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <TrendingUp size={28} color="var(--brand-primary)" strokeWidth={2.5} />
            <h1
              style={{
                color: 'var(--text-main)',
                fontSize: '1.45rem',
                fontWeight: 900,
                margin: 0,
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Biz<span className="text-gradient">Track</span>
            </h1>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="mobile-only-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', margin: '8px 0' }}>
          <Link to="/admin" onClick={() => setIsSidebarOpen(false)} style={navItemStyle('/admin')}>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/admin/users')}
          >
            <Users size={19} />
            <span>Platform Users</span>
          </Link>
          <Link
            to="/admin/businesses"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/admin/businesses')}
          >
            <Building2 size={19} />
            <span>Businesses</span>
          </Link>
          <Link
            to="/admin/financials"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/admin/financials')}
          >
            <DollarSign size={19} />
            <span>Company Financials</span>
          </Link>

          <div style={{ marginTop: '24px', marginBottom: '8px', padding: '0 16px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              App
            </span>
          </div>
        </nav>
        {business && (
          <nav style={{ padding: '0 8px', marginBottom: 'auto' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--text-main)',
                backgroundColor: 'transparent',
                fontWeight: 500,
                marginBottom: '8px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Monitor size={19} />
              <span>Switch to App</span>
            </Link>
          </nav>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ marginBottom: '14px', padding: '0 6px', fontSize: '0.85rem' }}>
            <p
              style={{
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: '0 0 2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile?.full_name || user?.email || 'Admin User'}
            </p>
            <span
              style={{
                color: 'var(--brand-primary)',
                margin: 0,
                fontSize: '0.74rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              ● {profile?.role === 'superadmin' ? 'Superadmin' : 'Admin'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 6px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                transition: 'all 0.2s',
              }}
              title={`Switch theme (current: ${theme})`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Moon size={18} />
              ) : theme === 'light' ? (
                <Sun size={18} />
              ) : (
                <Monitor size={18} />
              )}
            </button>
            <button
              onClick={signOut}
              style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--danger-color)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                transition: 'all 0.2s',
              }}
              title={t('logout')}
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
        }}
      >
        {/* Top App Bar */}
        <header
          style={{
            background: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={() => {
                if (window.innerWidth >= 900) {
                  setIsDesktopOpen(!isDesktopOpen);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle navigation menu"
              title={isDesktopOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <h2
              className="header-title"
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Admin Portal
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSelector />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div
          className="layout-content"
          style={{
            flex: 1,
            padding: '24px 20px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
