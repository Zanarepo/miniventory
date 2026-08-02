import React from 'react';

export interface KPISubMetric {
  label: string;
  value: string;
  color?: string;
}

export interface KPICardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trendPercentage?: number;
  trendLabel?: string;
  isPositiveTrend?: boolean;
  neutralTrend?: boolean;
  subMetrics?: KPISubMetric[];
  accentColor?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trendPercentage,
  trendLabel = 'vs Yesterday',
  isPositiveTrend = true,
  neutralTrend = false,
  subMetrics,
  accentColor = 'var(--brand-primary)',
  onClick,
}) => {
  // Compute accessible directional indicators
  let trendIcon = '→';
  let trendTextColor = 'var(--text-muted)';
  let trendBgColor = 'rgba(150, 150, 150, 0.15)';
  let trendPrefix = '';

  if (!neutralTrend && trendPercentage !== undefined) {
    if (trendPercentage > 0) {
      trendIcon = '▲';
      trendPrefix = '+';
      trendTextColor = isPositiveTrend ? '#2e7d32' : '#c62828';
      trendBgColor = isPositiveTrend ? 'rgba(46, 125, 50, 0.15)' : 'rgba(198, 40, 40, 0.15)';
    } else if (trendPercentage < 0) {
      trendIcon = '▼';
      trendTextColor = isPositiveTrend ? '#c62828' : '#2e7d32'; // e.g., decreasing expenses is positive!
      trendBgColor = isPositiveTrend ? 'rgba(198, 40, 40, 0.15)' : 'rgba(46, 125, 50, 0.15)';
    }
  }

  const cardStyle: React.CSSProperties = {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    borderTop: `3px solid ${accentColor}`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08)',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    margin: '2px 0 6px',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  };

  const trendContainerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '16px',
    fontSize: '0.74rem',
    fontWeight: 700,
    backgroundColor: trendBgColor,
    color: trendTextColor,
    width: 'fit-content',
  };

  const subMetricsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${subMetrics ? subMetrics.length : 1}, 1fr)`,
    gap: '8px',
    marginTop: '10px',
    paddingTop: '8px',
    borderTop: '1px dashed var(--border-color)',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 8px 18px -6px rgba(0, 0, 0, 0.22)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '';
  };

  return (
    <div
      className="glass-panel"
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          {icon && <div style={iconContainerStyle}>{icon}</div>}
        </div>

        <div style={valueStyle}>{value}</div>

        {trendPercentage !== undefined && (
          <div
            style={trendContainerStyle}
            title={`${trendPrefix}${trendPercentage}% ${trendLabel}`}
          >
            <span aria-hidden="true" style={{ fontSize: '0.8rem' }}>
              {trendIcon}
            </span>
            <span>
              {trendPrefix}
              {trendPercentage}% {trendLabel}
            </span>
          </div>
        )}
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={subMetricsContainerStyle}>
          {subMetrics.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.label}
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: item.color || 'var(--text-main)',
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
