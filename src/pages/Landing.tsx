import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import '../styles/landing.css';

import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { StorySection } from '../components/landing/StorySection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { DemoSection } from '../components/landing/DemoSection';
import { TestimonialSection } from '../components/landing/TestimonialSection';

import { CtaSection } from '../components/landing/CtaSection';
import { FooterSection } from '../components/landing/FooterSection';

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mv-landing">
      {/* ---------------- Nav ---------------- */}
      <header className="mv-nav">
        <div className="mv-shell mv-nav-row">
          <a href="/" className="mv-logo" aria-label="Miniventory home">
            <svg className="mv-logo-mark" viewBox="0 0 34 34" fill="none">
              <path
                d="M17 2 30 9v16L17 32 4 25V9L17 2Z"
                stroke="var(--mv-cyan)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M17 2v15M17 17 4 9M17 17l13-8M17 17v15"
                stroke="var(--mv-cyan)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              <span className="mv-logo-mini">Mini</span>
              <span className="mv-logo-ventory">ventory</span>
            </span>
          </a>

          <nav className="mv-nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            {/* <a href="#pricing">Pricing</a> */}
          </nav>

          <div className="mv-nav-actions" style={{ gap: '12px' }}>
            <div
              className="mv-hide-mobile"
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <ThemeToggle />
              <LanguageSelector />
            </div>
            {user ? (
              <Link to="/dashboard" className="mv-btn mv-btn-primary mv-btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mv-btn mv-btn-ghost mv-btn-sm mv-hide-mobile"
                  style={{ padding: '8px 14px' }}
                >
                  {t('existingAccount')}
                </Link>
                <Link to="/register" className="mv-btn mv-btn-primary mv-btn-sm">
                  {t('getStartedFree')}
                </Link>
              </>
            )}
            <button
              className="mv-nav-burger"
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={`mv-shell mv-mobile-menu ${menuOpen ? 'mv-open' : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>
          {/* <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a> */}
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              {t('existingAccount')}
            </Link>
          )}
          <div
            style={{
              padding: '12px 4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <HeroSection />
      <HowItWorksSection />
      <StorySection />
      <FeaturesSection />
      <DemoSection />
      <TestimonialSection />
      {/* <PricingSection /> */}
      <CtaSection />
      <FooterSection />
    </div>
  );
};
