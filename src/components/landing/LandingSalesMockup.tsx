import React from 'react';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const LandingSalesMockup: React.FC = () => {
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
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--brand-primary-light)',
        }}
      >
        <ShoppingCart size={20} color="var(--brand-primary)" />
        <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)', fontSize: '1.1rem' }}>
          {t('mockupSalesHeader')}
        </h4>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Mock Input 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {t('mockupSalesItemLabel')}
          </label>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--brand-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
            }}
          >
            {t('mockupSalesItemValue')}
          </div>
        </div>

        {/* Mock Input 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {t('mockupSalesAmountLabel')}
          </label>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {t('mockupSalesAmountValue')}
          </div>
        </div>

        {/* Mock Button */}
        <div
          style={{
            marginTop: '12px',
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{t('mockupSalesSaveBtn')}</span>
        </div>
      </div>
    </div>
  );
};
