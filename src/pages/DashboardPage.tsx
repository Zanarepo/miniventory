import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { useAuditLog } from '../hooks/useAuditLog';
import { useDashboard } from '../hooks/useDashboard';
import { useRevenueTrend } from '../hooks/useRevenueTrend';
import { useExpenseTrend } from '../hooks/useExpenseTrend';
import { useProfitTrend } from '../hooks/useProfitTrend';
import { useInventorySummary } from '../hooks/useInventorySummary';
import { useLowStockAlerts } from '../hooks/useLowStockAlerts';
import { useTopSellingProducts } from '../hooks/useTopSellingProducts';
import { useRecentTransactions } from '../hooks/useRecentTransactions';
import { useBusinessHealth } from '../hooks/useBusinessHealth';
import { useLanguage } from '../hooks/useLanguage';
import {
  KPICard,
  RevenueTrendChart,
  ExpenseTrendChart,
  ProfitTrendChart,
  InventorySummaryWidget,
  LowStockAlertsWidget,
  TopSellingProductsWidget,
  RecentTransactionsWidget,
  QuickActionsWidget,
  DashboardFilterBar,
  BusinessHealthWidget,
  type DashboardFilterOption,
} from '../components/dashboard';
import { Button, LoadingSpinner } from '../components';
import { SyncIndicator } from '../components/SyncIndicator';
import { SyncCenter } from '../components/SyncCenter';
import { SUPPORTED_CURRENCIES } from '../constants/businessCategories';
import {
  TrendingUp,
  Receipt,
  Award,
  Wallet,
  Package,
  Layers,
  Calendar,
  Sparkles,
  PlusCircle,
  Activity,
  CheckCircle2,
  Zap,
  BarChart2,
  HeartPulse,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'daily' | 'charts' | 'stock' | 'health'>('daily');
  const [revenueDays, setRevenueDays] = useState<number>(30);
  const { user, profile } = useAuth();
  const { business } = useBusiness();
  const { kpis, isLoading, error, hasData } = useDashboard();
  const {
    trendData,
    summary: revenueSummary,
    isLoading: isTrendLoading,
  } = useRevenueTrend(revenueDays);
  const {
    trendData: expenseTrendData,
    summary: expenseSummary,
    isLoading: isExpenseTrendLoading,
    granularity: expenseGranularity,
    setGranularity: setExpenseGranularity,
  } = useExpenseTrend('daily');
  const {
    trendData: profitTrendData,
    summary: profitSummary,
    isLoading: isProfitTrendLoading,
    granularity: profitGranularity,
    setGranularity: setProfitGranularity,
  } = useProfitTrend('daily');
  const { summary: inventorySummary, isLoading: isInventoryLoading } = useInventorySummary();
  const {
    alerts: lowStockAlerts,
    summary: alertsSummary,
    isLoading: isAlertsLoading,
  } = useLowStockAlerts();
  const {
    topProducts,
    summary: topSellingSummary,
    isLoading: isTopSellingLoading,
    days: topSellingDays,
    setDays: setTopSellingDays,
    sortBy: topSellingSortBy,
    setSortBy: setTopSellingSortBy,
  } = useTopSellingProducts(30);
  const {
    transactions: recentTransactions,
    summary: recentTxSummary,
    isLoading: isRecentTxLoading,
    filter: recentTxFilter,
    setFilter: setRecentTxFilter,
  } = useRecentTransactions();
  const { metrics: businessHealthMetrics, isLoading: isHealthLoading } = useBusinessHealth();
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  const { logAction } = useAuditLog();
  const hasLoggedOpen = useRef(false);

  useEffect(() => {
    if (!hasLoggedOpen.current && business) {
      logAction({ action: 'app_open', entity: 'session' });
      hasLoggedOpen.current = true;
    }
  }, [business, logAction]);

  const handleGlobalFilter = (opt: DashboardFilterOption) => {
    setRevenueDays(opt.days);
    setTopSellingDays(opt.days);
  };

  // Get currency symbol
  const currencyObj = SUPPORTED_CURRENCIES.find((c) => c.code === business?.currency);
  const currencySymbol = currencyObj?.symbol || '₦';

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          gap: '16px',
        }}
      >
        <LoadingSpinner size="lg" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          Loading executive dashboard analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#c62828' }}>
        <h3>Failed to load dashboard analytics</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      {/* Executive Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--brand-primary)', display: 'flex' }}>
              <Activity size={24} />
            </span>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {business?.business_name || 'Executive'} Dashboard
            </h1>
          </div>
          <p
            style={{
              color: 'var(--text-muted)',
              margin: 0,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>
              Welcome back, <strong>{profile?.full_name || user?.email || 'Entrepreneur'}</strong>!
            </span>
            <span>•</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-main)',
              }}
            >
              <Calendar size={15} /> {formattedDate}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div onClick={() => setIsSyncCenterOpen(true)}>
            <SyncIndicator />
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
              border: '1px solid rgba(46, 125, 50, 0.3)',
              color: '#2e7d32',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={15} />
            <span>100% Operational Offline (No Internet Required)</span>
          </div>
        </div>
      </div>

      {/* Epic 10: Global Dashboard Time Filter Bar */}
      <DashboardFilterBar onFilterSelect={handleGlobalFilter} />

      {/* 4-Tab Navigation Architecture (Mobile Responsive 4-Column Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          padding: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          margin: '6px 0 14px',
        }}
      >
        {[
          { id: 'daily', label: t('dashTabOverview'), icon: Zap, color: '#10b981' },
          { id: 'charts', label: t('dashTabCharts'), icon: BarChart2, color: '#3b82f6' },
          { id: 'stock', label: t('dashTabStock'), icon: Package, color: '#f59e0b' },
          { id: 'health', label: t('dashTabHealth'), icon: HeartPulse, color: '#8b5cf6' },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'daily' | 'charts' | 'stock' | 'health')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 4px',
                borderRadius: '12px',
                border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
                backgroundColor: isActive ? `${tab.color}22` : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              <IconComponent size={20} color={isActive ? tab.color : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY OVERVIEW (Default Tab - Most Used Modules) */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Epic 9: Rapid-Access Quick Actions Toolbar */}
          <QuickActionsWidget />

          {/* Empty State / Get Started Banner for New Businesses */}
          {!hasData && (
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08), rgba(0, 0, 0, 0.02))',
                border: '1px solid rgba(46, 125, 50, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={26} color="var(--brand-primary)" />
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  Your Offline Smart Dashboard is Ready!
                </h2>
              </div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '700px',
                }}
              >
                Your dashboard calculates your take-home profits, expenses, and store items
                automatically without needing an internet connection. Start by adding your first
                store items or customer sales to see your live cards update instantly.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                <Button variant="primary" onClick={() => navigate('/sales')}>
                  <PlusCircle size={18} style={{ marginRight: '6px' }} />
                  Record First Sale
                </Button>
                <Button variant="secondary" onClick={() => navigate('/inventory')}>
                  <Package size={18} style={{ marginRight: '6px' }} />
                  Add Shop Item
                </Button>
                <Button variant="secondary" onClick={() => navigate('/expenses/new')}>
                  <Receipt size={18} style={{ marginRight: '6px' }} />
                  Record Expense
                </Button>
              </div>
            </div>
          )}

          {/* 6 Critical Executive KPI Cards */}
          <div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Today's Store Summary</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Click any card to view detailed records
              </span>
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '14px',
              }}
            >
              {/* 1. Today's Sales */}
              <KPICard
                title={t('dashTodaySales')}
                value={`${currencySymbol}${kpis.todaySales.toLocaleString()}`}
                icon={<TrendingUp size={16} color="#2e7d32" />}
                trendPercentage={kpis.todaySalesChangePerc}
                trendLabel="vs yesterday"
                isPositiveTrend={true}
                accentColor="#2e7d32"
                onClick={() => navigate('/sales-history')}
              />

              {/* 2. Today's Expenses */}
              <KPICard
                title={t('dashTodayExpenses')}
                value={`${currencySymbol}${kpis.todayExpenses.toLocaleString()}`}
                icon={<Receipt size={16} color="#c62828" />}
                trendPercentage={kpis.todayExpensesChangePerc}
                trendLabel="vs yesterday"
                isPositiveTrend={false}
                accentColor="#c62828"
                onClick={() => navigate('/expenses')}
              />

              {/* 3. Today's Profit */}
              <KPICard
                title={t('dashActualProfit')}
                value={`${currencySymbol}${kpis.todayProfit.toLocaleString()}`}
                icon={<Award size={16} color="var(--brand-primary)" />}
                trendPercentage={kpis.todayProfitChangePerc}
                trendLabel="vs yesterday"
                isPositiveTrend={true}
                accentColor="var(--brand-primary)"
                onClick={() => navigate('/financials')}
              />

              {/* 4. Cash Position */}
              <KPICard
                title={t('dashAvailableCash')}
                value={`${currencySymbol}${kpis.cashPosition.toLocaleString()}`}
                icon={<Wallet size={16} color="#0288d1" />}
                neutralTrend={true}
                subMetrics={[
                  {
                    label: 'In: ' + currencySymbol + kpis.cashIn.toLocaleString(),
                    value: 'Out: ' + currencySymbol + kpis.cashOut.toLocaleString(),
                    color: 'var(--text-main)',
                  },
                ]}
                accentColor="#0288d1"
                onClick={() => navigate('/financials')}
              />

              {/* 5. Inventory Value */}
              <KPICard
                title={t('dashStockValue')}
                value={`${currencySymbol}${kpis.inventoryValue.toLocaleString()}`}
                icon={<Layers size={16} color="#7b1fa2" />}
                neutralTrend={true}
                accentColor="#7b1fa2"
                onClick={() => navigate('/inventory-ledger')}
              />

              {/* 6. Products in Stock */}
              <KPICard
                title={t('dashItemsInShop')}
                value={`${kpis.activeProducts.toLocaleString()} Items`}
                icon={<Package size={16} color="#f57c00" />}
                neutralTrend={true}
                accentColor="#f57c00"
                onClick={() => navigate('/inventory')}
              />
            </div>
          </div>

          {/* Epic 8: Recent Transactions Feed Widget (Max 10 Records) */}
          <RecentTransactionsWidget
            transactions={recentTransactions}
            summary={recentTxSummary}
            filter={recentTxFilter}
            onFilterChange={setRecentTxFilter}
            currencySymbol={currencySymbol}
            isLoading={isRecentTxLoading}
          />

          {/* Urgent Warning Component: Low Stock Alerts */}
          <LowStockAlertsWidget
            alerts={lowStockAlerts}
            summary={alertsSummary}
            isLoading={isAlertsLoading}
          />
        </div>
      )}

      {/* TAB 2: SALES & MONEY CHARTS */}
      {activeTab === 'charts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Epic 2: Real-time Revenue Trend Chart */}
          <RevenueTrendChart
            data={trendData}
            summary={revenueSummary}
            currencySymbol={currencySymbol}
            selectedDays={revenueDays}
            onDaysChange={setRevenueDays}
            isLoading={isTrendLoading}
          />

          {/* Epic 3: Real-time Expense & Outflow Trend Bar Chart */}
          <ExpenseTrendChart
            data={expenseTrendData}
            summary={expenseSummary}
            granularity={expenseGranularity}
            onGranularityChange={setExpenseGranularity}
            currencySymbol={currencySymbol}
            isLoading={isExpenseTrendLoading}
          />

          {/* Epic 4: Real-time Net Profit Trajectory Area Chart */}
          <ProfitTrendChart
            data={profitTrendData}
            summary={profitSummary}
            granularity={profitGranularity}
            onGranularityChange={setProfitGranularity}
            currencySymbol={currencySymbol}
            isLoading={isProfitTrendLoading}
          />
        </div>
      )}

      {/* TAB 3: PRODUCTS & STOCK */}
      {activeTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Epic 7: Top 10 Bestselling Products Leaderboard Widget */}
          <TopSellingProductsWidget
            products={topProducts}
            summary={topSellingSummary}
            days={topSellingDays}
            onDaysChange={setTopSellingDays}
            sortBy={topSellingSortBy}
            onSortByChange={setTopSellingSortBy}
            currencySymbol={currencySymbol}
            isLoading={isTopSellingLoading}
          />

          {/* Epic 5: Real-time Stock Inventory Health & Valuation Widget */}
          <InventorySummaryWidget
            summary={inventorySummary}
            currencySymbol={currencySymbol}
            isLoading={isInventoryLoading}
          />

          {/* Epic 6: Real-time Low Stock & Reorder Urgent Alerts Widget */}
          <LowStockAlertsWidget
            alerts={lowStockAlerts}
            summary={alertsSummary}
            isLoading={isAlertsLoading}
          />
        </div>
      )}

      {/* TAB 4: BUSINESS HEALTH CHECK */}
      {activeTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Epic 11: Business Health Scorecard Widget */}
          <BusinessHealthWidget metrics={businessHealthMetrics} isLoading={isHealthLoading} />
        </div>
      )}

      <SyncCenter isOpen={isSyncCenterOpen} onClose={() => setIsSyncCenterOpen(false)} />
    </div>
  );
};
