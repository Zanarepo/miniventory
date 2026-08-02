import React from 'react';
import { SUPPORTED_CURRENCIES } from '../constants/businessCategories';
import { Coins } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

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
      <div style={{ position: 'relative' }}>
        <CustomSelect
          value={value}
          onChange={(val) => onChange(val)}
          required={required}
          leftIcon={<Coins size={18} />}
          options={SUPPORTED_CURRENCIES.map(curr => ({
            value: curr.code,
            label: `${curr.symbol} — ${curr.name} (${curr.code})`
          }))}
          className={errorText ? 'has-error' : ''}
          style={{ width: '100%', height: '48px', backgroundColor: 'var(--bg-input)' }}
        />
      </div>
      {errorText ? (
        <span className="input-error">{errorText}</span>
      ) : helperText ? (
        <span className="input-helper">{helperText}</span>
      ) : null}
    </div>
  );
};
