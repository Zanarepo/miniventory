import React, { useState, useRef } from 'react';
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  PieChart,
  BarChart2,
  Download,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export interface BusinessRankingItem {
  business_id: string;
  business_name: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
  sales_count: number;
  expenses_count: number;
  stock_count: number;
  stock_value_cost: number;
  stock_value_retail: number;
  profit_margin: number;
}

interface BusinessComparisonChartProps {
  data: BusinessRankingItem[];
  currencySymbol?: string;
}

type MetricType = 'net_profit' | 'revenue' | 'stock_value_cost' | 'stock_count' | 'expenses';

export const BusinessComparisonChart: React.FC<BusinessComparisonChartProps> = ({
  data,
  currencySymbol = '₦',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('net_profit');
  const [viewMode, setViewMode] = useState<'chart' | 'cards'>('chart');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}
      >
        No business data available to compare for this selection.
      </div>
    );
  }

  // Sort data by the selected metric descending
  const sortedData = [...data].sort((a, b) => (b[selectedMetric] || 0) - (a[selectedMetric] || 0));

  // Find max positive value for relative bar calculation
  const maxVal = Math.max(...sortedData.map((d) => Math.abs(d[selectedMetric] || 0)), 1);
  const totalVal = sortedData.reduce(
    (acc, curr) => acc + Math.max(0, curr[selectedMetric] || 0),
    0,
  );

  const formatValue = (val: number, metric?: MetricType) => {
    if (metric === 'stock_count') {
      return `${val.toLocaleString()} units`;
    }
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatShortValue = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toString();
  };

  const getBarColor = (val: number, metric: MetricType) => {
    if (metric === 'net_profit') {
      return val >= 0 ? '#10B981' : '#EF4444';
    }
    if (metric === 'revenue') return '#10B981';
    if (metric === 'stock_value_cost' || metric === 'stock_count') return '#3B82F6';
    if (metric === 'expenses') return '#F59E0B';
    return 'var(--brand-primary, #10B981)';
  };

  const metrics: { id: MetricType; label: string; icon: React.ReactNode }[] = [
    { id: 'net_profit', label: 'Net Profit', icon: <TrendingUp size={14} /> },
    { id: 'revenue', label: 'Sales Revenue', icon: <DollarSign size={14} /> },
    { id: 'stock_value_cost', label: 'Inventory Value', icon: <Package size={14} /> },
    { id: 'stock_count', label: 'Stock Quantity', icon: <Layers size={14} /> },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign size={14} /> },
  ];

  // Download handlers
  const triggerSuccess = (type: string) => {
    setDownloadSuccess(type);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const downloadSvgImage = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `BizTrack_Comparison_${selectedMetric}_${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    triggerSuccess('SVG');
  };

  const downloadPngImage = () => {
    if (!svgRef.current) {
      // If currently on cards view, switch to chart view briefly or fallback
      downloadSvgImage();
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const rect = svgRef.current.getBoundingClientRect();
    const width = Math.max(rect.width || 800, 800);
    const height = Math.max(rect.height || 380, 380);
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#0F172A'; // Sleek slate backdrop for contrast
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `BizTrack_Comparison_${selectedMetric}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      triggerSuccess('PNG');
    };
    img.src = url;
  };

  // Dimensions for custom SVG Bar Chart
  const svgWidth = 850;
  const svgHeight = 390;
  const margin = { top: 65, right: 35, bottom: 65, left: 85 };
  const chartW = svgWidth - margin.left - margin.right;
  const chartH = svgHeight - margin.top - margin.bottom;
  const numBars = sortedData.length;
  const barSlotWidth = chartW / Math.max(numBars, 1);
  const barWidth = Math.min(barSlotWidth * 0.55, 52);

  return (
    <div style={{ width: '100%' }}>
      {/* Top Action Bar: View Mode Switcher & Download Tools */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              marginRight: '4px',
              fontWeight: 700,
            }}
          >
            ⚡ Compare Metric:
          </span>
          {metrics.map((m) => {
            const isActive = selectedMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive
                    ? '1px solid var(--brand-primary)'
                    : '1px solid var(--border-color)',
                  background: isActive ? 'var(--brand-primary)' : 'var(--surface-color)',
                  color: isActive ? '#fff' : 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
                }}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Downloads */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-app)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setViewMode('chart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'chart' ? 'var(--surface-color)' : 'transparent',
                color: viewMode === 'chart' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'chart' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'chart' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <BarChart2 size={15} />
              <span>Visual Chart</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--surface-color)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: viewMode === 'cards' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'cards' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <PieChart size={15} />
              <span>Leaderboard Cards</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={downloadPngImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title="Download Chart as PNG Image"
            >
              {downloadSuccess === 'PNG' ? (
                <Check size={14} color="#10B981" />
              ) : (
                <ImageIcon size={14} />
              )}
              <span>{downloadSuccess === 'PNG' ? 'Saved PNG!' : 'Download PNG'}</span>
            </button>
            <button
              onClick={downloadSvgImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Download Scalable Vector Graphic (SVG)"
            >
              {downloadSuccess === 'SVG' ? (
                <Check size={14} color="#10B981" />
              ) : (
                <Download size={14} />
              )}
              <span>{downloadSuccess === 'SVG' ? 'Saved SVG!' : 'Download SVG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE SVG VISUAL CHART */}
      {viewMode === 'chart' && (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            background: 'var(--bg-app)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              🏆 Business Performance Visualization (
              {selectedMetric.replace(/_/g, ' ').toUpperCase()})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing Top {sortedData.length} Businesses
            </span>
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              minWidth: '650px',
              display: 'block',
            }}
          >
            <style>
              {`
                .bar-rect { transition: opacity 0.2s ease; cursor: pointer; }
                .bar-rect:hover { opacity: 0.8; }
                .chart-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
              `}
            </style>

            {/* Dark background inside SVG so exports look amazing */}
            <rect width={svgWidth} height={svgHeight} rx={12} fill="#0F172A" />

            {/* Title watermark inside exported image, clearly separated from bar top */}
            <text
              x={28}
              y={30}
              fill="#94A3B8"
              fontSize="13"
              fontWeight="800"
              letterSpacing="0.04em"
              className="chart-text"
            >
              BIZTRACK ANALYTICS — {selectedMetric.replace(/_/g, ' ').toUpperCase()} COMPARISON
            </text>
            <line
              x1={28}
              y1={40}
              x2={svgWidth - 28}
              y2={40}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />

            {/* Grid lines & Y-Axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
              const val = maxVal * step;
              const yPos = margin.top + chartH - step * chartH;
              return (
                <g key={idx}>
                  <line
                    x1={margin.left}
                    y1={yPos}
                    x2={svgWidth - margin.right}
                    y2={yPos}
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray={step > 0 ? '4 4' : 'none'}
                    strokeWidth={step === 0 ? '2' : '1'}
                  />
                  <text
                    x={margin.left - 10}
                    y={yPos + 4}
                    fill="#94A3B8"
                    fontSize="11"
                    textAnchor="end"
                    className="chart-text"
                  >
                    {selectedMetric === 'stock_count'
                      ? formatShortValue(val)
                      : `${currencySymbol}${formatShortValue(val)}`}
                  </text>
                </g>
              );
            })}

            {/* Bars & X-Axis Labels */}
            {sortedData.map((item, index) => {
              const val = item[selectedMetric] || 0;
              const barH = Math.max((Math.abs(val) / maxVal) * chartH, 4);
              const xCenter = margin.left + index * barSlotWidth + barSlotWidth / 2;
              const xPos = xCenter - barWidth / 2;
              const yPos = margin.top + chartH - barH;
              const color = getBarColor(val, selectedMetric);
              const isWinner = index === 0;

              // Truncate business name for x-axis
              const shortName =
                (item.business_name || `Biz ${item.business_id.substring(0, 4)}`).substring(0, 14) +
                ((item.business_name || '').length > 14 ? '...' : '');

              return (
                <g key={item.business_id}>
                  {/* Highlight box for #1 leader */}
                  {isWinner && (
                    <rect
                      x={xPos - 4}
                      y={yPos - 22}
                      width={barWidth + 8}
                      height={barH + 22}
                      fill="rgba(245, 158, 11, 0.12)"
                      rx="6"
                    />
                  )}

                  {/* Main Vertical Bar */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={barH}
                    fill={color}
                    rx="4"
                    className="bar-rect"
                  >
                    <title>{`${item.business_name}: ${formatValue(val, selectedMetric)} (${item.profit_margin}% margin)`}</title>
                  </rect>

                  {/* Value label directly above bar */}
                  <text
                    x={xCenter}
                    y={yPos - 8}
                    fill={isWinner ? '#F59E0B' : '#E2E8F0'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="chart-text"
                  >
                    {formatShortValue(val)}
                  </text>

                  {/* Medal symbol for top 3 */}
                  {index < 3 && (
                    <text
                      x={xCenter}
                      y={yPos + 18}
                      fill="#FFF"
                      fontSize="14"
                      textAnchor="middle"
                      className="chart-text"
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </text>
                  )}

                  {/* X-axis business name */}
                  <text
                    x={xCenter}
                    y={margin.top + chartH + 22}
                    fill="#CBD5E1"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="chart-text"
                  >
                    {shortName}
                  </text>

                  {/* Rank tag below name */}
                  <text
                    x={xCenter}
                    y={margin.top + chartH + 38}
                    fill="#64748B"
                    fontSize="10"
                    textAnchor="middle"
                    className="chart-text"
                  >
                    Rank #{index + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* VIEW 2: LEADERBOARD RANKING CARDS */}
      {viewMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedData.map((item, idx) => {
            const val = item[selectedMetric] || 0;
            const percentage = Math.min(Math.max((Math.abs(val) / maxVal) * 100, 2), 100);
            const sharePercentage =
              totalVal > 0 && val > 0 ? ((val / totalVal) * 100).toFixed(1) : '0';
            const barColor = getBarColor(val, selectedMetric);

            const rankBadge =
              idx === 0 ? (
                <span title="Rank #1 - Platform Leader">
                  <Trophy size={18} color="#F59E0B" fill="#F59E0B" />
                </span>
              ) : idx === 1 ? (
                <span title="Rank #2">
                  <Trophy size={18} color="#94A3B8" fill="#94A3B8" />
                </span>
              ) : idx === 2 ? (
                <span title="Rank #3">
                  <Trophy size={18} color="#D97706" fill="#D97706" />
                </span>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                  #{idx + 1}
                </span>
              );

            return (
              <div
                key={item.business_id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '16px 18px',
                  background: 'var(--surface-color)',
                  borderRadius: 'var(--radius-lg)',
                  border:
                    idx === 0
                      ? '2px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid var(--border-color)',
                  boxShadow:
                    idx === 0
                      ? '0 4px 12px rgba(245, 158, 11, 0.08)'
                      : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Top Bar: Name & Primary Ranking Value */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background:
                          idx === 0
                            ? 'rgba(245, 158, 11, 0.15)'
                            : idx === 1
                              ? 'rgba(148, 163, 184, 0.15)'
                              : idx === 2
                                ? 'rgba(217, 119, 6, 0.15)'
                                : 'var(--bg-app)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rankBadge}
                    </div>
                    <div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          color: 'var(--text-main)',
                          display: 'block',
                        }}
                      >
                        {item.business_name || `Business ${item.business_id.substring(0, 8)}`}
                      </span>
                      {idx === 0 && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#F59E0B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ★ Top Performing Business
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    {totalVal > 0 && val > 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                          padding: '2px 8px',
                          background: 'rgba(0,0,0,0.04)',
                          borderRadius: '10px',
                        }}
                      >
                        {sharePercentage}% of total platform
                      </span>
                    )}
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        color: barColor,
                      }}
                    >
                      {formatValue(val, selectedMetric)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: 'rgba(0,0,0,0.06)',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    marginTop: '2px',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: barColor,
                      borderRadius: '5px',
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                </div>

                {/* Side-by-Side Competitive Metric Matrix */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '10px',
                    marginTop: '6px',
                    paddingTop: '10px',
                    borderTop: '1px dashed var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--bg-app)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      💰 Sales Revenue
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        marginTop: '2px',
                      }}
                    >
                      {formatValue(item.revenue)}
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-app)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      🏆 Net Profit
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: item.net_profit >= 0 ? '#10B981' : '#EF4444',
                        marginTop: '2px',
                      }}
                    >
                      {formatValue(item.net_profit)}{' '}
                      <small style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        ({item.profit_margin}%)
                      </small>
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-app)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      📦 Inventory (Cost)
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#3B82F6',
                        marginTop: '2px',
                      }}
                    >
                      {formatValue(item.stock_value_cost)}{' '}
                      <small
                        style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}
                      >
                        ({item.stock_count} units)
                      </small>
                    </span>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-app)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      💸 Expenses & COGS
                    </span>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#F59E0B',
                        marginTop: '2px',
                      }}
                    >
                      {formatValue(item.expenses + item.cogs)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
