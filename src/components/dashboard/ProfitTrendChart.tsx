import React, { useState } from 'react';
import type {
  ProfitTrendDataPoint,
  ProfitTrendSummary,
  ProfitGranularity,
} from '../../hooks/useProfitTrend';
import { Award, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

export interface ProfitTrendChartProps {
  data: ProfitTrendDataPoint[];
  summary: ProfitTrendSummary;
  granularity: ProfitGranularity;
  onGranularityChange: (g: ProfitGranularity) => void;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  data,
  summary,
  granularity,
  onGranularityChange,
  currencySymbol = '₦',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = summary.hasActivity;

  // Chart dimensions and bounds
  const width = 740;
  const height = 260;
  const margin = { top: 25, right: 30, bottom: 40, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate dynamic range including negative profit capability
  const maxVal = Math.max(...data.map((d) => d.profit), 100);
  const minVal = Math.min(...data.map((d) => d.profit), 0);

  const yMax = maxVal > 0 ? maxVal * 1.15 : 100;
  const yMin = minVal < 0 ? minVal * 1.15 : 0;
  const yRange = Math.max(yMax - yMin, 1);

  const formatYAxis = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs === 0) return `${currencySymbol}0`;
    if (abs >= 1_000_000) return `${sign}${currencySymbol}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)
      return `${sign}${currencySymbol}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
    return `${sign}${currencySymbol}${abs.toLocaleString()}`;
  };

  const getY = (value: number) => {
    return margin.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
  };

  const zeroY = getY(0);

  // Compute coordinate points
  const points = data.map((d, idx) => {
    const x =
      data.length <= 1
        ? margin.left + chartWidth / 2
        : margin.left + (idx / (data.length - 1)) * chartWidth;
    const y = getY(d.profit);
    return { x, y, data: d };
  });

  // Build svg path strings for Line and Shaded Area
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath =
    points.length > 0
      ? `M ${points[0].x} ${zeroY} ` +
        points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
        ` L ${points[points.length - 1].x} ${zeroY} Z`
      : '';

  // Unit suffix for period averages
  const getPeriodUnit = () => {
    if (granularity === 'daily') return '/day';
    if (granularity === 'weekly') return '/wk';
    return '/mo';
  };

  // Hover details
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderTop: '3px solid #6366f1',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      role="region"
      aria-label="Net Profit & Fiscal Margins Area Chart"
    >
      {/* 1. Header & Timeframe Selector Pills */}
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
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <h3
              style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}
            >
              Take-Home Profit Chart
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Your actual take-home profit after subtracting all store bills and expenses
            </p>
          </div>
        </div>

        {/* Granularity Selector Pills */}
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
          aria-label="Select profit trend granularity"
        >
          {[
            { value: 'daily' as ProfitGranularity, label: 'Daily (14D)' },
            { value: 'weekly' as ProfitGranularity, label: 'Weekly (8W)' },
            { value: 'monthly' as ProfitGranularity, label: 'Monthly (6M)' },
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
                  backgroundColor: isSelected ? '#6366f1' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 6px rgba(99, 102, 241, 0.35)' : 'none',
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
            Total Take-Home Profit
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: summary.totalNetProfit >= 0 ? '#10b981' : '#c62828',
              marginTop: '2px',
            }}
          >
            {summary.totalNetProfit < 0 ? '-' : ''}
            {currencySymbol}
            {Math.abs(summary.totalNetProfit).toLocaleString()}
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
            Profit Margin Percentage
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
            }}
          >
            <span>{summary.profitMargin}%</span>
            {summary.profitMargin >= 15 ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                Healthy
              </span>
            ) : summary.profitMargin > 0 ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                Moderate
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#c62828',
                  backgroundColor: 'rgba(198, 40, 40, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                Low
              </span>
            )}
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
            Average Profit Made
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
            {Math.round(summary.averageProfit).toLocaleString()}
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
            Highest Profit Time
          </span>
          <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#6366f1', marginTop: '2px' }}>
            {summary.peakPeriodLabel} ({currencySymbol}
            {summary.peakProfitAmount.toLocaleString()})
          </div>
        </div>
      </div>

      {/* 3. Custom SVG Area Chart Canvas */}
      <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '320px',
            overflow: 'visible',
            filter: 'drop-shadow(0 6px 14px rgba(99, 102, 241, 0.1))',
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="profit-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.55" />
              <stop offset="65%" stopColor="#818cf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const val = yMin + ratio * yRange;
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {formatYAxis(val)}
                </text>
              </g>
            );
          })}

          {/* Zero break-even horizontal axis line */}
          <g>
            <line
              x1={margin.left}
              y1={zeroY}
              x2={width - margin.right}
              y2={zeroY}
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.5"
            />
            {yMin < 0 && (
              <text
                x={width - margin.right - 4}
                y={zeroY - 6}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="10"
                fontWeight="700"
              >
                Break-even ($0)
              </text>
            )}
          </g>

          {/* Shaded Area Polygon & Top Boundary Stroke Line */}
          {hasData && points.length > 0 && (
            <>
              <path d={areaPath} fill="url(#profit-area-gradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Interactive column slices and data points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const sliceWidth = chartWidth / Math.max(points.length, 1);
            const sliceLeft = p.x - sliceWidth / 2;

            return (
              <g key={idx}>
                {/* Invisible hover capture region */}
                <rect
                  x={sliceLeft}
                  y={margin.top}
                  width={sliceWidth}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  style={{ cursor: 'pointer' }}
                />

                {/* Vertical guideline when hovered */}
                {isHovered && hasData && (
                  <line
                    x1={p.x}
                    y1={margin.top}
                    x2={p.x}
                    y2={margin.top + chartHeight}
                    stroke="#6366f1"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    pointerEvents="none"
                  />
                )}

                {/* Data point circle marker */}
                {hasData && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#ffffff' : '#6366f1'}
                    stroke="#6366f1"
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                    style={{ transition: 'all 0.2s ease', pointerEvents: 'none' }}
                  />
                )}

                {/* X-Axis labels (hide alternate labels on high points to prevent occlusion) */}
                {(data.length <= 10 || idx % 2 === 0 || isHovered) && (
                  <>
                    <line
                      x1={p.x}
                      y1={margin.top + chartHeight}
                      x2={p.x}
                      y2={margin.top + chartHeight + 5}
                      stroke="currentColor"
                      strokeOpacity="0.2"
                    />
                    <text
                      x={p.x}
                      y={margin.top + chartHeight + 20}
                      textAnchor="middle"
                      fill={isHovered ? '#6366f1' : 'var(--text-muted)'}
                      fontSize={isHovered ? '11.5' : '10.5'}
                      fontWeight={isHovered ? '800' : '600'}
                      style={{ transition: 'all 0.15s ease', pointerEvents: 'none' }}
                    >
                      {p.data.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating HTML Tooltip on Hover with Full Fiscal Formula Breakdown */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(Math.max((hoveredPoint.x / width) * 100, 18), 82)}%`,
              top: `${Math.max((hoveredPoint.y / height) * 100 - 35, 0)}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'var(--bg-app)',
              border: '2px solid #6366f1',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
              zIndex: 15,
              pointerEvents: 'none',
              minWidth: '210px',
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
                marginBottom: '6px',
              }}
            >
              <Calendar size={13} /> {hoveredPoint.data.date} ({hoveredPoint.data.label})
            </div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: hoveredPoint.data.profit >= 0 ? '#10b981' : '#c62828',
              }}
            >
              {hoveredPoint.data.profit < 0 ? '-' : ''}
              {currencySymbol}
              {Math.abs(hoveredPoint.data.profit).toLocaleString()}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Net Profit
              </span>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#6366f1',
                fontWeight: 700,
                margin: '2px 0 6px',
              }}
            >
              Margin: {hoveredPoint.data.profitMargin}% of Revenue
            </div>
            {/* Breakdown lines */}
            <div
              style={{
                fontSize: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                color: 'var(--text-main)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gross Revenue:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>
                  +{currencySymbol}
                  {hoveredPoint.data.revenue.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>COGS (Goods):</span>
                <span style={{ fontWeight: 600, color: '#f57c00' }}>
                  -{currencySymbol}
                  {hoveredPoint.data.cogs.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating Outflow:</span>
                <span style={{ fontWeight: 600, color: '#c62828' }}>
                  -{currencySymbol}
                  {hoveredPoint.data.expenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State Overlay */}
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
              maxWidth: '460px',
            }}
          >
            <ShieldCheck size={30} color="#6366f1" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Awaiting Fiscal Activity
            </h4>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#dddddd',
                margin: '6px 0 16px',
                lineHeight: 1.5,
              }}
            >
              Your Net Profit Area Chart automatically deducts Cost of Goods Sold and operating
              expenses from revenue once transactions occur.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="primary" size="sm" onClick={() => navigate('/pos')}>
                Open POS Terminal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
