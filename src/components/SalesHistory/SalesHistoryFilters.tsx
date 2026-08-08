import React from 'react';
import { SearchInput } from '../SearchInput';
import { CustomSelect } from '../CustomSelect';

interface SalesHistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterPayMethod: string;
  onFilterPayMethodChange: (val: string) => void;
  period: string;
  onPeriodChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  onClearFilters: () => void;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

export const SalesHistoryFilters: React.FC<SalesHistoryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterPayMethod,
  onFilterPayMethodChange,
  period,
  onPeriodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
}) => {
  return (
    <div
      style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <SearchInput
          placeholder="Search by receipt or items..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomSelect
          style={{ flex: '1 1 140px' }}
          value={filterPayMethod}
          onChange={onFilterPayMethodChange}
          options={[
            { value: '', label: 'All Pay Methods' },
            { value: 'CASH', label: 'Cash' },
            { value: 'POS', label: 'POS' },
            { value: 'TRANSFER', label: 'Transfer' },
            { value: 'MOBILE_MONEY', label: 'Mobile Money' },
            { value: 'SPLIT', label: 'Split' },
            { value: 'VOIDED', label: 'Voided Sales' },
          ]}
        />

        <CustomSelect
          style={{ flex: '1 1 140px' }}
          value={period}
          onChange={onPeriodChange}
          options={[
            { value: 'TODAY', label: 'Today' },
            { value: 'YESTERDAY', label: 'Yesterday' },
            { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
            { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
            { value: 'THIS_MONTH', label: 'This Month' },
            { value: 'LAST_MONTH', label: 'Last Month' },
            { value: 'THIS_YEAR', label: 'This Year' },
            { value: 'CUSTOM', label: 'Custom Range' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {period === 'CUSTOM' ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Date:
            </span>
            <input
              type="date"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing sales from <strong>{formatDate(startDate)}</strong> to{' '}
            <strong>{formatDate(endDate)}</strong>
          </span>
        )}

        {(period !== 'THIS_MONTH' || filterPayMethod || searchQuery) && (
          <button
            onClick={onClearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-danger)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginLeft: 'auto',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
