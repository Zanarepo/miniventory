import React from 'react';
import { Card } from './Card';
import { useInventory } from '../hooks/useInventory';
import { useBusiness } from '../hooks/useBusiness';
import { useLanguage } from '../hooks/useLanguage';
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

const ClickableAmount: React.FC<{
  value: number;
  formatFull: (v: number) => string;
  formatCompact: (v: number) => string;
  style?: React.CSSProperties;
}> = ({ value, formatFull, formatCompact, style }) => {
  const [showFull, setShowFull] = React.useState(false);
  const fullValue = formatFull(value);
  const compactValue = formatCompact(value);
  return (
    <span
      onClick={() => setShowFull(!showFull)}
      style={{ ...style, cursor: 'pointer', display: 'inline-block' }}
      title={fullValue}
    >
      {showFull ? fullValue : compactValue}
    </span>
  );
};

export const InventorySummaryCard: React.FC = () => {
  const { products, totalValuation, lowStockCount, outOfStockCount } = useInventory();
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const formatCurrency = React.useCallback(
    (val: number) =>
      `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [currSymbol],
  );

  const formatCompactCurrency = React.useCallback(
    (num: number) => {
      if (num >= 1e9) return `${currSymbol}${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
      if (num >= 1e6) return `${currSymbol}${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
      if (num >= 1e3) return `${currSymbol}${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
      return `${currSymbol}${Number(num).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`;
    },
    [currSymbol],
  );

  const formatNumber = (val: number) => Number(val).toLocaleString();
  const formatCompactNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
    return formatNumber(num);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '22px',
      }}
    >
      {/* Total Items */}
      <Card
        style={{
          padding: '12px',
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
          <ClickableAmount
            value={products.length}
            formatFull={formatNumber}
            formatCompact={formatCompactNumber}
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitItems')}
          </span>
        </div>
      </Card>

      {/* Total Value */}
      <Card
        style={{
          padding: '12px',
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
          <ClickableAmount
            value={totalValuation}
            formatFull={formatCurrency}
            formatCompact={formatCompactCurrency}
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
              wordBreak: 'break-word',
            }}
          />
        </div>
      </Card>

      {/* Low Stock Warnings */}
      <Card
        style={{
          padding: '12px',
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
          <ClickableAmount
            value={lowStockCount}
            formatFull={formatNumber}
            formatCompact={formatCompactNumber}
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: lowStockCount > 0 ? '#d97706' : 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitAlerts')}
          </span>
        </div>
      </Card>

      {/* Out of Stock Items */}
      <Card
        style={{
          padding: '12px',
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
          <ClickableAmount
            value={outOfStockCount}
            formatFull={formatNumber}
            formatCompact={formatCompactNumber}
            style={{
              fontSize: '1.28rem',
              fontWeight: 800,
              color: outOfStockCount > 0 ? 'var(--brand-danger)' : 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('unitItems')}
          </span>
        </div>
      </Card>
    </div>
  );
};
