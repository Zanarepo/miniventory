import React, { useState } from 'react';
import type {
  ExpenseTrendDataPoint,
  ExpenseTrendSummary,
  ExpenseGranularity,
} from '../../hooks/useExpenseTrend';
import { Receipt, Calendar, Sparkles, Layers } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

export interface ExpenseTrendChartProps {
  data: ExpenseTrendDataPoint[];
  summary: ExpenseTrendSummary;
  granularity: ExpenseGranularity;
  onGranularityChange: (g: ExpenseGranularity) => void;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({
  data,
  summary,
  granularity,
  onGranularityChange,
  currencySymbol = '₦',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = summary.totalExpenses > 0;

  // Chart view box parameters
  const width = 740;
  const height = 260;
  const margin = { top: 25, right: 25, bottom: 40, left: 65 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scaling and ticks
  const maxExpense = Math.max(...data.map((d) => d.amount), 50);
  const yMax = maxExpense * 1.15; // add 15% head room

  const formatYAxis = (val: number) => {
    if (val === 0) return `${currencySymbol}0`;
    if (val >= 1_000_000) return `${currencySymbol}${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${currencySymbol}${(val / 1_000).toFixed(val >= 10_000 ? 0 : 1)}k`;
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  const barCount = Math.max(data.length, 1);
  const slotWidth = chartWidth / barCount;
  // Calculate optimal bar width with clean padding
  const barWidth = Math.min(Math.max(slotWidth * 0.55, 18), 52);

  const getY = (value: number) => {
    if (yMax <= 0) return margin.top + chartHeight;
    return margin.top + chartHeight - (value / yMax) * chartHeight;
  };

  // Unit suffix for period average
  const getPeriodUnit = () => {
    if (granularity === 'daily') return '/day';
    if (granularity === 'weekly') return '/wk';
    return '/mo';
  };

  // Hovered bar data
  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? margin.left + (hoveredIndex + 0.5) * slotWidth : 0;
  const hoveredY = hoveredIndex !== null && hoveredPoint ? getY(hoveredPoint.amount) : 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderTop: '3px solid #c62828',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      role="region"
      aria-label="Expense & Outflow Trend Analytics Chart"
    >
      {/* 1. Header Section with Title & Granularity Selector Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(198, 40, 40, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c62828',
            }}
          >
            <Receipt size={20} />
          </div>
          <div>
            <h3
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}
            >
              Daily Expenses Chart
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              See where your shop money was spent and which items cost the most
            </p>
          </div>
        </div>

        {/* Granularity Selector Pill Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            padding: '4px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
          }}
          role="group"
          aria-label="Select expense granularity"
        >
          {[
            { value: 'daily' as ExpenseGranularity, label: 'Daily (14D)' },
            { value: 'weekly' as ExpenseGranularity, label: 'Weekly (8W)' },
            { value: 'monthly' as ExpenseGranularity, label: 'Monthly (6M)' },
          ].map((option) => {
            const isSelected = granularity === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onGranularityChange(option.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: isSelected ? '#c62828' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 6px rgba(198, 40, 40, 0.3)' : 'none',
                }}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Summary Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Total Money Spent
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '2px',
            }}
          >
            {currencySymbol}
            {summary.totalExpenses.toLocaleString()}
          </div>
        </div>

        <div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Average Spend
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '2px',
            }}
          >
            {currencySymbol}
            {Math.round(summary.periodAverage).toLocaleString()}
            {getPeriodUnit()}
          </div>
        </div>

        <div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Highest Spending Time
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c62828', marginTop: '2px' }}>
            {summary.peakPeriodLabel} ({currencySymbol}
            {summary.peakExpenseAmount.toLocaleString()})
          </div>
        </div>

        <div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Biggest Expense Type
          </span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '2px',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              backgroundColor: 'rgba(245, 124, 0, 0.15)',
              color: '#f57c00',
            }}
          >
            <Layers size={13} />
            <span>{summary.topOverallCategory}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive SVG Bar Chart Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'visible',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '320px',
            overflow: 'visible',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))',
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="expense-bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d32f2f" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c62828" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="expense-bar-hover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5252" stopOpacity="1" />
              <stop offset="100%" stopColor="#d32f2f" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis tick markers */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = margin.top + chartHeight - ratio * chartHeight;
            const value = ratio * yMax;
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {formatYAxis(value)}
                </text>
              </g>
            );
          })}

          {/* X-axis tick labels and vertical Bars */}
          {data.map((d, idx) => {
            const centerX = margin.left + (idx + 0.5) * slotWidth;
            const barX = centerX - barWidth / 2;
            const barY = getY(d.amount);
            const barHeight = Math.max(margin.top + chartHeight - barY, 0);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} style={{ cursor: 'pointer' }}>
                {/* Invisible wider column for hover target */}
                <rect
                  x={margin.left + idx * slotWidth}
                  y={margin.top}
                  width={slotWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* X-axis Label (hide every other label if more than 12 points to avoid overlap) */}
                {(data.length <= 12 || idx % 2 === 0 || isHovered) && (
                  <>
                    <line
                      x1={centerX}
                      y1={margin.top + chartHeight}
                      x2={centerX}
                      y2={margin.top + chartHeight + 4}
                      stroke="currentColor"
                      strokeOpacity="0.2"
                    />
                    <text
                      x={centerX}
                      y={margin.top + chartHeight + 20}
                      textAnchor="middle"
                      fill={isHovered ? '#c62828' : 'var(--text-muted)'}
                      fontSize={isHovered ? '11.5' : '10.5'}
                      fontWeight={isHovered ? '800' : '600'}
                      style={{ transition: 'all 0.15s ease' }}
                    >
                      {d.label}
                    </text>
                  </>
                )}

                {/* Vertical Expense Bar */}
                {hasData && barHeight > 0 && (
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill={isHovered ? 'url(#expense-bar-hover)' : 'url(#expense-bar-gradient)'}
                    stroke={isHovered ? '#ffffff' : 'transparent'}
                    strokeWidth={isHovered ? '1.5' : '0'}
                    style={{
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                      transformOrigin: `center ${margin.top + chartHeight}px`,
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating HTML Tooltip on Hover */}
        {hoveredIndex !== null && hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(Math.max((hoveredX / width) * 100, 18), 82)}%`,
              top: `${Math.max((hoveredY / height) * 100 - 32, 0)}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid #c62828',
              borderRadius: '10px',
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              zIndex: 10,
              pointerEvents: 'none',
              minWidth: '170px',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <Calendar size={13} /> {hoveredPoint.date} ({hoveredPoint.label})
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currencySymbol}
              {hoveredPoint.amount.toLocaleString()}
            </div>
            <div
              style={{ fontSize: '0.75rem', color: '#c62828', fontWeight: 700, marginTop: '2px' }}
            >
              {hoveredPoint.transactionCount === 1
                ? '1 Expense Entry'
                : `${hoveredPoint.transactionCount} Expense Entries`}
            </div>
            {hoveredPoint.topCategoryName && hoveredPoint.topCategoryName !== 'None' && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#f57c00',
                  fontWeight: 700,
                  marginTop: '4px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '4px',
                }}
              >
                Top Driver: {hoveredPoint.topCategoryName}
              </div>
            )}
          </div>
        )}

        {/* Empty State Overlay if no expense activity in selected granularity */}
        {!hasData && !isLoading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -40%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px 28px',
              borderRadius: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              maxWidth: '440px',
            }}
          >
            <Sparkles size={28} color="#c62828" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>No Expenses Recorded</h4>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#dddddd',
                margin: '6px 0 16px',
                lineHeight: 1.5,
              }}
            >
              Your bar chart will automatically aggregate operational outflow and highlight category
              drivers once expenses are logged.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/expenses')}>
              Record New Expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
