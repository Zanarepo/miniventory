import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';
import { IconArrowRight } from './LandingIcons';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export const CtaSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="mv-shell" style={{ paddingBottom: 96 }}>
      <Reveal>
        <div className="mv-final-cta">
          <span className="mv-eyebrow">Join thousands of shop owners</span>
          <h2>{t('appTagline')}</h2>
          <p>{t('heroDesc')}</p>
          <div className="mv-final-cta-actions">
            {user ? (
              <Link to="/dashboard" className="mv-btn mv-btn-primary">
                Go to Dashboard <IconArrowRight />
              </Link>
            ) : (
              <Link to="/register" className="mv-btn mv-btn-primary">
                {t('getStartedFree')} <IconArrowRight />
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
};
