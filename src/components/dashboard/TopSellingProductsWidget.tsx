import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '..';
import type {
  BestsellerProductItem,
  TopSellingSummary,
  TopSellingSortBy,
} from '../../hooks/useTopSellingProducts';
import { Award, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export interface TopSellingProductsWidgetProps {
  products: BestsellerProductItem[];
  summary: TopSellingSummary;
  days: number;
  onDaysChange: (days: number) => void;
  sortBy: TopSellingSortBy;
  onSortByChange: (sort: TopSellingSortBy) => void;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const TopSellingProductsWidget: React.FC<TopSellingProductsWidgetProps> = ({
  products,
  summary,
  days,
  onDaysChange,
  sortBy,
  onSortByChange,
  currencySymbol = '₦',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const formatCurr = (amount: number): string => {
    if (amount >= 1_000_000) {
      return `${currencySymbol}${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 10_000) {
      return `${currencySymbol}${(amount / 1_000).toFixed(1)}k`;
    }
    return `${currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const timeframes = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];

  const sortOptions: { label: string; value: TopSellingSortBy }[] = [
    { label: 'By Total Income', value: 'revenue' },
    { label: 'By Quantity Sold', value: 'units' },
    { label: 'By Profit Earned', value: 'profit' },
  ];

  return (
    <Card
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '4px solid #f59e0b', // Golden trophy top border
      }}
    >
      {/* Widget Header & Timeframe Selection */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0,
            }}
          >
            <Award size={26} />
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
              {t('dashBestsellersTitle')}
              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#d97706',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  lineHeight: 1.2,
                }}
              >
                Top 10 Bestsellers
              </span>
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Your most popular shop items ranked by total money earned, quantity sold, and profit
              made
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: 'rgba(0,0,0,0.04)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          {timeframes.map((tf) => {
            const isSelected = days === tf.value;
            return (
              <button
                key={tf.value}
                type="button"
                onClick={() => onDaysChange(tf.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--card-bg, #ffffff)' : 'transparent',
                  color: isSelected ? '#d97706' : 'var(--text-muted)',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px 0', textAlign: 'center' }}>
          <LoadingSpinner size="md" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Aggregating customer receipts and ranking top bestselling merchandise...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            padding: '38px 24px',
            textAlign: 'center',
            backgroundColor: 'rgba(245, 158, 11, 0.03)',
            border: '1px dashed rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
          }}
        >
          <ShoppingCart size={40} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
          <h4
            style={{
              margin: '0 0 6px',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            No sales recorded in the last {days} days
          </h4>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              maxWidth: '500px',
              display: 'inline-block',
            }}
          >
            When you process customer sales receipts, your Top 10 bestselling items and most
            profitable merchandise will be celebrated right here.
          </p>
          <br />
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/sales')}
            style={{
              backgroundColor: '#f59e0b',
              borderColor: '#f59e0b',
              color: '#000',
              fontWeight: 700,
            }}
          >
            Record Customer Sale <ArrowRight size={15} style={{ marginLeft: '6px' }} />
          </Button>
        </div>
      ) : (
        <>
          {/* Top KPI Strip & Sort Selector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
              padding: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Top 10 Total Income
              </div>
              <div
                style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}
              >
                {formatCurr(summary.totalTopRevenue)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Top 10 Quantity Sold
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: '2px',
                }}
              >
                {summary.totalTopUnits}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  items sold
                </span>
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Top 10 Total Profit
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#10b981',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {formatCurr(summary.totalTopProfit)}
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontWeight: 700,
                  }}
                >
                  {summary.totalTopRevenue > 0
                    ? ((summary.totalTopProfit / summary.totalTopRevenue) * 100).toFixed(1)
                    : 0}
                  % profit
                </span>
              </div>
            </div>
          </div>

          {/* Metric Sort Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sortOptions.map((opt) => {
                const isActive = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSortByChange(opt.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      borderColor: isActive ? '#f59e0b' : 'var(--border-color)',
                      color: isActive ? '#d97706' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing Top {products.length} performers over past {days} days
            </div>
          </div>

          {/* Responsive Leaderboard Cards (Mobile Optimized - Zero Horizontal Scrolling) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {products.map((item) => {
              const isGold = item.rank === 1;
              const isSilver = item.rank === 2;
              const isBronze = item.rank === 3;

              let rankContent: React.ReactNode = `#${item.rank}`;
              let rankBg = 'rgba(0,0,0,0.06)';
              const rankColor = 'var(--text-main)';

              if (isGold) {
                rankContent = '🥇';
                rankBg = 'rgba(234, 179, 8, 0.2)';
              } else if (isSilver) {
                rankContent = '🥈';
                rankBg = 'rgba(148, 163, 184, 0.25)';
              } else if (isBronze) {
                rankContent = '🥉';
                rankBg = 'rgba(180, 83, 9, 0.2)';
              }

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: isGold ? 'rgba(245, 158, 11, 0.06)' : 'rgba(0,0,0,0.02)',
                    border: isGold
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid var(--border-color)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Left Side: Rank Badge & Item Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: '1 1 200px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: rankBg,
                        color: rankColor,
                        fontWeight: 800,
                        fontSize: isGold || isSilver || isBronze ? '1.35rem' : '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {rankContent}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.96rem' }}
                      >
                        {item.productName}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {item.categoryName} • Sold{' '}
                        <strong>{item.unitsSold.toLocaleString()}</strong> {item.unit}s
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Money & Profit */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Total Income
                      </div>
                      <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#d97706' }}>
                        {formatCurr(item.revenue)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '85px' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Actual Profit
                      </div>
                      <div
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 700,
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px',
                        }}
                      >
                        {formatCurr(item.profit)}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 5px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            fontWeight: 800,
                          }}
                        >
                          {item.marginPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
};
