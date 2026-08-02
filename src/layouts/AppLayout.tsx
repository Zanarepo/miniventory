import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSelector, InstallGuideModal } from '../components';
import { usePwaInstall } from '../hooks/usePwaInstall';
import {
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Monitor,
  TrendingUp,
  Package,
  History,
  ShoppingCart,
  Receipt,
  Coins,
  FileText,
  Download,
  ShieldAlert,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const { showInstallButton, installApp } = usePwaInstall();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Close mobile sidebar asynchronously upon route change without triggering React 19 synchronous cascading renders
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
    const isActive = location.pathname === path;
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
            to="/"
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
          <Link
            to="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/dashboard')}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/financials"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/financials')}
          >
            <TrendingUp size={19} />
            <span>{t('tabFinancials')}</span>
          </Link>
          <Link
            to="/reports"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/reports')}
          >
            <FileText size={19} />
            <span>{t('tabReports')}</span>
          </Link>
          <Link to="/sales" onClick={() => setIsSidebarOpen(false)} style={navItemStyle('/sales')}>
            <ShoppingCart size={19} />
            <span>{t('tabSales')}</span>
          </Link>
          <Link
            to="/sales-history"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/sales-history')}
          >
            <Receipt size={19} />
            <span>Sales History</span>
          </Link>
          <Link
            to="/expenses"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/expenses')}
          >
            <Coins size={19} />
            <span>{t('tabExpenses')}</span>
          </Link>
          <Link
            to="/inventory"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/inventory')}
          >
            <Package size={19} />
            <span>Shop Items</span>
          </Link>
          <Link
            to="/inventory-ledger"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/inventory-ledger')}
          >
            <History size={19} />
            <span>Stock History</span>
          </Link>
          <Link
            to="/profile"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/profile')}
          >
            <UserCheck size={19} />
            <span>My Profile</span>
          </Link>
          <Link
            to="/settings"
            onClick={() => setIsSidebarOpen(false)}
            style={navItemStyle('/settings')}
          >
            <SettingsIcon size={19} />
            <span>App Settings</span>
          </Link>

          {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
            <>
              <div style={{ marginTop: '16px', marginBottom: '8px', padding: '0 16px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Admin
                </span>
              </div>
              <Link
                to="/admin"
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'var(--brand-primary)',
                  backgroundColor: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  marginBottom: '8px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <ShieldAlert size={19} />
                <span>Admin Portal</span>
              </Link>
            </>
          )}
        </nav>

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
              {profile?.full_name || user?.email || 'Entrepreneur'}
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
              ● Active Enterprise Account
            </span>
          </div>
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              signOut();
            }}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'hsla(358, 82%, 56%, 0.08)',
              color: 'var(--brand-danger)',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="workspace-header">
          <button
            onClick={() => {
              if (window.innerWidth >= 900) {
                setIsDesktopOpen(!isDesktopOpen);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            aria-label="Toggle navigation menu"
            className="sidebar-toggle-btn"
            title={isDesktopOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            {showInstallButton && (
              <button
                onClick={async () => {
                  const success = await installApp();
                  if (!success) {
                    setIsInstallGuideOpen(true);
                  }
                }}
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                aria-label="Install App"
              >
                <Download size={15} />
                <span style={{ fontWeight: 700 }}>Install App</span>
              </button>
            )}
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="btn btn-outline btn-sm"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <Moon size={15} color="var(--brand-primary)" />
              ) : theme === 'light' ? (
                <Sun size={15} color="var(--brand-warning)" />
              ) : (
                <Monitor size={15} color="var(--brand-cyan)" />
              )}
              <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>
                {theme}
                <span className="theme-toggle-text-full"> Mode</span>
              </span>
            </button>
          </div>
        </header>

        <main className="main-workspace-content">
          <Outlet />
        </main>

        <footer
          style={{
            padding: '16px 14px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          BizTrack © 2026 — Simple Financial Record Keeping for African Enterprises.
        </footer>
      </div>

      <InstallGuideModal isOpen={isInstallGuideOpen} onClose={() => setIsInstallGuideOpen(false)} />
    </div>
  );
};
