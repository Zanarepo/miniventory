import React from 'react';
import { Card, LoadingSpinner } from '..';
import type { BusinessHealthMetrics } from '../../hooks/useBusinessHealth';
import { HeartPulse, TrendingUp, TrendingDown, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export interface BusinessHealthWidgetProps {
  metrics: BusinessHealthMetrics;
  isLoading?: boolean;
}

export const BusinessHealthWidget: React.FC<BusinessHealthWidgetProps> = ({
  metrics,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const { score, rating, trendText, isPositiveTrend, color, diagnostics } = metrics;

  // Calculate SVG circular arc stroke offset for a 120px ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card
      className="glass-panel"
      style={{
        padding: '28px 30px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `5px solid ${color}`,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: `${color}25`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartPulse size={26} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0 0 4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {t('dashHealthTitle')}
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '2px 9px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={12} />
                Live Offline Engine
              </span>
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Easy checkup combining your actual take-home profits, daily spending control, and
              items ready for sale
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px 0', textAlign: 'center' }}>
          <LoadingSpinner size="md" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Checking your total shop profits, bills paid, and available stock items...
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Radial Score & Rating Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '26px',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Circular SVG Meter */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke={color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.3s' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    lineHeight: 1,
                  }}
                >
                  {score}%
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Health
                </span>
              </div>
            </div>

            {/* Rating Details & Trend */}
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Overall Assessment
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '10px',
                  backgroundColor: `${color}20`,
                  color: color,
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  marginBottom: '10px',
                  boxShadow: `0 4px 12px ${color}30`,
                }}
              >
                <ShieldCheck size={20} />
                {rating}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: isPositiveTrend ? '#10b981' : '#ef4444',
                }}
              >
                {isPositiveTrend ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {trendText}
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostic Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {diagnostics.map((diag, i) => {
              const barColor =
                diag.score >= 80 ? '#10b981' : diag.score >= 50 ? '#3b82f6' : '#f59e0b';
              return (
                <div
                  key={i}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}
                    >
                      {diag.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: `${barColor}20`,
                          color: barColor,
                        }}
                      >
                        {diag.statusText}
                      </span>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          width: '36px',
                          textAlign: 'right',
                        }}
                      >
                        {diag.score}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '7px',
                      backgroundColor: 'rgba(0,0,0,0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      marginBottom: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(5, diag.score))}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '999px',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {diag.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
