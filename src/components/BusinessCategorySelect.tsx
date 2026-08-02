import React from 'react';
import { BUSINESS_CATEGORIES } from '../constants/businessCategories';
import type { BusinessCategory } from '../types/business';
import { Store, ChevronDown } from 'lucide-react';

interface BusinessCategorySelectProps {
  label?: string;
  value: BusinessCategory | string;
  onChange: (value: BusinessCategory) => void;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const BusinessCategorySelect: React.FC<BusinessCategorySelectProps> = ({
  label = 'Business Sector & Industry Category',
  value,
  onChange,
  helperText,
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
          <Store size={18} />
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BusinessCategory)}
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
          {BUSINESS_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
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
