import React from 'react';
import { BUSINESS_CATEGORIES } from '../constants/businessCategories';
import type { BusinessCategory } from '../types/business';
import { Store } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

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
      <div style={{ position: 'relative' }}>
        <CustomSelect
          value={value}
          onChange={(val) => onChange(val as BusinessCategory)}
          required={required}
          leftIcon={<Store size={18} />}
          options={BUSINESS_CATEGORIES.map(cat => ({
            value: cat.value,
            label: `${cat.icon} ${cat.label}`
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
