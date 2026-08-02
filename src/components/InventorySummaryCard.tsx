import React from 'react';
import { Card } from './Card';
import { useInventory } from '../hooks/useInventory';
import { useBusiness } from '../hooks/useBusiness';
import { useLanguage } from '../hooks/useLanguage';
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

export const InventorySummaryCard: React.FC = () => {
  const { products, totalValuation, lowStockCount, outOfStockCount } = useInventory();
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const formattedValuation = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalValuation);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        gap: '12px',
        marginBottom: '22px',
      }}
    >
      {/* Total Items */}
      <Card
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
            }}
          >
            {t('statTotalItems')}
          </p>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          >
            {products.length}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitItems')}
          </span>
        </div>
      </Card>

      {/* Total Value */}
      <Card
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
            }}
          >
            {t('statTotalValue')}
          </p>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              wordBreak: 'break-word',
            }}
          >
            {currSymbol}
            {formattedValuation}
          </span>
        </div>
      </Card>

      {/* Low Stock Warnings */}
      <Card
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
            }}
          >
            {t('statLowStock')}
          </p>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: lowStockCount > 0 ? 'rgba(245, 158, 11, 0.16)' : 'rgba(0,0,0,0.05)',
              color: lowStockCount > 0 ? '#d97706' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: lowStockCount > 0 ? '#d97706' : 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          >
            {lowStockCount}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitAlerts')}
          </span>
        </div>
      </Card>

      {/* Out of Stock Items */}
      <Card
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
            }}
          >
            {t('statOutOfStock')}
          </p>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: outOfStockCount > 0 ? 'rgba(211, 47, 47, 0.15)' : 'rgba(0,0,0,0.05)',
              color: outOfStockCount > 0 ? 'var(--brand-danger)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <XCircle size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: outOfStockCount > 0 ? 'var(--brand-danger)' : 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          >
            {outOfStockCount}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitItems')}
          </span>
        </div>
      </Card>
    </div>
  );
};
