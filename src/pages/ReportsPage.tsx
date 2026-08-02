import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { ReportingService } from '../services/ReportingService';
import type {
  ReportFilter,
  ReportPeriodType,
  SalesReportData,
  ExpenseReportData,
  InventoryReportData,
  ProfitReportData,
  BusinessPerformanceReport,
  ReportHistory,
  SalesReportItem,
  ExpenseReportItem,
  InventoryReportItem,
} from '../types/reports';
import {
  FileText,
  DownloadCloud,
  Printer,
  Package,
  ShoppingBag,
  TrendingDown,
  PieChart,
  Building,
  History,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { business: activeBusiness } = useBusiness();

  const [activeTab, setActiveTab] = useState<
    'sales' | 'expenses' | 'inventory' | 'profit' | 'bank' | 'history'
  >('sales');
  const [period, setPeriod] = useState<ReportPeriodType>('this_month');

  // Data States
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReportData | null>(null);
  const [profitData, setProfitData] = useState<ProfitReportData | null>(null);
  const [bankData, setBankData] = useState<BusinessPerformanceReport | null>(null);
  const [historyData, setHistoryData] = useState<ReportHistory[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Helper to generate precise date filters
  const getFilter = React.useCallback(
    (p: ReportPeriodType): ReportFilter => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);

      let start = new Date(today);
      let label = 'Today';

      if (p === 'yesterday') {
        start.setDate(today.getDate() - 1);
        end.setDate(end.getDate() - 1);
        label = 'Yesterday';
      } else if (p === 'this_week') {
        const day = start.getDay() || 7;
        if (day !== 1) start.setHours(-24 * (day - 1));
        label = 'This Week';
      } else if (p === 'last_week') {
        const day = start.getDay() || 7;
        start.setHours(-24 * (day - 1 + 7));
        end.setHours(-24 * (end.getDay() || 7));
        label = 'Last Week';
      } else if (p === 'this_month') {
        start.setDate(1);
        label = 'This Month';
      } else if (p === 'last_month') {
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setDate(0);
        label = 'Last Month';
      } else if (p === 'year') {
        start.setMonth(0, 1);
        label = 'This Year';
      } else if (p === 'custom') {
        label = 'All Time';
        start = new Date('2020-01-01'); // Wide net for offline sync safety
      }

      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        reportType: activeTab,
        periodLabel: label,
        periodType: p,
      };
    },
    [activeTab],
  );

  useEffect(() => {
    const loadData = async () => {
      if (!activeBusiness?.id) return;
      setIsLoading(true);
      try {
        const filter = getFilter(period);
        if (activeTab === 'sales') {
          const res = await ReportingService.generateSalesReport(activeBusiness.id, filter);
          setSalesData(res);
        } else if (activeTab === 'expenses') {
          const res = await ReportingService.generateExpenseReport(activeBusiness.id, filter);
          setExpenseData(res);
        } else if (activeTab === 'inventory') {
          const res = await ReportingService.generateInventoryReport(activeBusiness.id);
          setInventoryData(res);
        } else if (activeTab === 'profit') {
          const res = await ReportingService.generateProfitReport(activeBusiness.id, filter);
          setProfitData(res);
        } else if (activeTab === 'bank') {
          const res = await ReportingService.generateBusinessPerformance(activeBusiness.id, filter);
          setBankData(res);
        } else if (activeTab === 'history') {
          const res = await ReportingService.getReportHistory(activeBusiness.id);
          setHistoryData(res);
        }
      } catch (err) {
        console.error('Report Generation Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeBusiness?.id, activeTab, period, getFilter]);

  const handlePrint = () => {
    window.print();
    if (activeBusiness?.id) {
      ReportingService.saveReportHistory(
        activeBusiness.id,
        activeTab,
        `${activeTab.toUpperCase()} - ${getFilter(period).periodLabel}`,
        'print',
        profile?.id,
      );
    }
  };

  const handleExportCSV = async (
    dataRows: (string | number)[][],
    headers: string[],
    filename: string,
  ) => {
    await ReportingService.exportCSV(filename, headers, dataRows);
    if (activeBusiness?.id) {
      ReportingService.saveReportHistory(
        activeBusiness.id,
        activeTab,
        filename,
        'csv',
        profile?.id,
      );
    }
  };

  const handleExportExcel = async (
    dataRows: (string | number)[][],
    headers: string[],
    filename: string,
    title: string,
  ) => {
    await ReportingService.exportExcel(filename, title, headers, dataRows);
    if (activeBusiness?.id) {
      ReportingService.saveReportHistory(
        activeBusiness.id,
        activeTab,
        filename,
        'xlsx',
        profile?.id,
      );
    }
  };

  const handleExportPDF = async (
    filename: string,
    title: string,
    stats: { label: string; value: string }[],
    headers: string[],
    dataRows: (string | number)[][],
    executiveSummary?: string,
  ) => {
    if (!activeBusiness) return;
    await ReportingService.exportPDF(
      filename,
      title,
      activeBusiness.business_name,
      getFilter(period)?.periodLabel || 'All Time',
      stats,
      headers,
      dataRows,
      executiveSummary,
    );
    ReportingService.saveReportHistory(activeBusiness.id, activeTab, filename, 'pdf', profile?.id);
  };

  // UI rendering helper for filters
  const renderFilters = () => (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '8px',
      }}
      className="no-scrollbar print-hidden"
    >
      {[
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'this_week', label: 'This Week' },
        { id: 'this_month', label: 'This Month' },
        { id: 'year', label: 'This Year' },
        { id: 'custom', label: 'All Time' },
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => setPeriod(p.id as ReportPeriodType)}
          style={{
            padding: '8px 16px',
            fontSize: '0.875rem',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            cursor: 'pointer',
            backgroundColor: period === p.id ? 'var(--brand-primary)' : 'var(--bg-elevated)',
            color: period === p.id ? 'white' : 'var(--text-muted)',
            border:
              period === p.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
        className="print-hidden"
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              lineHeight: '2rem',
              fontWeight: '700',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText style={{ color: 'var(--brand-primary)' }} />
            {t('reportsTitle')}
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            {t('reportsSubtitle')}
          </p>
        </div>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '8px',
            paddingBottom: '8px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontWeight: '500',
            transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-main)',
          }}
        >
          <Printer size={18} />
          {t('btnPrintReport')}
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {/* Responsive Tab Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '6px',
            padding: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            borderRadius: '16px',
            margin: '16px',
          }}
          className="print-hidden"
        >
          {[
            { id: 'sales', label: t('repTabSales'), icon: ShoppingBag, color: '#10b981' },
            { id: 'expenses', label: t('repTabExpenses'), icon: TrendingDown, color: '#ef4444' },
            { id: 'inventory', label: t('repTabStock'), icon: Package, color: '#f59e0b' },
            { id: 'profit', label: t('repTabProfit'), icon: PieChart, color: '#8b5cf6' },
            { id: 'bank', label: t('repTabBank'), icon: Building, color: '#3b82f6' },
            { id: 'history', label: t('repTabHistory'), icon: History, color: '#64748b' },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'sales' | 'expenses' | 'inventory' | 'profit' | 'bank' | 'history',
                  )
                }
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
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                }}
                className="reports-tab-btn"
              >
                <IconComponent size={20} color={isActive ? tab.color : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', minHeight: '500px' }}>
          {activeTab !== 'inventory' && activeTab !== 'history' && (
            <div style={{ marginBottom: '24px' }}>{renderFilters()}</div>
          )}

          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  borderRadius: 'var(--radius-full)',
                  borderBottom: '2px solid var(--border-color)',
                  borderColor: 'var(--brand-primary)',
                }}
              ></div>
              <p style={{ color: 'var(--text-muted)' }}>Analyzing business data...</p>
            </div>
          ) : (
            <div className="print-friendly-content">
              {/* Tab Content Components */}
              {activeTab === 'sales' && salesData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: 'var(--brand-primary)',
                          fontWeight: '500',
                        }}
                      >
                        Total Revenue
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{salesData.totalRevenue.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#10b981',
                          fontWeight: '500',
                        }}
                      >
                        Est. Gross Profit
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{salesData.estimatedGrossProfit.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#3b82f6',
                          fontWeight: '500',
                        }}
                      >
                        Transactions
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        {salesData.transactionCount.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#a855f7',
                          fontWeight: '500',
                        }}
                      >
                        Cash Collected
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{(salesData.paymentMethodsBreakdown['Cash'] || 0).toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    className="print-hidden"
                  >
                    <button
                      onClick={() =>
                        handleExportPDF(
                          'Sales_Report',
                          'Sales & Money In',
                          [
                            {
                              label: 'Total Revenue',
                              value: `N${salesData.totalRevenue.toLocaleString()}`,
                            },
                            { label: 'Transactions', value: `${salesData.transactionCount}` },
                          ],
                          ['Date', 'Receipt', 'Items', 'Method', 'Total (N)'],
                          salesData.transactions.map((t: SalesReportItem) => [
                            new Date(t.date).toLocaleDateString(),
                            t.receiptNo,
                            t.productsSummary,
                            t.paymentMethod,
                            t.totalAmount,
                          ]),
                        )
                      }
                      style={{
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        color: '#f43f5e',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                      }}
                    >
                      <DownloadCloud size={16} /> {t('btnExportPDF')}
                    </button>
                    <button
                      onClick={() =>
                        handleExportExcel(
                          salesData.transactions.map((t: SalesReportItem) => [
                            new Date(t.date).toLocaleDateString(),
                            t.receiptNo,
                            t.productsSummary,
                            t.paymentMethod,
                            t.totalAmount,
                          ]),
                          ['Date', 'Receipt', 'Items', 'Payment Method', 'Total Amount (N)'],
                          'Sales_Report',
                          'Sales & Money In',
                        )
                      }
                      style={{
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <DownloadCloud size={16} /> {t('btnExportExcel')}
                    </button>
                    <button
                      onClick={() =>
                        handleExportCSV(
                          salesData.transactions.map((t: SalesReportItem) => [
                            new Date(t.date).toLocaleDateString(),
                            t.receiptNo,
                            t.productsSummary,
                            t.paymentMethod,
                            t.totalAmount,
                          ]),
                          ['Date', 'Receipt', 'Items', 'Payment Method', 'Total Amount (N)'],
                          'Sales_Report',
                        )
                      }
                      style={{
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <DownloadCloud size={16} /> {t('btnExportCSV')}
                    </button>
                  </div>

                  <div
                    style={{
                      overflowX: 'auto',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <table style={{ minWidth: '100%' }}>
                      <thead style={{ backgroundColor: 'var(--bg-app)' }}>
                        <tr>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Receipt
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Items Summary
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Payment
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'right',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        {salesData.transactions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '32px',
                                paddingBottom: '32px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                              }}
                            >
                              No sales found for this period.
                            </td>
                          </tr>
                        ) : (
                          salesData.transactions.map((t: SalesReportItem, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-main)',
                                }}
                              >
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {t.receiptNo}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-muted)',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={t.productsSummary}
                              >
                                {t.productsSummary}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor:
                                      t.paymentMethod === 'Cash'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : 'rgba(37, 99, 235, 0.15)',
                                    color: t.paymentMethod === 'Cash' ? '#059669' : '#1d4ed8',
                                  }}
                                >
                                  {t.paymentMethod}
                                </span>
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  fontWeight: '500',
                                  color: 'var(--text-main)',
                                  textAlign: 'right',
                                }}
                              >
                                ₦{t.totalAmount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && expenseData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#f43f5e',
                          fontWeight: '500',
                        }}
                      >
                        Total Shop Bills
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{expenseData.totalExpenses.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#f97316',
                          fontWeight: '500',
                        }}
                      >
                        Largest Bill Size
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{expenseData.largestExpenseAmount.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: 'var(--text-muted)',
                          fontWeight: '500',
                        }}
                      >
                        Biggest Expense
                      </p>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          lineHeight: '1.75rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={expenseData.largestExpenseDescription}
                      >
                        {expenseData.largestExpenseDescription}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    className="print-hidden"
                  >
                    <button
                      onClick={() =>
                        handleExportPDF(
                          'Expense_Report',
                          'Shop Expenses',
                          [
                            {
                              label: 'Total Spent',
                              value: `N${expenseData.totalExpenses.toLocaleString()}`,
                            },
                          ],
                          ['Date', 'Category', 'Description', 'Amount (N)'],
                          expenseData.expenses.map((e: ExpenseReportItem) => [
                            new Date(e.date).toLocaleDateString(),
                            e.categoryName,
                            e.description,
                            e.amount,
                          ]),
                        )
                      }
                      style={{
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        color: '#f43f5e',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                      }}
                    >
                      <DownloadCloud size={16} /> {t('btnExportPDF')}
                    </button>
                  </div>

                  <div
                    style={{
                      overflowX: 'auto',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <table style={{ minWidth: '100%' }}>
                      <thead style={{ backgroundColor: 'var(--bg-app)' }}>
                        <tr>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Category
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Description
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'right',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        {expenseData.expenses.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '32px',
                                paddingBottom: '32px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                              }}
                            >
                              No expenses found for this period.
                            </td>
                          </tr>
                        ) : (
                          expenseData.expenses.map((e: ExpenseReportItem, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-main)',
                                }}
                              >
                                {new Date(e.date).toLocaleDateString()}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {e.categoryName}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  color: 'var(--text-muted)',
                                  maxWidth: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {e.description}
                              </td>
                              <td
                                style={{
                                  paddingLeft: '16px',
                                  paddingRight: '16px',
                                  paddingTop: '12px',
                                  paddingBottom: '12px',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.875rem',
                                  lineHeight: '1.25rem',
                                  fontWeight: '500',
                                  color: '#e11d48',
                                  textAlign: 'right',
                                }}
                              >
                                ₦{e.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && inventoryData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#14b8a6',
                          fontWeight: '500',
                        }}
                      >
                        Total Shop Value
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        ₦{inventoryData.inventoryValue.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#0ea5e9',
                          fontWeight: '500',
                        }}
                      >
                        Total Units in Shop
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        {inventoryData.totalUnits.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#f59e0b',
                          fontWeight: '500',
                        }}
                      >
                        Low Stock Items
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        {inventoryData.lowStockCount}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#ef4444',
                          fontWeight: '500',
                        }}
                      >
                        Out of Stock
                      </p>
                      <h3
                        style={{
                          fontSize: '1.5rem',
                          lineHeight: '2rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '4px',
                        }}
                      >
                        {inventoryData.outOfStockCount}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                    className="print-hidden"
                  >
                    <button
                      onClick={() =>
                        handleExportPDF(
                          'Stock_Report',
                          'Shop Stock & Value',
                          [
                            {
                              label: 'Total Value',
                              value: `N${inventoryData.inventoryValue.toLocaleString()}`,
                            },
                          ],
                          ['Product Name', 'Category', 'Stock Qty', 'Cost', 'Total Value'],
                          inventoryData.items.map((i: InventoryReportItem) => [
                            i.name,
                            i.category,
                            i.stock,
                            i.costPrice,
                            i.totalValue,
                          ]),
                        )
                      }
                      style={{
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        color: '#f43f5e',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                      }}
                    >
                      <DownloadCloud size={16} /> {t('btnExportPDF')}
                    </button>
                  </div>

                  <div
                    style={{
                      overflowX: 'auto',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <table style={{ minWidth: '100%' }}>
                      <thead style={{ backgroundColor: 'var(--bg-app)' }}>
                        <tr>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Product
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Category
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Stock
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              textAlign: 'right',
                              fontSize: '0.75rem',
                              lineHeight: '1rem',
                              fontWeight: '500',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Total Value
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        {inventoryData.items.map((item: InventoryReportItem, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                color: 'var(--text-main)',
                                fontWeight: '500',
                              }}
                            >
                              {item.name}{' '}
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  lineHeight: '1rem',
                                  color: 'var(--text-muted)',
                                  display: 'block',
                                }}
                              >
                                {item.sku}
                              </span>
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {item.category}
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                color: 'var(--text-main)',
                                textAlign: 'center',
                                fontWeight: '700',
                              }}
                            >
                              {item.stock}
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                textAlign: 'center',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  backgroundColor:
                                    item.status === 'In Stock'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : item.status === 'Low Stock'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                  color:
                                    item.status === 'In Stock'
                                      ? '#059669'
                                      : item.status === 'Low Stock'
                                        ? '#b45309'
                                        : '#b91c1c',
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: '500',
                                color: '#0d9488',
                                textAlign: 'right',
                              }}
                            >
                              ₦{item.totalValue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'profit' && profitData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div
                    style={{
                      padding: '24px',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        lineHeight: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                      }}
                    >
                      {profitData.summaryMessage}
                    </h2>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        paddingTop: '4px',
                        paddingBottom: '4px',
                        marginTop: '8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: '500',
                        backgroundColor: 'rgba(100, 116, 139, 0.15)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      Score: {profitData.healthScore}/100
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '9999px',
                          backgroundColor:
                            profitData.healthStatus === 'Healthy'
                              ? '#10b981'
                              : profitData.healthStatus === 'Moderate'
                                ? '#f59e0b'
                                : '#ef4444',
                        }}
                      ></span>
                      {profitData.healthStatus}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '24px',
                    }}
                  >
                    <div
                      style={{
                        padding: '24px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#10b981',
                          fontWeight: '500',
                        }}
                      >
                        Total Income
                      </p>
                      <h3
                        style={{
                          fontSize: '1.875rem',
                          lineHeight: '2.25rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '8px',
                        }}
                      >
                        ₦{profitData.revenue.toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '24px',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: '#f43f5e',
                          fontWeight: '500',
                        }}
                      >
                        Market Cost + Bills
                      </p>
                      <h3
                        style={{
                          fontSize: '1.875rem',
                          lineHeight: '2.25rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '8px',
                        }}
                      >
                        ₦{(profitData.cogs + profitData.expenses).toLocaleString()}
                      </h3>
                    </div>
                    <div
                      style={{
                        padding: '24px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          color: 'var(--brand-primary)',
                          fontWeight: '500',
                        }}
                      >
                        Pure Take-Home Profit
                      </p>
                      <h3
                        style={{
                          fontSize: '1.875rem',
                          lineHeight: '2.25rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          marginTop: '8px',
                        }}
                      >
                        ₦{profitData.netProfit.toLocaleString()}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          lineHeight: '1rem',
                          color: 'var(--brand-primary-hover)',
                          marginTop: '8px',
                        }}
                      >
                        Profit Margin: {profitData.profitMargin}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bank' && bankData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '32px',
                      backgroundColor: 'var(--bg-elevated)',
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h1
                        style={{
                          fontSize: '1.875rem',
                          lineHeight: '2.25rem',
                          fontWeight: '700',
                          color: 'var(--text-main)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}
                      >
                        Executive Financial Statement
                      </h1>
                      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        {activeBusiness?.business_name} • {bankData.reportingPeriod}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '32px',
                        marginBottom: '32px',
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '16px',
                          }}
                        >
                          Revenue & Operations
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Gross Revenue:</span>
                            <span style={{ fontWeight: '500' }}>
                              ₦{bankData.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Operating Expenses:</span>
                            <span style={{ fontWeight: '500', color: '#f43f5e' }}>
                              ₦{bankData.expenses.toLocaleString()}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              paddingTop: '8px',
                              borderTop: '1px solid var(--border-color)',
                            }}
                          >
                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                              Net Income:
                            </span>
                            <span style={{ fontWeight: '700', color: '#059669' }}>
                              ₦{bankData.netProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4
                          style={{
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '16px',
                          }}
                        >
                          Assets & Performance
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              Inventory Asset Value:
                            </span>
                            <span style={{ fontWeight: '500' }}>
                              ₦{bankData.inventoryValue.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              Business Health Score:
                            </span>
                            <span style={{ fontWeight: '500' }}>{bankData.healthScore}/100</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Top Sales Category:</span>
                            <span
                              style={{
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={bankData.topSellingProduct}
                            >
                              {bankData.topSellingProduct}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '8px',
                        }}
                      >
                        Executive Summary & Trends
                      </h4>
                      <p
                        style={{
                          color: 'var(--text-main)',
                          lineHeight: '1.625',
                          backgroundColor: 'var(--bg-app)',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {bankData.businessTrends}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'flex-end',
                        marginTop: '24px',
                      }}
                      className="print-hidden"
                    >
                      <button
                        onClick={() =>
                          handleExportPDF(
                            'Executive_Statement',
                            'Executive Financial Statement',
                            [
                              {
                                label: 'Gross Revenue',
                                value: `N${bankData.revenue.toLocaleString()}`,
                              },
                              {
                                label: 'Operating Expenses',
                                value: `N${bankData.expenses.toLocaleString()}`,
                              },
                              {
                                label: 'Net Income',
                                value: `N${bankData.netProfit.toLocaleString()}`,
                              },
                              {
                                label: 'Inventory Asset Value',
                                value: `₦${bankData.inventoryValue.toLocaleString()}`,
                              },
                              {
                                label: 'Business Health Score',
                                value: `${bankData.healthScore}/100`,
                              },
                              { label: 'Top Sales Category', value: bankData.topSellingProduct },
                            ],
                            [],
                            [],
                            bankData.businessTrends,
                          )
                        }
                        style={{
                          paddingLeft: '12px',
                          paddingRight: '12px',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          backgroundColor: 'rgba(244, 63, 94, 0.1)',
                          color: '#f43f5e',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                        }}
                      >
                        <DownloadCloud size={16} /> {t('btnExportPDF') || 'Download PDF'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{
                          paddingLeft: '12px',
                          paddingRight: '12px',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem',
                          lineHeight: '1.25rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Printer size={16} /> Print
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && historyData && (
                <div
                  style={{
                    overflowX: 'auto',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <table style={{ minWidth: '100%' }}>
                    <thead style={{ backgroundColor: 'var(--bg-app)' }}>
                      <tr>
                        <th
                          style={{
                            paddingLeft: '16px',
                            paddingRight: '16px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            lineHeight: '1rem',
                            fontWeight: '500',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Date Generated
                        </th>
                        <th
                          style={{
                            paddingLeft: '16px',
                            paddingRight: '16px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            lineHeight: '1rem',
                            fontWeight: '500',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Report Name
                        </th>
                        <th
                          style={{
                            paddingLeft: '16px',
                            paddingRight: '16px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            lineHeight: '1rem',
                            fontWeight: '500',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Format
                        </th>
                        <th
                          style={{
                            paddingLeft: '16px',
                            paddingRight: '16px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            lineHeight: '1rem',
                            fontWeight: '500',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Author
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      {historyData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '32px',
                              paddingBottom: '32px',
                              textAlign: 'center',
                              color: 'var(--text-muted)',
                            }}
                          >
                            No reports generated yet. Start exporting to build history.
                          </td>
                        </tr>
                      ) : (
                        historyData.map((h: ReportHistory, i: number) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {new Date(h.generatedAt).toLocaleString()}
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                fontWeight: '500',
                                color: 'var(--text-main)',
                              }}
                            >
                              {h.reportName}
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  backgroundColor:
                                    h.exportFormat === 'pdf'
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : h.exportFormat === 'xlsx'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(107, 114, 128, 0.15)',
                                  color:
                                    h.exportFormat === 'pdf'
                                      ? '#b91c1c'
                                      : h.exportFormat === 'xlsx'
                                        ? '#15803d'
                                        : '#374151',
                                }}
                              >
                                {h.exportFormat.toUpperCase()}
                              </span>
                            </td>
                            <td
                              style={{
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '12px',
                                paddingBottom: '12px',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                lineHeight: '1.25rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {h.generatedBy === user?.id
                                ? profile?.full_name || user?.email || 'Owner'
                                : h.generatedBy || 'Owner'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
