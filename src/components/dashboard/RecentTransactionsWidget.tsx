import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '..';
import type {
  RecentTransactionItem,
  RecentTransactionsSummary,
  TransactionFilter,
} from '../../hooks/useRecentTransactions';
import { History, ArrowUpRight, ArrowDownRight, Package, ArrowRight, FileText } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export interface RecentTransactionsWidgetProps {
  transactions: RecentTransactionItem[];
  summary: RecentTransactionsSummary;
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  currencySymbol?: string;
  isLoading?: boolean;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  summary,
  filter,
  onFilterChange,
  currencySymbol = '₦',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const formatAmount = (item: RecentTransactionItem): React.ReactNode => {
    if (item.isMonetary) {
      const valStr = item.amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      if (item.isCredit) {
        return (
          <span style={{ color: '#10b981', fontWeight: 800 }}>
            +{currencySymbol}
            {valStr}
          </span>
        );
      }
      return (
        <span style={{ color: '#ef4444', fontWeight: 800 }}>
          -{currencySymbol}
          {valStr}
        </span>
      );
    }

    // Non-monetary inventory stock quantity change
    const qtyStr = item.amount.toLocaleString();
    return (
      <span style={{ color: '#6366f1', fontWeight: 700 }}>
        {item.isCredit ? `+${qtyStr}` : `-${qtyStr}`}{' '}
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>units</span>
      </span>
    );
  };

  const tabs: { label: string; value: TransactionFilter; count: number }[] = [
    { label: 'All Activity', value: 'all', count: summary.totalCount },
    { label: 'Sales Receipts', value: 'sale', count: summary.salesCount },
    { label: 'Expenses', value: 'expense', count: summary.expensesCount },
    { label: 'Stock Adjustments', value: 'inventory', count: summary.inventoryCount },
  ];

  return (
    <Card
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '4px solid #6366f1', // Sleek indigo accent border
      }}
    >
      {/* Widget Header & Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              flexShrink: 0,
            }}
          >
            <History size={26} />
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
              {t('dashActivitiesTitle')}
              <span
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#6366f1',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  lineHeight: 1.2,
                }}
              >
                Latest 10
              </span>
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Your latest customer sales, business expenses, and product stock adjustments
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onFilterChange(tab.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderColor: isActive ? '#6366f1' : 'var(--border-color)',
                  color: isActive ? '#6366f1' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    backgroundColor: isActive ? '#6366f1' : 'rgba(0,0,0,0.08)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '50px 0', textAlign: 'center' }}>
          <LoadingSpinner size="md" />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Assembling recent sales receipts, operational expenditure, and inventory ledger
            history...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div
          style={{
            padding: '38px 24px',
            textAlign: 'center',
            backgroundColor: 'rgba(99, 102, 241, 0.03)',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
          }}
        >
          <FileText size={40} style={{ color: '#6366f1', margin: '0 auto 12px' }} />
          <h4
            style={{
              margin: '0 0 6px',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            No recent transactions found
          </h4>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              maxWidth: '480px',
              display: 'inline-block',
            }}
          >
            As soon as you record a sale, log an expense, or adjust product stock quantities, your
            live activity feed will show up to 10 latest entries here.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/sales')}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            >
              Record Sale
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/expenses')}>
              Log Expense
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions.map((item) => {
            let typeBg = 'rgba(16, 185, 129, 0.15)';
            let typeColor = '#10b981';
            let IconComp = ArrowUpRight;

            if (item.type === 'expense') {
              typeBg = 'rgba(239, 68, 68, 0.15)';
              typeColor = '#ef4444';
              IconComp = ArrowDownRight;
            } else if (item.type === 'inventory') {
              typeBg = 'rgba(99, 102, 241, 0.15)';
              typeColor = '#6366f1';
              IconComp = Package;
            }

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.linkUrl)}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left: Icon & Description */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 220px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: typeBg,
                      color: typeColor,
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={22} />
                  </div>
                  <div>
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
                      {item.title}
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor:
                            item.status === 'Completed'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'rgba(99, 102, 241, 0.12)',
                          color: item.status === 'Completed' ? '#10b981' : '#6366f1',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div
                      style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}
                    >
                      {item.description} • <strong>{item.displayDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ textAlign: 'right', fontSize: '1.05rem', fontWeight: 800 }}>
                    {formatAmount(item)}
                  </div>
                  <div
                    style={{
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  >
                    Details <ArrowRight size={14} style={{ marginLeft: '2px' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
