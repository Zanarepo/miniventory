import React from 'react';
import { SUPPORTED_CURRENCIES } from '../constants/businessCategories';
import { Coins, ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  label = 'Primary Trading Currency',
  value,
  onChange,
  helperText = 'Selected currency symbol will appear on all bills, receipts, and ledger totals.',
  errorText,
  required = true,
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && <span style={{ color: 'var(--status-error)' }}>*</span>}
        </label>
      )}
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <span className="input-icon" style={{ zIndex: 2 }}>
          <Coins size={18} />
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field ${errorText ? 'has-error' : ''}`}
          style={{
            paddingRight: '36px',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundColor: 'var(--bg-input)',
            width: '100%',
          }}
          required={required}
        >
          {SUPPORTED_CURRENCIES.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.symbol} — {curr.name} ({curr.code})
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={17} />
        </span>
      </div>
      {errorText ? (
        <span className="input-error">{errorText}</span>
      ) : helperText ? (
        <span className="input-helper">{helperText}</span>
      ) : null}
    </div>
  );
};
