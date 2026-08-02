import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Layers,
  Filter,
  BarChart3,
  AlertCircle,
  Briefcase,
  Calendar,
  FileText,
} from 'lucide-react';
import { KPICard } from '../../components/dashboard/KPICard';
import {
  BusinessComparisonChart,
  type BusinessRankingItem,
} from '../../components/dashboard/BusinessComparisonChart';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface FinancialKPIs {
  total_revenue: number;
  total_cogs: number;
  total_gross_profit: number;
  total_expenses: number;
  total_net_profit: number;
  total_sales_count: number;
  total_expenses_count: number;
  total_inventory_count: number;
  total_inventory_value_cost: number;
  total_inventory_value_retail: number;
  overall_profit_margin: number;
}

interface BusinessOption {
  id: string;
  business_name: string;
}

export const AdminFinancials: React.FC = () => {
  const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
  const [leaderboard, setLeaderboard] = useState<BusinessRankingItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableSortField, setTableSortField] = useState<keyof BusinessRankingItem>('net_profit');
  const [tableSortAsc, setTableSortAsc] = useState<boolean>(false);

  const currencySymbol = '₦'; // Default platform currency symbol

  // Fetch business list for dropdown
  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('id, business_name')
        .order('business_name');
      if (data) setBusinesses(data);
    };
    fetchBusinesses();
  }, []);

  // Fetch financial data when filters change
  useEffect(() => {
    const fetchFinancials = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        let p_start_date: string | null = null;
        const p_end_date: string | null = null;
        const today = new Date();

        if (timeRange === '7d') {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          p_start_date = d.toISOString().split('T')[0];
        } else if (timeRange === '30d') {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          p_start_date = d.toISOString().split('T')[0];
        } else if (timeRange === 'month') {
          const d = new Date(today.getFullYear(), today.getMonth(), 1);
          p_start_date = d.toISOString().split('T')[0];
        } else if (timeRange === 'year') {
          const d = new Date(today.getFullYear(), 0, 1);
          p_start_date = d.toISOString().split('T')[0];
        } // 'all' leaves both dates null

        const p_business_id = selectedBusinessId === 'ALL' ? null : selectedBusinessId;

        const { data, error } = await supabase.rpc('get_admin_platform_financials', {
          p_start_date,
          p_end_date,
          p_business_id,
        });

        if (error) {
          console.error('Error fetching platform financials:', error);
          setErrorMessage(
            `Database Query Error: ${error.message || error.details || JSON.stringify(error)}`,
          );
        } else if (data) {
          setKpis(data.kpis || null);
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Unexpected error loading financials:', err);
        setErrorMessage('An unexpected error occurred while calculating company financials.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancials();
  }, [timeRange, selectedBusinessId]);

  const formatCurr = (val: number) =>
    `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sortedTableData = [...leaderboard].sort((a, b) => {
    const aVal = a[tableSortField] ?? 0;
    const bVal = b[tableSortField] ?? 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return tableSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return tableSortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });

  const handleSort = (field: keyof BusinessRankingItem) => {
    if (tableSortField === field) {
      setTableSortAsc(!tableSortAsc);
    } else {
      setTableSortField(field);
      setTableSortAsc(false);
    }
  };

  const downloadCsvReport = () => {
    const headers = [
      'Rank',
      'Business Name',
      'Sales Revenue',
      'COGS',
      'Gross Profit',
      'Operating Expenses',
      'Net Profit / Loss',
      'Stock Units',
      'Stock Value (Cost)',
      'Profit Margin (%)',
    ];

    const rows = sortedTableData.map((b, idx) => [
      idx + 1,
      `"${(b.business_name || 'Unnamed').replace(/"/g, '""')}"`,
      b.revenue || 0,
      b.cogs || 0,
      b.gross_profit || 0,
      b.expenses || 0,
      b.net_profit || 0,
      b.stock_count || 0,
      b.stock_value_cost || 0,
      b.profit_margin || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `BizTrack_Company_Financials_Report_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '48px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: '1.8rem',
            color: 'var(--text-main)',
            fontWeight: 800,
          }}
        >
          Company Financials & Performance Tracker
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Monitor sales revenue, COGS, expenses, net profitability, and inventory valuations across
          the entire platform or per business.
        </p>
      </div>

      {/* Interactive Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-main)',
            fontWeight: 700,
          }}
        >
          <Filter size={18} color="var(--brand-primary)" />
          <span>Financial Filters:</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          {/* Timeframe selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={12} /> Time Period:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Business filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Briefcase size={12} /> Scope:
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <option value="ALL">Company-Wide (All Businesses)</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.business_name || `Unnamed (${b.id.substring(0, 8)})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '12px',
          }}
        >
          <LoadingSpinner size="lg" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Calculating company financials & ranking businesses...
          </span>
        </div>
      ) : errorMessage ? (
        <div
          style={{
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-error, #EF4444)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-error, #EF4444)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Calculation Error</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{errorMessage}</p>
          </div>
        </div>
      ) : kpis ? (
        <>
          {/* Section 1: Financial Performance KPIs */}
          <h3
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-main)',
              marginBottom: '16px',
              fontWeight: 700,
            }}
          >
            Revenue, Costs & Profitability {selectedBusinessId === 'ALL' ? '(Platform Total)' : ''}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
              marginBottom: '32px',
            }}
          >
            <KPICard
              title="Total Sales Revenue"
              value={formatCurr(kpis.total_revenue)}
              icon={<DollarSign size={20} />}
              trendPercentage={0}
              trendLabel={`${kpis.total_sales_count} sales recorded`}
              neutralTrend={true}
            />
            <KPICard
              title="Cost of Goods (COGS)"
              value={formatCurr(kpis.total_cogs)}
              icon={<Package size={20} />}
              trendPercentage={0}
              trendLabel="Inventory acquisition cost"
              neutralTrend={true}
            />
            <KPICard
              title="Gross Profit"
              value={formatCurr(kpis.total_gross_profit)}
              icon={<TrendingUp size={20} />}
              trendPercentage={0}
              trendLabel="Before operating expenses"
              neutralTrend={true}
            />
            <KPICard
              title="Total Expenses"
              value={formatCurr(kpis.total_expenses)}
              icon={<DollarSign size={20} />}
              trendPercentage={0}
              trendLabel={`${kpis.total_expenses_count} expense entries`}
              neutralTrend={true}
            />
            <KPICard
              title={kpis.total_net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
              value={formatCurr(kpis.total_net_profit)}
              icon={
                kpis.total_net_profit >= 0 ? (
                  <TrendingUp size={20} color="#10B981" />
                ) : (
                  <TrendingDown size={20} color="#EF4444" />
                )
              }
              trendPercentage={kpis.overall_profit_margin}
              trendLabel="Profit margin"
              neutralTrend={false}
            />
          </div>

          {/* Section 2: Inventory Valuation KPIs */}
          <h3
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-main)',
              marginBottom: '16px',
              fontWeight: 700,
            }}
          >
            Inventory Quantity & Monetary Valuation
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              marginBottom: '36px',
            }}
          >
            <div
              className="card"
              style={{
                padding: '22px',
                background: 'var(--surface-color)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Total Inventory Items
                </span>
                <div
                  style={{
                    padding: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    color: '#3B82F6',
                  }}
                >
                  <Layers size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {kpis.total_inventory_count.toLocaleString()}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  units
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total physical stock volume currently held
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: '22px',
                background: 'var(--surface-color)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Inventory Value (At Cost)
                </span>
                <div
                  style={{
                    padding: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    color: '#10B981',
                  }}
                >
                  <DollarSign size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
                {formatCurr(kpis.total_inventory_value_cost)}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total capital currently tied up in inventory inventory (cost price)
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: '22px',
                background: 'var(--surface-color)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Potential Retail Value
                </span>
                <div
                  style={{
                    padding: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '50%',
                    color: '#8B5CF6',
                  }}
                >
                  <TrendingUp size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6' }}>
                {formatCurr(kpis.total_inventory_value_retail)}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Expected gross revenue if all existing stock is sold
              </p>
            </div>
          </div>

          {/* Section 3: Best Business Leaderboard & Comparison Chart */}
          <div
            className="card"
            style={{
              padding: '28px',
              background: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              marginBottom: '36px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: '0 0 4px',
                    fontSize: '1.25rem',
                    color: 'var(--text-main)',
                    fontWeight: 800,
                  }}
                >
                  Business Comparison & Leaderboard
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Compare top performing businesses across profitability, sales volume, and stock
                  value.
                </p>
              </div>
              <BarChart3 size={24} color="var(--brand-primary)" />
            </div>

            <BusinessComparisonChart data={leaderboard} currencySymbol={currencySymbol} />
          </div>

          {/* Section 4: Full Detailed Financial Matrix */}
          <div
            className="card"
            style={{
              padding: '24px',
              background: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: '0 0 4px',
                    fontSize: '1.25rem',
                    color: 'var(--text-main)',
                    fontWeight: 800,
                  }}
                >
                  Detailed Company Financial & Ranking Registry
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Click on any column header (Sales Revenue, Net Profit, Stock Value, etc.) to sort
                  and rank all businesses by that exact metric.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '16px',
                  }}
                >
                  Sorted by: {tableSortField.replace(/_/g, ' ')} (
                  {tableSortAsc ? 'Ascending' : 'Descending'})
                </span>
                <button
                  onClick={downloadCsvReport}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--brand-primary)',
                    background: 'var(--brand-primary)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  title="Export full financial spreadsheet as CSV / Excel"
                >
                  <FileText size={16} />
                  <span>Export CSV Report</span>
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid var(--border-color)',
                    textAlign: 'left',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  {[
                    { key: 'business_name', label: 'Rank & Business Name' },
                    { key: 'revenue', label: 'Sales Revenue' },
                    { key: 'cogs', label: 'COGS' },
                    { key: 'gross_profit', label: 'Gross Profit' },
                    { key: 'expenses', label: 'Expenses' },
                    { key: 'net_profit', label: 'Net Profit / Loss' },
                    { key: 'stock_count', label: 'Stock Count' },
                    { key: 'stock_value_cost', label: 'Stock Value (Cost)' },
                    { key: 'profit_margin', label: 'Margin' },
                  ].map((col) => {
                    const isSorted = tableSortField === col.key;
                    return (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key as keyof BusinessRankingItem)}
                        style={{
                          padding: '12px 14px',
                          fontSize: '0.8rem',
                          color: isSorted ? 'var(--brand-primary)' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          userSelect: 'none',
                          fontWeight: isSorted ? 800 : 700,
                          background: isSorted ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{col.label}</span>
                          {isSorted && <span>{tableSortAsc ? '▲' : '▼'}</span>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedTableData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      No financial data available for this selection.
                    </td>
                  </tr>
                ) : (
                  sortedTableData.map((row, index) => {
                    const badge =
                      index === 0 && !tableSortAsc
                        ? '🥇 #1'
                        : index === 1 && !tableSortAsc
                          ? '🥈 #2'
                          : index === 2 && !tableSortAsc
                            ? '🥉 #3'
                            : `#${index + 1}`;

                    return (
                      <tr
                        key={row.business_id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color var(--transition-fast)',
                          background:
                            index === 0 && !tableSortAsc
                              ? 'rgba(245, 158, 11, 0.03)'
                              : 'transparent',
                        }}
                      >
                        <td
                          style={{
                            padding: '14px',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              minWidth: '42px',
                              color: index === 0 ? '#F59E0B' : 'var(--text-muted)',
                            }}
                          >
                            {badge}
                          </span>
                          <span>
                            {row.business_name || `Business ${row.business_id.substring(0, 8)}`}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: 'var(--text-main)',
                            fontWeight: tableSortField === 'revenue' ? 800 : 600,
                            background:
                              tableSortField === 'revenue'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.revenue)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: 'var(--text-muted)',
                            background:
                              tableSortField === 'cogs'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.cogs)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: 'var(--text-main)',
                            fontWeight: 600,
                            background:
                              tableSortField === 'gross_profit'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.gross_profit)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: 'var(--color-warning, #F59E0B)',
                            fontWeight: tableSortField === 'expenses' ? 800 : 600,
                            background:
                              tableSortField === 'expenses'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.expenses)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            fontWeight: 800,
                            color: row.net_profit >= 0 ? '#10B981' : '#EF4444',
                            background:
                              tableSortField === 'net_profit'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.net_profit)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: 'var(--text-main)',
                            background:
                              tableSortField === 'stock_count'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {row.stock_count.toLocaleString()} units
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            color: '#3B82F6',
                            fontWeight: tableSortField === 'stock_value_cost' ? 800 : 600,
                            background:
                              tableSortField === 'stock_value_cost'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {formatCurr(row.stock_value_cost)}
                        </td>
                        <td
                          style={{
                            padding: '14px',
                            fontWeight: 700,
                            color: row.profit_margin >= 0 ? '#10B981' : '#EF4444',
                            background:
                              tableSortField === 'profit_margin'
                                ? 'rgba(16, 185, 129, 0.04)'
                                : 'transparent',
                          }}
                        >
                          {row.profit_margin}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};
