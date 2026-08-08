import React from 'react';
import { Card } from '../Card';

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
    <strong
      onClick={() => setShowFull(!showFull)}
      style={{ ...style, cursor: 'pointer', display: 'block' }}
      title={fullValue}
    >
      {showFull ? fullValue : compactValue}
    </strong>
  );
};

interface SalesHistoryStatsProps {
  totalRevenue: number;
  totalGrossProfit: number;
  salesCount: number;
  formatCurrency: (val: number) => string;
  formatCompactCurrency: (val: number) => string;
  formatNumber: (val: number) => string;
  formatCompactNumber: (val: number) => string;
}

export const SalesHistoryStats: React.FC<SalesHistoryStatsProps> = ({
  totalRevenue,
  totalGrossProfit,
  salesCount,
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatCompactNumber,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      <Card
        className="border-l-4 border-l-emerald-500"
        style={{ padding: '12px', borderLeft: '4px solid var(--brand-primary)' }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
          }}
        >
          Total Revenue
        </p>
        <ClickableAmount
          value={totalRevenue}
          formatFull={formatCurrency}
          formatCompact={formatCompactCurrency}
          style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}
        />
      </Card>
      <Card style={{ padding: '12px', borderLeft: '4px solid #10b981' }}>
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
          }}
        >
          Gross Profit
        </p>
        <ClickableAmount
          value={totalGrossProfit}
          formatFull={formatCurrency}
          formatCompact={formatCompactCurrency}
          style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', margin: 0 }}
        />
      </Card>
      <Card
        className="border-l-4 border-l-indigo-500"
        style={{ padding: '12px', borderLeft: '4px solid var(--brand-secondary)' }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
          }}
        >
          Total Sales Count
        </p>
        <ClickableAmount
          value={salesCount}
          formatFull={formatNumber}
          formatCompact={formatCompactNumber}
          style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}
        />
      </Card>
    </div>
  );
};
