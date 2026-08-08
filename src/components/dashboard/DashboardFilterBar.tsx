import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

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
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0,0,0,0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} color="var(--brand-primary)" />
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          Viewing:
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--text-main)',
          }}
        >
          {currentOption.label} ({currentOption.days}d)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        {DASHBOARD_FILTERS.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                borderColor: isSelected ? '#3b82f6' : 'var(--border-color)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
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
