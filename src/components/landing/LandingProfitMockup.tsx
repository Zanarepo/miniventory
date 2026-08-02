import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export const LandingProfitMockup: React.FC = () => {
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
          backgroundColor: 'var(--brand-cyan)',
          color: '#000',
        }}
      >
        <BarChart3 size={20} />
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>
          {t('mockupProfitHeader')}
        </h4>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Net Profit Big Number */}
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0',
            borderBottom: '1px dashed var(--border-color)',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('mockupProfitNetTitle')}
          </span>
          <h2
            style={{
              margin: '8px 0 0',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--brand-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            {t('mockupProfitNetValue')}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginTop: '8px',
            }}
          >
            <TrendingUp size={12} /> {t('mockupProfitNetTrend')}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Revenue */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              <ArrowUpRight size={14} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t('mockupProfitSales')}</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('mockupProfitSalesValue')}
            </span>
          </div>

          {/* Expenses */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              <ArrowDownRight size={14} color="var(--brand-danger)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {t('mockupProfitExpenses')}
              </span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('mockupProfitExpensesValue')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
