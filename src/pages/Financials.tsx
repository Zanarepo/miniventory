import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { useFinancials } from '../hooks/useFinancials';
import { Card } from '../components/Card';

import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import type { PeriodSelection } from '../types/financials';

export const Financials: React.FC = () => {
  const { t } = useLanguage();
  const { getCurrencySymbol } = useBusiness();
  const { summary, health, period, startDate, endDate, isLoading, setPeriod, setDateRange } =
    useFinancials();

  const currSymbol = getCurrencySymbol();

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'var(--brand-success, #10b981)';
    if (score >= 75) return 'var(--brand-primary, #6366f1)';
    if (score >= 60) return 'var(--brand-warning, #f59e0b)';
    return 'var(--brand-danger, #ef4444)';
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    flex: '1 1 200px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  };

  const getPeriodLabel = (p: PeriodSelection) => {
    switch (p) {
      case 'TODAY':
        return 'Today';
      case 'YESTERDAY':
        return 'Yesterday';
      case 'LAST_7_DAYS':
        return 'Last 7 Days';
      case 'LAST_30_DAYS':
        return 'Last 30 Days';
      case 'THIS_MONTH':
        return 'This Month';
      case 'LAST_MONTH':
        return 'Last Month';
      case 'THIS_YEAR':
        return 'This Year';
      case 'CUSTOM':
        return 'Custom Range';
      default:
        return p;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('financialsTitle')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            {t('financialsSubtitle')}
          </p>
        </div>

        {/* Date / Period Selector */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            style={selectStyle}
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodSelection)}
          >
            <option value="TODAY">{getPeriodLabel('TODAY')}</option>
            <option value="YESTERDAY">{getPeriodLabel('YESTERDAY')}</option>
            <option value="LAST_7_DAYS">{getPeriodLabel('LAST_7_DAYS')}</option>
            <option value="LAST_30_DAYS">{getPeriodLabel('LAST_30_DAYS')}</option>
            <option value="THIS_MONTH">{getPeriodLabel('THIS_MONTH')}</option>
            <option value="LAST_MONTH">{getPeriodLabel('LAST_MONTH')}</option>
            <option value="THIS_YEAR">{getPeriodLabel('THIS_YEAR')}</option>
            <option value="CUSTOM">{getPeriodLabel('CUSTOM')}</option>
          </select>

          {period === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                style={inputStyle}
                value={startDate}
                onChange={(e) => setDateRange(e.target.value, endDate)}
                placeholder="Start Date"
                aria-label="Custom Start Date"
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                style={inputStyle}
                value={endDate}
                onChange={(e) => setDateRange(startDate, e.target.value)}
                placeholder="End Date"
                aria-label="Custom End Date"
              />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Computing live calculation balances...
        </div>
      ) : (
        <>
          {/* Main Dashboard Section: Health score + General statement */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Health Score Gauge */}
            <Card
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: getHealthColor(health.score),
                }}
              />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {t('healthScoreLabel')}
              </span>

              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `8px solid var(--border-color)`,
                  borderTopColor: getHealthColor(health.score),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  marginBottom: '16px',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {health.score}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  / 100
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t('healthRatingLabel')}
                </span>
                <strong
                  style={{
                    fontSize: '1.25rem',
                    color: getHealthColor(health.score),
                    textTransform: 'uppercase',
                    fontWeight: 800,
                  }}
                >
                  {health.rating}
                </strong>
              </div>
            </Card>

            {/* Performance Period Card */}
            <Card
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Selected Report Period
                </span>
                <strong
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    display: 'block',
                  }}
                >
                  {getPeriodLabel(period)}
                </strong>
                <p
                  style={{
                    margin: '8px 0 0 0',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={16} /> {formatDate(startDate)} — {formatDate(endDate)}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                }}
              >
                <div>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}
                  >
                    REVENUE
                  </span>
                  <span
                    style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-success)' }}
                  >
                    {formatCurrency(summary.revenue)}
                  </span>
                </div>
                <div>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}
                  >
                    NET PROFIT
                  </span>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color:
                        summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)',
                    }}
                  >
                    {formatCurrency(summary.netProfit)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Grid of Financial KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Revenue */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('revenueLabel')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-success)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <TrendingUp size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.revenue)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Money coming in from sales
              </span>
            </Card>

            {/* COGS */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('cogsLabel')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-warning)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  }}
                >
                  <ShoppingCart size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.costOfGoodsSold)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Initial cost price of stock sold
              </span>
            </Card>

            {/* Gross Profit */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('grossProfitLabel')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-primary)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <DollarSign size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.grossProfit)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Revenue minus COGS
              </span>
            </Card>

            {/* Expenses */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('expensesTitle')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-danger)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  <TrendingDown size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.expenses)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Operating bills & costs
              </span>
            </Card>

            {/* Net Profit */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('netProfitLabel')}
                </span>
                <div
                  style={{
                    color: summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor:
                      summary.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  <Coins size={18} />
                </div>
              </div>
              <strong
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)',
                }}
              >
                {formatCurrency(summary.netProfit)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Gross Profit minus Expenses
              </span>
            </Card>

            {/* Cash Position */}
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('cashPositionLabel')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-cyan)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.cashPosition)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Cash Sales minus Cash Expenses
              </span>
            </Card>

            {/* Inventory Value */}
            <Card
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                gridColumn: 'span 1',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('inventoryValueLabel')}
                </span>
                <div
                  style={{
                    color: 'var(--brand-primary)',
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <ShoppingCart size={18} />
                </div>
              </div>
              <strong style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {formatCurrency(summary.inventoryValue)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total worth of shop stock items
              </span>
            </Card>
          </div>

          {/* Consolidated Financial statement details */}
          <Card style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0 0 16px 0',
              }}
            >
              Statement of Performance
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Total Sales (Revenue)
                </span>
                <strong style={{ color: 'var(--brand-success)' }}>
                  {formatCurrency(summary.revenue)}
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Less: Cost of Goods Sold (COGS)
                </span>
                <strong style={{ color: 'var(--text-main)' }}>
                  ({formatCurrency(summary.costOfGoodsSold)})
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  Gross Profit Margin
                </span>
                <strong style={{ color: 'var(--brand-success)' }}>
                  {formatCurrency(summary.grossProfit)}
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Less: Operating Expenses
                </span>
                <strong style={{ color: 'var(--brand-danger)' }}>
                  ({formatCurrency(summary.expenses)})
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  marginTop: '8px',
                }}
              >
                <span style={{ color: 'var(--text-main)' }}>Net Profit / (Loss)</span>
                <strong
                  style={{
                    color: summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)',
                  }}
                >
                  {formatCurrency(summary.netProfit)}
                </strong>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
