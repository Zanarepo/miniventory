import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { ReceiptModal } from '../components/ReceiptModal';
import { Pagination } from '../components/Pagination';
import type { Sale, SaleItem } from '../types/sales';

interface SaleWithItems extends Sale {
  productNames?: string;
  itemCount?: number;
  firstItemName?: string;
}

export const SalesHistory: React.FC = () => {
  const { t } = useLanguage();
  const { business, getCurrencySymbol } = useBusiness();
  const currSymbol = getCurrencySymbol();
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleItems, setSelectedSaleItems] = useState<(SaleItem & { product_name?: string })[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filter states
  const [filterPayMethod, setFilterPayMethod] = useState('');
  const [period, setPeriod] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadDates = async () => {
      await Promise.resolve(); // Async boundary prevents synchronous cascading renders
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      switch (period) {
        case 'TODAY':
          setStartDate(todayStr);
          setEndDate(todayStr);
          break;
        case 'YESTERDAY': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yestStr = yesterday.toISOString().split('T')[0];
          setStartDate(yestStr);
          setEndDate(yestStr);
          break;
        }
        case 'LAST_7_DAYS': {
          const last7 = new Date(today);
          last7.setDate(today.getDate() - 6);
          setStartDate(last7.toISOString().split('T')[0]);
          setEndDate(todayStr);
          break;
        }
        case 'LAST_30_DAYS': {
          const last30 = new Date(today);
          last30.setDate(today.getDate() - 29);
          setStartDate(last30.toISOString().split('T')[0]);
          setEndDate(todayStr);
          break;
        }
        case 'THIS_MONTH': {
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
          setStartDate(firstDay.toISOString().split('T')[0]);
          setEndDate(todayStr);
          break;
        }
        case 'LAST_MONTH': {
          const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          setStartDate(firstDayLastMonth.toISOString().split('T')[0]);
          setEndDate(lastDayLastMonth.toISOString().split('T')[0]);
          break;
        }
        case 'THIS_YEAR': {
          const firstDayYear = new Date(today.getFullYear(), 0, 1);
          setStartDate(firstDayYear.toISOString().split('T')[0]);
          setEndDate(todayStr);
          break;
        }
        case 'CUSTOM':
          break;
      }
    };
    loadDates();
  }, [period]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  useEffect(() => {
    const loadSales = async () => {
      if (!business?.id) return;

      try {
        if (navigator.onLine) {
          // Pull sales from Supabase
          const { data: fetchedSales, error: salesErr } = await supabase
            .from('sales')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

          if (!salesErr && fetchedSales) {
            await db.sales.bulkPut(fetchedSales);

            const saleIds = fetchedSales.map((s) => s.id);
            if (saleIds.length > 0) {
              // Pull sale items from Supabase
              const { data: fetchedItems, error: itemsErr } = await supabase
                .from('sale_items')
                .select('*')
                .in('sale_id', saleIds);

              if (!itemsErr && fetchedItems) {
                await db.saleItems.bulkPut(fetchedItems);
              }
            }
          }
        }
      } catch (syncErr) {
        console.error('Failed to sync sales from cloud:', syncErr);
      }

      const allSales = await db.sales
        .where('business_id')
        .equals(business.id)
        .reverse()
        .sortBy('created_at');

      const salesWithNames = await Promise.all(
        allSales.map(async (sale) => {
          const items = await db.saleItems.where('sale_id').equals(sale.id).toArray();
          const itemsWithNames = await Promise.all(
            items.map(async (item) => {
              if (item.custom_name) return item.custom_name;
              const prod = await db.products.get(item.product_id);
              return prod ? prod.product_name : 'Unknown Product';
            }),
          );
          return {
            ...sale,
            productNames: itemsWithNames.join(', '),
            itemCount: itemsWithNames.length,
            firstItemName: itemsWithNames[0],
          };
        }),
      );
      setSales(salesWithNames);
    };
    loadSales();
  }, [business?.id]);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.productNames && s.productNames.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayMethod = filterPayMethod ? s.payment_method === filterPayMethod : true;

    const saleDate = (s.created_at || '').split('T')[0];
    const matchesStartDate = startDate ? saleDate >= startDate : true;
    const matchesEndDate = endDate ? saleDate <= endDate : true;

    return matchesSearch && matchesPayMethod && matchesStartDate && matchesEndDate;
  });

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_amount, 0);
  const totalGrossProfit = sales.reduce((acc, sale) => acc + Number(sale.gross_profit || 0), 0);

  const viewReceipt = async (sale: Sale) => {
    const items = await db.saleItems.where('sale_id').equals(sale.id).toArray();
    const itemsWithNames = await Promise.all(
      items.map(async (item) => {
        const prod = await db.products.get(item.product_id);
        return {
          ...item,
          product_name: item.custom_name || (prod ? prod.product_name : 'Unknown Product'),
        };
      })
    );
    setSelectedSale(sale);
    setSelectedSaleItems(itemsWithNames);
    setIsReceiptOpen(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-heading">
            {t('salesHistoryTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('salesHistorySubtitle')}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card
          className="p-4 border-l-4 border-l-emerald-500"
          style={{ padding: '16px', borderLeft: '4px solid var(--brand-primary)' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 6px 0',
            }}
          >
            Total Revenue
          </p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 6px 0',
            }}
          >
            Gross Profit
          </p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: 0 }}>
            {formatCurrency(totalGrossProfit)}
          </p>
        </Card>
        <Card
          className="p-4 border-l-4 border-l-indigo-500"
          style={{ padding: '16px', borderLeft: '4px solid var(--brand-cyan)' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 6px 0',
            }}
          >
            Total Sales Count
          </p>
          <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            {sales.length}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-app)',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '2 1 280px', maxWidth: '320px' }}>
              <SearchInput
                placeholder="Search by receipt or items..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <select
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                minWidth: '160px',
              }}
              value={filterPayMethod}
              onChange={(e) => {
                setFilterPayMethod(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Pay Methods</option>
              <option value="CASH">Cash</option>
              <option value="POS">POS</option>
              <option value="TRANSFER">Transfer</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>

            <select
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                minWidth: '160px',
              }}
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_YEAR">This Year</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {period === 'CUSTOM' ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Date:
                </span>
                <input
                  type="date"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing sales from <strong>{formatDate(startDate)}</strong> to{' '}
                <strong>{formatDate(endDate)}</strong>
              </span>
            )}

            {(period !== 'THIS_MONTH' || filterPayMethod || searchQuery) && (
              <button
                onClick={() => {
                  setPeriod('THIS_MONTH');
                  setFilterPayMethod('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-danger)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginLeft: 'auto',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Desktop View Table */}
        <div className="desktop-table-container table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>{t('colDate')}</th>
                <th>{t('colReceiptNo')}</th>
                <th>Items Sold</th>
                <th>Payment Method</th>
                <th>{t('colTotalAmount')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((sale) => (
                <tr 
                  key={sale.id} 
                  onClick={() => viewReceipt(sale)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  style={{ cursor: 'pointer' }}
                  title="Click to view full receipt"
                >
                  <td>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(sale.created_at || '')}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {sale.receipt_number}
                    </span>
                  </td>
                  <td
                    style={{
                      maxWidth: '240px',
                    }}
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {sale.itemCount && sale.itemCount > 1
                        ? 'Multiple Items'
                        : sale.firstItemName || 'No items'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td>
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        viewReceipt(sale);
                      }}
                    >
                      View Receipt
                    </Button>
                  </td>
                </tr>
              ))}
              {paginatedSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    {t('noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="mobile-cards-container">
          {paginatedSales.map((sale) => (
            <Card
              key={sale.id}
              onClick={() => viewReceipt(sale)}
              className="cursor-pointer hover:border-brand-primary transition-colors"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
              title="Click to view full receipt"
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDate(sale.created_at || '')}
                </span>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {sale.receipt_number}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '4px',
                }}
              >
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {sale.itemCount && sale.itemCount > 1
                    ? 'Multiple Items'
                    : sale.firstItemName || 'No items'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px',
                }}
              >
                <span
                  style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-primary)' }}
                >
                  {formatCurrency(sale.total_amount)}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    viewReceipt(sale);
                  }}
                >
                  View Receipt
                </Button>
              </div>
            </Card>
          ))}
          {paginatedSales.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              {t('noRecords')}
            </div>
          )}
        </div>

        {/* Reusable Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
        saleItems={selectedSaleItems}
      />

      <style>{`
        .desktop-table-container {
          display: block;
        }
        .mobile-cards-container {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
};
