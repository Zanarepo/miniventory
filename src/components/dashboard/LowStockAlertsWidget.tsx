import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '..';
import type { LowStockAlertItem, LowStockAlertsSummary } from '../../hooks/useLowStockAlerts';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export interface LowStockAlertsWidgetProps {
  alerts: LowStockAlertItem[];
  summary: LowStockAlertsSummary;
  isLoading?: boolean;
}

type FilterTab = 'action_required' | 'red' | 'yellow' | 'all';

export const LowStockAlertsWidget: React.FC<LowStockAlertsWidgetProps> = ({
  alerts,
  summary,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FilterTab>('action_required');

  // Filter alert items based on selected tab
  const displayedItems = useMemo(() => {
    return alerts.filter((item) => {
      if (activeTab === 'action_required') {
        return item.severity === 'red' || item.severity === 'yellow';
      }
      if (activeTab === 'red') {
        return item.severity === 'red';
      }
      if (activeTab === 'yellow') {
        return item.severity === 'yellow';
      }
      return true; // 'all' displays red, yellow, green
    });
  }, [alerts, activeTab]);

  const handleItemClick = (productName: string) => {
    // Navigate directly to inventory and filter by product name for immediate restructuring/adjustment
    navigate(`/inventory?search=${encodeURIComponent(productName)}`);
  };

  return (
    <Card
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '4px solid #ea580c', // Urgent amber/orange top border
      }}
    >
      {/* Widget Header */}
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
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={25} />
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
              {t('dashLowStockTitle')}
              {summary.totalAlerts > 0 && (
                <span
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    lineHeight: 1.2,
                  }}
                >
                  {summary.totalAlerts} Need Restocking
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Items running out soon that need restocking so you do not miss out on customer sales
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/inventory?status=low_stock')}
            style={{ borderColor: 'rgba(234, 88, 12, 0.4)', color: 'var(--text-main)' }}
          >
            Restock Items <ArrowRight size={14} style={{ marginLeft: '6px' }} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px 0', textAlign: 'center' }}>
          <LoadingSpinner size="md" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Evaluating real-time shop inventory quantities against minimum reorder thresholds...
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px dashed rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
          }}
        >
          <Package size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <h4
            style={{
              margin: '0 0 6px',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            Your shop inventory catalog is empty
          </h4>
          <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Add products with minimum stock alert thresholds to enable proactive restock warnings.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/inventory?action=new')}>
            Add First Product
          </Button>
        </div>
      ) : (
        <>
          {/* Quick Filter Tabs & Summary Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('action_required')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor:
                    activeTab === 'action_required' ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
                  borderColor: activeTab === 'action_required' ? '#ea580c' : 'var(--border-color)',
                  color: activeTab === 'action_required' ? '#ea580c' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                Requires Action ({summary.totalAlerts})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('red')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: activeTab === 'red' ? 'rgba(220, 38, 38, 0.15)' : 'transparent',
                  borderColor: activeTab === 'red' ? '#dc2626' : 'var(--border-color)',
                  color: activeTab === 'red' ? '#dc2626' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                Out of Stock ({summary.redCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('yellow')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor:
                    activeTab === 'yellow' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  borderColor: activeTab === 'yellow' ? '#f59e0b' : 'var(--border-color)',
                  color: activeTab === 'yellow' ? '#d97706' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                Low Stock ({summary.yellowCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: activeTab === 'all' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  borderColor: activeTab === 'all' ? '#10b981' : 'var(--border-color)',
                  color: activeTab === 'all' ? '#10b981' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                All Products ({alerts.length})
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sorted by depletion urgency & stock level
            </div>
          </div>

          {/* Table / List View */}
          {displayedItems.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px dashed rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                margin: '10px 0',
              }}
            >
              <CheckCircle2 size={38} style={{ color: '#10b981', margin: '0 auto 10px' }} />
              <h4
                style={{
                  margin: '0 0 6px',
                  color: 'var(--text-main)',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                }}
              >
                {activeTab === 'action_required'
                  ? '🎉 Excellent! No stock items currently require urgent attention.'
                  : `No items matching "${activeTab.replace('_', ' ')}" status.`}
              </h4>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  maxWidth: '480px',
                  display: 'inline-block',
                }}
              >
                All of your tracked products are operating safely above their specified minimum
                reorder thresholds. Keep up the proactive inventory management!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedItems.map((item) => {
                const isRed = item.severity === 'red';
                const isYellow = item.severity === 'yellow';

                const badgeColor = isRed ? '#dc2626' : isYellow ? '#d97706' : '#059669';
                const badgeBg = isRed
                  ? 'rgba(220, 38, 38, 0.12)'
                  : isYellow
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(16, 185, 129, 0.12)';
                const badgeBorder = isRed
                  ? '1px solid rgba(220, 38, 38, 0.4)'
                  : isYellow
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(16, 185, 129, 0.3)';

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
                      transition: 'all 0.15s ease',
                      backgroundColor: isRed
                        ? 'rgba(220, 38, 38, 0.03)'
                        : isYellow
                          ? 'rgba(245, 158, 11, 0.02)'
                          : 'rgba(0,0,0,0.02)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {/* Left: Product Name & Remaining Quantity */}
                    <div style={{ flex: '1 1 200px' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          fontSize: '0.96rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {isRed ? (
                          <AlertCircle size={18} color="#dc2626" />
                        ) : isYellow ? (
                          <AlertTriangle size={18} color="#d97706" />
                        ) : (
                          <Sparkles size={18} color="#059669" />
                        )}
                        {item.productName}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: badgeBorder,
                          }}
                        >
                          {item.statusText}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          marginLeft: '26px',
                        }}
                      >
                        In stock:{' '}
                        <strong
                          style={{
                            color: isRed ? '#dc2626' : isYellow ? '#d97706' : 'var(--text-main)',
                          }}
                        >
                          {item.remainingQuantity} {item.unit}
                        </strong>{' '}
                        • Minimum needed:{' '}
                        <strong>
                          {item.minimumQuantity} {item.unit}
                        </strong>
                      </div>
                    </div>

                    {/* Right: Restock Action Button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        flexShrink: 0,
                      }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleItemClick(item.productName)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          borderColor: isRed
                            ? '#dc2626'
                            : isYellow
                              ? '#f59e0b'
                              : 'var(--border-color)',
                          color: isRed ? '#dc2626' : isYellow ? '#d97706' : 'var(--text-main)',
                          fontWeight: 700,
                        }}
                      >
                        Update Stock <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
};
