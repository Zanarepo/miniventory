import React from 'react';
import { Link } from 'react-router-dom';
import {
  IconBolt,
  IconArrowRight,
  IconUsers,
  IconShield,
  IconBag,
  IconChart,
  IconMic,
  IconWifiOff,
  IconGlobe,
} from './LandingIcons';
import { useCountUp, naira } from './Reveal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const profit = useCountUp(48500, 2000);
  const sales = useCountUp(125000, 2000);
  const expenses = useCountUp(76500, 2000);

  return (
    <>
      <section className="mv-hero">
        <div className="mv-shell mv-hero-grid">
          <div className="mv-hero-copy">
            <span className="mv-eyebrow">
              <IconBolt size={14} />
              {t('heroBadge')}
            </span>
            <h1>{t('appTagline')}</h1>
            <p className="mv-hero-sub">{t('heroDesc')}</p>
            <div className="mv-hero-cta-row">
              {user ? (
                <Link to="/dashboard" className="mv-btn mv-btn-primary">
                  Go to Dashboard <IconArrowRight />
                </Link>
              ) : (
                <Link to="/register" className="mv-btn mv-btn-primary">
                  {t('registerButton')} <IconArrowRight />
                </Link>
              )}
              <a href="#how-it-works" className="mv-btn mv-btn-ghost">
                See How It Works
              </a>
            </div>
            {!user && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <Link
                  to="/register?join=true"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '100px',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(99, 102, 241, 0.15)', // brand primary tint
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      color: '#818cf8',
                    }}
                  >
                    <IconUsers size={16} />
                  </div>
                  Have an invite code? Join your team
                </Link>
              </div>
            )}
            <div className="mv-hero-microcopy" style={{ marginTop: '24px' }}>
              <IconShield size={16} />
              No card needed · Your records stay private and safe
            </div>
          </div>

          <div className="mv-device-wrap">
            <div className="mv-floating-chip mv-chip-1">
              <IconBag size={15} />
              Sale recorded
            </div>
            <div className="mv-floating-chip mv-chip-2">
              <IconChart size={15} />
              Profit updated
            </div>

            <div
              className="mv-device"
              role="img"
              aria-label="Preview of the Miniventory daily profit dashboard"
            >
              <div className="mv-device-header">
                <div className="mv-device-shop">
                  <span className="mv-device-shop-name">Mama Ngozi's Shop</span>
                  <span className="mv-device-date">Today · Ikeja Market</span>
                </div>
                <span className="mv-device-live">
                  <span className="mv-live-dot" />
                  LIVE
                </span>
              </div>

              <div className="mv-device-hero-stat">
                <div className="mv-device-hero-label">Today's Profit</div>
                <div className="mv-device-hero-value">{naira(profit)}</div>
              </div>

              <div className="mv-device-stats">
                <div className="mv-device-stat-card">
                  <div className="mv-device-stat-label">
                    <span className="mv-dot-cyan">●</span> Sales
                  </div>
                  <div className="mv-device-stat-value">{naira(sales)}</div>
                </div>
                <div className="mv-device-stat-card">
                  <div className="mv-device-stat-label">
                    <span className="mv-dot-rose">●</span> Expenses
                  </div>
                  <div className="mv-device-stat-value">{naira(expenses)}</div>
                </div>
              </div>

              <div className="mv-device-toast">
                <IconMic size={15} />
                "I sold 3 bags of rice" - recorded automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <div className="mv-trust">
        <div className="mv-shell mv-trust-row">
          <div className="mv-trust-item">
            <IconWifiOff size={16} />
            No internet? No problem.
          </div>
          <div className="mv-trust-item">
            <IconGlobe size={16} />
            Speaks Pidgin, Igbo, Yoruba &amp; Hausa
          </div>
          <div className="mv-trust-item">
            <IconShield size={16} />
            Your data is 100% private
          </div>
        </div>
      </div>
    </>
  );
};
