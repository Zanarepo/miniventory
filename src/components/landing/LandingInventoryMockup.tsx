import React from 'react';
import { PackageSearch, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const LandingInventoryMockup: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--brand-accent)',
          color: '#1a1a1a',
        }}
      >
        <PackageSearch size={20} />
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{t('mockupInvHeader')}</h4>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Item 1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h5
              style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}
            >
              {t('mockupInvItem1')}
            </h5>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('mockupInvRestock')}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
              45
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              {t('mockupInvInStock')}
            </span>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--brand-primary-light)',
            borderRadius: '3px',
          }}
        >
          <div
            style={{
              width: '75%',
              height: '100%',
              backgroundColor: 'var(--brand-primary)',
              borderRadius: '3px',
            }}
          ></div>
        </div>

        {/* Item 2 - Low Stock Alert */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                padding: '6px',
                backgroundColor: 'var(--brand-danger-light)',
                borderRadius: '50%',
                color: 'var(--brand-danger)',
              }}
            >
              <AlertTriangle size={14} />
            </div>
            <div>
              <h5
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                }}
              >
                {t('mockupInvItem2')}
              </h5>
              <span style={{ fontSize: '0.8rem', color: 'var(--brand-danger)', fontWeight: 600 }}>
                {t('mockupInvLowStock')}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-danger)' }}>
              3
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
              {t('mockupInvRemaining')}
            </span>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--brand-danger-light)',
            borderRadius: '3px',
          }}
        >
          <div
            style={{
              width: '15%',
              height: '100%',
              backgroundColor: 'var(--brand-danger)',
              borderRadius: '3px',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
