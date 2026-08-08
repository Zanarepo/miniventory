import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { useFinancials } from '../hooks/useFinancials';
import { Card } from '../components/Card';
import { CustomSelect } from '../components/CustomSelect';

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

const ClickableAmount: React.FC<{
  value: number;
  formatCurrency: (v: number) => string;
  formatCompactCurrency: (v: number) => string;
  style?: React.CSSProperties;
}> = ({ value, formatCurrency, formatCompactCurrency, style }) => {
  const [showFull, setShowFull] = React.useState(false);
  const fullValue = formatCurrency(value);
  const compactValue = formatCompactCurrency(value);
  return (
    <strong
      onClick={() => setShowFull(!showFull)}
      style={{ ...style, cursor: 'pointer', display: 'block' }}
      title={fullValue}
    >
      {showFull ? fullValue : compactValue}
    </strong>
  );
};

interface FinancialKPICardProps {
  title: string;
  value: number;
  formatCurrency: (v: number) => string;
  formatCompactCurrency: (v: number) => string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  gridColumn?: string;
}

const FinancialKPICard: React.FC<FinancialKPICardProps> = ({
  title,
  value,
  formatCurrency,
  formatCompactCurrency,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  valueColor = 'var(--text-main)',
  gridColumn,
}) => {
  return (
    <Card
      style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', gridColumn }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        <div
          style={{
            color: iconColor,
            padding: '4px',
            borderRadius: '50%',
            backgroundColor: iconBgColor,
          }}
        >
          {icon}
        </div>
      </div>
      <ClickableAmount
        value={value}
        formatCurrency={formatCurrency}
        formatCompactCurrency={formatCompactCurrency}
        style={{
          fontSize: '1.15rem',
          fontWeight: 900,
          color: valueColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      />
      <span
        style={{
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
        }}
      >
        {subtitle}
      </span>
    </Card>
  );
};

export const Financials: React.FC = () => {
  const { t } = useLanguage();
  const { getCurrencySymbol } = useBusiness();
  const { summary, health, period, startDate, endDate, isLoading, setPeriod, setDateRange } =
    useFinancials();

  const currSymbol = getCurrencySymbol();

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatCompactCurrency = (num: number) => {
    if (num >= 1e9) return `${currSymbol}${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
    if (num >= 1e6) return `${currSymbol}${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1e3) return `${currSymbol}${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
    return formatCurrency(num);
  };

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
          gap: '8px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: 0,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('financialsTitle')}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            {t('financialsSubtitle')}
          </p>
        </div>

        {/* Date / Period Selector */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <CustomSelect
            style={{ minWidth: '160px' }}
            value={period}
            onChange={(val) => setPeriod(val as PeriodSelection)}
            options={[
              { value: 'TODAY', label: getPeriodLabel('TODAY') },
              { value: 'YESTERDAY', label: getPeriodLabel('YESTERDAY') },
              { value: 'LAST_7_DAYS', label: getPeriodLabel('LAST_7_DAYS') },
              { value: 'LAST_30_DAYS', label: getPeriodLabel('LAST_30_DAYS') },
              { value: 'THIS_MONTH', label: getPeriodLabel('THIS_MONTH') },
              { value: 'LAST_MONTH', label: getPeriodLabel('LAST_MONTH') },
              { value: 'THIS_YEAR', label: getPeriodLabel('THIS_YEAR') },
              { value: 'CUSTOM', label: getPeriodLabel('CUSTOM') },
            ]}
          />

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
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Health Score Gauge */}
            <Card
              style={{
                padding: '12px',
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
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}
              >
                {t('healthScoreLabel')}
              </span>

              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: `5px solid var(--border-color)`,
                  borderTopColor: getHealthColor(health.score),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  marginBottom: '8px',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    lineHeight: 1,
                  }}
                >
                  {health.score}
                </span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    lineHeight: 1,
                    marginTop: '2px',
                  }}
                >
                  / 100
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                  {t('healthRatingLabel')}
                </span>
                <strong
                  style={{
                    fontSize: '1rem',
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
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '2px',
                  }}
                >
                  Selected Report Period
                </span>
                <strong
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    display: 'block',
                  }}
                >
                  {getPeriodLabel(period)}
                </strong>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Calendar size={12} /> {formatDate(startDate)} — {formatDate(endDate)}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px',
                }}
              >
                <div>
                  <span
                    style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}
                  >
                    REVENUE
                  </span>
                  <ClickableAmount
                    value={summary.revenue}
                    formatCurrency={formatCurrency}
                    formatCompactCurrency={formatCompactCurrency}
                    style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-success)' }}
                  />
                </div>
                <div>
                  <span
                    style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}
                  >
                    NET PROFIT
                  </span>
                  <ClickableAmount
                    value={summary.netProfit}
                    formatCurrency={formatCurrency}
                    formatCompactCurrency={formatCompactCurrency}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color:
                        summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)',
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Grid of Financial KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            {/* Revenue */}
            <FinancialKPICard
              title={t('revenueLabel')}
              value={summary.revenue}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Money coming in from sales"
              icon={<TrendingUp size={14} />}
              iconBgColor="rgba(16, 185, 129, 0.1)"
              iconColor="var(--brand-success)"
            />

            {/* COGS */}
            <FinancialKPICard
              title={t('cogsLabel')}
              value={summary.costOfGoodsSold}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Initial cost price of stock"
              icon={<ShoppingCart size={14} />}
              iconBgColor="rgba(245, 158, 11, 0.1)"
              iconColor="var(--brand-warning)"
            />

            {/* Gross Profit */}
            <FinancialKPICard
              title={t('grossProfitLabel')}
              value={summary.grossProfit}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Revenue minus COGS"
              icon={<DollarSign size={14} />}
              iconBgColor="rgba(99, 102, 241, 0.1)"
              iconColor="var(--brand-primary)"
            />

            {/* Expenses */}
            <FinancialKPICard
              title={t('expensesTitle')}
              value={summary.expenses}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Operating bills & costs"
              icon={<TrendingDown size={14} />}
              iconBgColor="rgba(239, 68, 68, 0.1)"
              iconColor="var(--brand-danger)"
            />

            {/* Net Profit */}
            <FinancialKPICard
              title={t('netProfitLabel')}
              value={summary.netProfit}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Gross Profit minus Expenses"
              icon={<Coins size={14} />}
              iconBgColor={
                summary.netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }
              iconColor={summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)'}
              valueColor={summary.netProfit >= 0 ? 'var(--brand-success)' : 'var(--brand-danger)'}
            />

            {/* Cash Position */}
            <FinancialKPICard
              title={t('cashPositionLabel')}
              value={summary.cashPosition}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Cash Sales minus Cash Expenses"
              icon={<ShieldCheck size={14} />}
              iconBgColor="rgba(6, 182, 212, 0.1)"
              iconColor="var(--brand-secondary)"
            />

            {/* Inventory Value */}
            <FinancialKPICard
              title={t('inventoryValueLabel')}
              value={summary.inventoryValue}
              formatCurrency={formatCurrency}
              formatCompactCurrency={formatCompactCurrency}
              subtitle="Total worth of shop stock"
              icon={<ShoppingCart size={14} />}
              iconBgColor="rgba(99, 102, 241, 0.1)"
              iconColor="var(--brand-primary)"
              gridColumn="span 1"
            />
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
