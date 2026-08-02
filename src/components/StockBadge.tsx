import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface StockBadgeProps {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  quantity: number;
  unit: string;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  status,
  quantity,
  unit,
  className = '',
}) => {
  let bgColor = 'rgba(46, 125, 50, 0.12)';
  let textColor = 'var(--brand-primary)';
  let icon = <CheckCircle2 size={15} />;
  let text = `In Stock (${quantity} ${unit})`;

  if (status === 'out_of_stock') {
    bgColor = 'rgba(211, 47, 47, 0.15)';
    textColor = 'var(--brand-danger)';
    icon = <XCircle size={15} />;
    text = `Out of Stock (${quantity} ${unit})`;
  } else if (status === 'low_stock') {
    bgColor = 'rgba(245, 158, 11, 0.16)';
    textColor = '#d97706';
    icon = <AlertTriangle size={15} />;
    text = `Low Stock (${quantity} ${unit})`;
  }

  return (
    <span
      className={`stock-badge ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '16px',
        fontSize: '0.78rem',
        fontWeight: 700,
        backgroundColor: bgColor,
        color: textColor,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};
