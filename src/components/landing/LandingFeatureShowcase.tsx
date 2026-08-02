import React from 'react';
import { LandingSalesMockup } from './LandingSalesMockup';
import { LandingInventoryMockup } from './LandingInventoryMockup';
import { LandingProfitMockup } from './LandingProfitMockup';
import { WifiOff, Zap, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const LandingFeatureShowcase: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '64px',
        width: '100%',
        marginTop: '80px',
      }}
    >
      {/* Feature 1: Sales Entry */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        <div style={{ order: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--brand-primary-light)',
                borderRadius: '12px',
                color: 'var(--brand-primary)',
              }}
            >
              <Zap size={24} />
            </div>
            <h3
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {t('showcaseSalesTitle')}
            </h3>
          </div>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {t('showcaseSalesDesc')}
          </p>
        </div>
        <div style={{ order: 2, perspective: '1000px' }}>
          <div
            style={{ transform: 'rotateY(-5deg) rotateX(5deg)', transition: 'transform 0.3s ease' }}
          >
            <LandingSalesMockup />
          </div>
        </div>
      </div>

      {/* Feature 2: Offline Inventory */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'left',
          backgroundColor: 'var(--bg-app)',
          padding: '40px 0',
          margin: '0 -24px', // Break out of container padding for full width illusion on mobile
        }}
      >
        <div style={{ order: 2, padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--brand-accent)',
                borderRadius: '12px',
                color: '#1a1a1a',
              }}
            >
              <WifiOff size={24} />
            </div>
            <h3
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {t('showcaseOfflineTitle')}
            </h3>
          </div>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {t('showcaseOfflineDesc')}
          </p>
        </div>
        <div style={{ order: 1, perspective: '1000px', padding: '0 24px' }}>
          <div
            style={{ transform: 'rotateY(5deg) rotateX(5deg)', transition: 'transform 0.3s ease' }}
          >
            <LandingInventoryMockup />
          </div>
        </div>
      </div>

      {/* Feature 3: Smart Decisions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        <div style={{ order: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--brand-cyan)',
                borderRadius: '12px',
                color: '#1a1a1a',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h3
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {t('showcaseSmartTitle')}
            </h3>
          </div>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {t('showcaseSmartDesc')}
          </p>
        </div>
        <div style={{ order: 2, perspective: '1000px' }}>
          <div
            style={{ transform: 'rotateY(-5deg) rotateX(5deg)', transition: 'transform 0.3s ease' }}
          >
            <LandingProfitMockup />
          </div>
        </div>
      </div>
    </div>
  );
};
