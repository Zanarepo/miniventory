import React, { useState } from 'react';
import { Calendar, Filter, Check } from 'lucide-react';

export interface DashboardFilterOption {
  id: string;
  label: string;
  days: number;
  description: string;
}

const DASHBOARD_FILTERS: DashboardFilterOption[] = [
  { id: 'today', label: 'Today', days: 1, description: "Today's shop sales and bills" },
  { id: 'yesterday', label: 'Yesterday', days: 2, description: "Yesterday's shop numbers" },
  { id: 'this_week', label: 'This Week', days: 7, description: 'Past 7 days of shop records' },
  { id: 'this_month', label: 'This Month', days: 30, description: "This month's shop figures" },
  {
    id: 'last_month',
    label: 'Last Month',
    days: 60,
    description: "Previous month's total figures",
  },
  { id: 'this_year', label: 'This Year', days: 365, description: 'Records for this entire year' },
  { id: 'custom', label: 'Custom Date', days: 90, description: 'Past 90 days record check' },
];

export interface DashboardFilterBarProps {
  activeFilterId?: string;
  onFilterSelect: (filter: DashboardFilterOption) => void;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  activeFilterId = 'this_month',
  onFilterSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeFilterId);

  const handleSelect = (opt: DashboardFilterOption) => {
    setSelectedId(opt.id);
    onFilterSelect(opt);
  };

  const currentOption = DASHBOARD_FILTERS.find((f) => f.id === selectedId) || DASHBOARD_FILTERS[3];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '14px 20px',
        backgroundColor: 'rgba(0,0,0,0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        marginBottom: '26px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar size={19} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
            >
              Showing Records For:
            </span>
            <span
              style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {currentOption.label}
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '1px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={12} />
                Active ({currentOption.days} Days)
              </span>
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {currentOption.description} • Works automatically offline without internet
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <Filter size={15} style={{ color: 'var(--text-muted)', marginRight: '4px' }} />
        {DASHBOARD_FILTERS.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                borderColor: isSelected ? '#3b82f6' : 'var(--border-color)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
