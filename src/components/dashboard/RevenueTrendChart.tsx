import React, { useState } from 'react';
import type { RevenueTrendDataPoint, RevenueTrendSummary } from '../../hooks/useRevenueTrend';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

export interface RevenueTrendChartProps {
  data: RevenueTrendDataPoint[];
  summary: RevenueTrendSummary;
  currencySymbol?: string;
  selectedDays: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  summary,
  currencySymbol = '₦',
  selectedDays,
  onDaysChange,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = summary.totalRevenue > 0;

  // Chart view box parameters
  const width = 740;
  const height = 260;
  const margin = { top: 25, right: 25, bottom: 40, left: 65 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate scaling and ticks
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const yMax = maxRevenue * 1.15; // add 15% head room at the top

  const formatYAxis = (val: number) => {
    if (val === 0) return `${currencySymbol}0`;
    if (val >= 1_000_000) return `${currencySymbol}${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${currencySymbol}${(val / 1_000).toFixed(val >= 10_000 ? 0 : 1)}k`;
    return `${currencySymbol}${val.toLocaleString()}`;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return margin.left + chartWidth / 2;
    return margin.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    if (yMax <= 0) return margin.top + chartHeight;
    return margin.top + chartHeight - (value / yMax) * chartHeight;
  };

  // Generate SVG path strings for Line and Area fill
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');
  const areaPath =
    data.length > 1
      ? `M ${getX(0)},${margin.top + chartHeight} L ${data
          .map((d, i) => `${getX(i)},${getY(d.revenue)}`)
          .join(' L ')} L ${getX(data.length - 1)},${margin.top + chartHeight} Z`
      : '';

  // Determine date tick indices (avoid overlapping on X axis)
  const step = Math.max(1, Math.floor(data.length / 6));
  const tickIndices: number[] = [];
  for (let i = 0; i < data.length; i += step) {
    tickIndices.push(i);
  }
  if (data.length > 0 && tickIndices[tickIndices.length - 1] !== data.length - 1) {
    tickIndices.push(data.length - 1);
  }

  // Hovered point data
  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? getX(hoveredIndex) : 0;
  const hoveredY = hoveredIndex !== null && hoveredPoint ? getY(hoveredPoint.revenue) : 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderTop: '3px solid var(--brand-primary)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      role="region"
      aria-label="Revenue Trend Analytics Chart"
    >
      {/* 1. Header Section with Title & Timeframe Selector Pills */}
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
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2e7d32',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <h3
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}
            >
              Daily Sales Chart
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              See how much money came into your shop day by day
            </p>
          </div>
        </div>

        {/* Timeframe Selector Pill Buttons */}
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
          aria-label="Select timeframe"
        >
          {[
            { days: 7, label: '7 Days' },
            { days: 30, label: '30 Days' },
            { days: 90, label: '90 Days' },
          ].map((option) => {
            const isSelected = selectedDays === option.days;
            return (
              <button
                key={option.days}
                onClick={() => onDaysChange(option.days)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--brand-primary)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 6px rgba(46, 125, 50, 0.3)' : 'none',
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
            Total Sales Money
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
            {summary.totalRevenue.toLocaleString()}
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
            Daily Average
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
            {Math.round(summary.averageDailyRevenue).toLocaleString()}/day
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
            Highest Sales Day
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2e7d32', marginTop: '2px' }}>
            {summary.peakDateLabel} ({currencySymbol}
            {summary.peakRevenue.toLocaleString()})
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
            Growth Rate
          </span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              backgroundColor: summary.isPositiveGrowth
                ? 'rgba(46, 125, 50, 0.15)'
                : 'rgba(198, 40, 40, 0.15)',
              color: summary.isPositiveGrowth ? '#2e7d32' : '#c62828',
            }}
          >
            <span>{summary.isPositiveGrowth ? '▲' : '▼'}</span>
            <span>
              {summary.growthPercentage > 0
                ? `+${summary.growthPercentage}%`
                : `${summary.growthPercentage}%`}{' '}
              vs start
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive SVG Line Chart Canvas */}
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
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#2e7d32" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.0" />
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

          {/* X-axis ticks and date labels */}
          {tickIndices.map((idx) => {
            const x = getX(idx);
            const point = data[idx];
            if (!point) return null;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={margin.top + chartHeight}
                  x2={x}
                  y2={margin.top + chartHeight + 5}
                  stroke="currentColor"
                  strokeOpacity="0.2"
                />
                <text
                  x={x}
                  y={margin.top + chartHeight + 22}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {point.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill Underneath Line */}
          {hasData && areaPath && <path d={areaPath} fill="url(#revenue-gradient)" />}

          {/* Main Revenue Trend Polyline */}
          {data.length > 0 && (
            <polyline
              fill="none"
              stroke={hasData ? '#2e7d32' : 'var(--border-color)'}
              strokeWidth={hasData ? '3' : '2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={hasData ? 'none' : '6 6'}
              points={linePoints}
              style={{ transition: 'all 0.4s ease' }}
            />
          )}

          {/* Interactive invisible columns for hovering over points */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const nextX = idx < data.length - 1 ? getX(idx + 1) : width - margin.right;
            const prevX = idx > 0 ? getX(idx - 1) : margin.left;
            const colWidth = Math.max((nextX - prevX) / 2, 12);

            return (
              <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} style={{ cursor: 'pointer' }}>
                {/* Invisible wider interaction zone */}
                <rect
                  x={x - colWidth / 2}
                  y={margin.top}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Visible small circle on every point when data exists and is modest count */}
                {hasData && (data.length <= 31 || hoveredIndex === idx) && (
                  <circle
                    cx={x}
                    cy={getY(d.revenue)}
                    r={hoveredIndex === idx ? 6 : 3}
                    fill={hoveredIndex === idx ? '#ffffff' : '#2e7d32'}
                    stroke="#2e7d32"
                    strokeWidth={hoveredIndex === idx ? '3' : '1.5'}
                    style={{ transition: 'r 0.2s ease' }}
                  />
                )}
              </g>
            );
          })}

          {/* Hover Crosshair and Active Indicator */}
          {hoveredIndex !== null && hoveredPoint && (
            <>
              <line
                x1={hoveredX}
                y1={margin.top}
                x2={hoveredX}
                y2={margin.top + chartHeight}
                stroke="#2e7d32"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                pointerEvents="none"
              />
              <circle
                cx={hoveredX}
                cy={hoveredY}
                r="7"
                fill="var(--brand-primary)"
                stroke="#ffffff"
                strokeWidth="2.5"
                pointerEvents="none"
              />
            </>
          )}
        </svg>

        {/* Floating HTML Tooltip on Hover */}
        {hoveredIndex !== null && hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(Math.max((hoveredX / width) * 100, 15), 85)}%`,
              top: `${Math.max((hoveredY / height) * 100 - 30, 0)}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid var(--brand-primary)',
              borderRadius: '10px',
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              zIndex: 10,
              pointerEvents: 'none',
              minWidth: '160px',
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
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currencySymbol}
              {hoveredPoint.revenue.toLocaleString()}
            </div>
            <div
              style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 600, marginTop: '2px' }}
            >
              {hoveredPoint.transactionCount === 1
                ? '1 Sale Recorded'
                : `${hoveredPoint.transactionCount} Sales Recorded`}
            </div>
          </div>
        )}

        {/* Empty State Overlay if no revenue activity at all */}
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
            <Sparkles size={28} color="var(--brand-primary)" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              No Revenue Activity Found
            </h4>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#dddddd',
                margin: '6px 0 16px',
                lineHeight: 1.5,
              }}
            >
              Your line chart will dynamically plot daily sales trajectories with smooth trendlines
              once transactions are recorded.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/sales')}>
              Record New Sale Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
