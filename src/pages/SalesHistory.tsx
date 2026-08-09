import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { ReceiptModal } from '../components/ReceiptModal';
import { Pagination } from '../components/Pagination';
import { processSyncQueue } from '../services/syncService';
import type { Sale, SaleItem } from '../types/sales';
import type { SaleWithItems } from '../types/sales';
import type { InventoryTransaction } from '../types/inventory';
import { SalesHistoryStats } from '../components/SalesHistory/SalesHistoryStats';
import { SalesHistoryFilters } from '../components/SalesHistory/SalesHistoryFilters';
import { SalesHistoryTable } from '../components/SalesHistory/SalesHistoryTable';
import { VoidSaleModal } from '../components/SalesHistory/VoidSaleModal';

export const SalesHistory: React.FC = () => {
  const { t } = useLanguage();
  const { business, getCurrencySymbol, currentRole } = useBusiness();
  const { profile } = useAuth();
  const currSymbol = getCurrencySymbol();
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleItems, setSelectedSaleItems] = useState<
    (SaleItem & { product_name?: string })[]
  >([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [voidSaleId, setVoidSaleId] = useState<string | null>(null);
  const [voidReasonSelect, setVoidReasonSelect] = useState('Customer cancelled');
  const [customVoidReason, setCustomVoidReason] = useState('');

  const confirmVoidSale = async () => {
    if (!business?.id || !voidSaleId) return;
    const saleId = voidSaleId;

    try {
      const sale = await db.sales.get(saleId);
      if (!sale) return;

      const finalReason =
        voidReasonSelect === 'Other' ? customVoidReason || 'Other' : voidReasonSelect;
      const voidedBy = profile?.full_name || profile?.email || 'Unknown';
      const newReceipt = sale.receipt_number.includes('[VOID')
        ? sale.receipt_number
        : `${sale.receipt_number} [VOID: ${finalReason} by ${voidedBy}]`;
      const updatedSale = { ...sale, payment_status: 'VOIDED', receipt_number: newReceipt };
      await db.sales.update(saleId, { payment_status: 'VOIDED', receipt_number: newReceipt });

      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'sale',
        payload: updatedSale,
        createdAt: Date.now(),
        status: 'pending',
      });

      const saleItems = await db.saleItems.where('sale_id').equals(saleId).toArray();
      const now = new Date().toISOString();

      const inventoryTxs: InventoryTransaction[] = saleItems.map((item) => ({
        id: crypto.randomUUID(),
        business_id: business.id,
        product_id: item.product_id,
        movement_type: 'Void Restock',
        quantity: Math.abs(item.quantity),
        unit_cost: item.unit_cost,
        remarks: `Voided Sale: ${sale.receipt_number}`,
        created_by: sale.created_by,
        created_at: now,
      }));

      await db.inventoryTransactions.bulkPut(inventoryTxs);
      for (const tx of inventoryTxs) {
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'inventory_transaction',
          payload: tx,
          createdAt: Date.now(),
          status: 'pending',
        });
      }

      if (sale.customer_id && sale.payment_status !== 'PAID' && sale.payment_status !== 'VOIDED') {
        const amountUnpaid = sale.total_amount - (sale.amount_paid || 0);
        if (amountUnpaid > 0) {
          const customer = await db.customers.get(sale.customer_id);
          if (customer) {
            const newBalance = Math.max(0, (customer.balance || 0) - amountUnpaid);
            await db.customers.update(sale.customer_id, { balance: newBalance });
            await db.syncQueue.add({
              action: 'UPDATE',
              entity: 'customer',
              payload: { id: sale.customer_id, balance: newBalance },
              createdAt: Date.now(),
              status: 'pending',
            });
          }
        }
      }

      setSales((prev) =>
        prev.map((s) =>
          s.id === saleId ? { ...s, payment_status: 'VOIDED', receipt_number: newReceipt } : s,
        ),
      );
      setIsReceiptOpen(false);
      setVoidSaleId(null);

      processSyncQueue().catch(console.error);

      alert('Sale has been successfully voided and inventory restored.');
    } catch (err) {
      console.error('Error voiding sale', err);
      alert('Failed to void sale.');
    }
  };

  const [filterPayMethod, setFilterPayMethod] = useState('');
  const [period, setPeriod] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleReturnItem = async (item: SaleItem) => {
    if (!business?.id || !selectedSale || item.is_voided) return;

    if (!window.confirm(`Are you sure you want to return this item?`)) {
      return;
    }

    try {
      const updatedItem = { ...item, is_voided: true };
      await db.saleItems.update(item.id, { is_voided: true });
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'sale_item',
        payload: updatedItem,
        createdAt: Date.now(),
        status: 'pending',
      });

      const newTotal = selectedSale.total_amount - item.line_total;
      const newSubtotal = selectedSale.subtotal - item.line_total;
      const newGrossProfit = selectedSale.gross_profit - item.line_profit;
      const newTotalCost = selectedSale.total_cost - item.unit_cost * item.quantity;

      const newReceipt = selectedSale.receipt_number.includes('[PARTIAL RETURN]')
        ? selectedSale.receipt_number
        : `${selectedSale.receipt_number} [PARTIAL RETURN]`;

      const updatedSale = {
        ...selectedSale,
        total_amount: newTotal,
        subtotal: newSubtotal,
        gross_profit: newGrossProfit,
        total_cost: newTotalCost,
        receipt_number: newReceipt,
      };

      await db.sales.update(selectedSale.id, updatedSale);
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'sale',
        payload: updatedSale,
        createdAt: Date.now(),
        status: 'pending',
      });

      const tx = {
        id: crypto.randomUUID(),
        business_id: business.id,
        product_id: item.product_id,
        movement_type: 'Void Restock' as const,
        quantity: Math.abs(item.quantity),
        unit_cost: item.unit_cost,
        remarks: `Partial Return: ${selectedSale.receipt_number}`,
        created_by: selectedSale.created_by,
        created_at: new Date().toISOString(),
      };

      await db.inventoryTransactions.add(tx);
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'inventory_transaction',
        payload: tx,
        createdAt: Date.now(),
        status: 'pending',
      });

      // Create new RETURN Sale for the history
      const voidedBy = profile?.full_name || profile?.email || 'Unknown';
      const newReturnSaleId = crypto.randomUUID();
      const returnSale = {
        id: newReturnSaleId,
        business_id: business.id,
        customer_id: selectedSale.customer_id,
        receipt_number: `${selectedSale.receipt_number} [VOID by ${voidedBy}]`,
        subtotal: item.line_total,
        total_amount: item.line_total,
        total_cost: item.unit_cost * item.quantity,
        gross_profit: item.line_profit,
        payment_method: selectedSale.payment_method,
        payment_status: 'VOIDED',
        amount_paid: 0,
        balance_due: 0,
        notes: `Item returned from ${selectedSale.receipt_number} by ${voidedBy}`,
        created_by: profile?.id || selectedSale.created_by,
        created_at: new Date().toISOString(),
      };

      await db.sales.add(returnSale as any);
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'sale',
        payload: returnSale,
        createdAt: Date.now(),
        status: 'pending',
      });

      const returnSaleItem = {
        ...item,
        id: crypto.randomUUID(),
        sale_id: newReturnSaleId,
        is_voided: true,
      };

      await db.saleItems.add(returnSaleItem);
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'sale_item',
        payload: returnSaleItem,
        createdAt: Date.now(),
        status: 'pending',
      });

      setSelectedSale(updatedSale);
      setSelectedSaleItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      setSales((prev) => {
        const next = prev.map((s) => (s.id === updatedSale.id ? updatedSale : s));
        next.unshift(returnSale as any);
        return next.sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime(),
        );
      });

      if (
        selectedSale.customer_id &&
        selectedSale.payment_status !== 'PAID' &&
        selectedSale.payment_status !== 'VOIDED'
      ) {
        const customer = await db.customers.get(selectedSale.customer_id);
        if (customer) {
          const amountUnpaid = selectedSale.total_amount - (selectedSale.amount_paid || 0);
          const newAmountUnpaid = newTotal - (selectedSale.amount_paid || 0);
          const balanceReduction = amountUnpaid - Math.max(0, newAmountUnpaid);
          if (balanceReduction > 0) {
            const newBalance = Math.max(0, (customer.balance || 0) - balanceReduction);
            await db.customers.update(customer.id, { balance: newBalance });
            await db.syncQueue.add({
              action: 'UPDATE',
              entity: 'customer',
              payload: { id: customer.id, balance: newBalance },
              createdAt: Date.now(),
              status: 'pending',
            });
          }
        }
      }

      processSyncQueue().catch(console.error);
    } catch (err) {
      console.error('Error returning item', err);
      alert('Failed to return item.');
    }
  };

  useEffect(() => {
    const loadDates = async () => {
      await Promise.resolve();
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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const formatCurrency = React.useCallback(
    (val: number) =>
      `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [currSymbol],
  );

  const formatCompactCurrency = React.useCallback(
    (num: number) => {
      if (num >= 1e9) return `${currSymbol}${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
      if (num >= 1e6) return `${currSymbol}${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
      if (num >= 1e3) return `${currSymbol}${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
      return `${currSymbol}${Number(num).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`;
    },
    [currSymbol],
  );

  const formatNumber = (val: number) => Number(val).toLocaleString();
  const formatCompactNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
    return formatNumber(num);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  useEffect(() => {
    const loadSales = async () => {
      if (!business?.id) return;

      try {
        if (navigator.onLine) {
          const { data: fetchedSales, error: salesErr } = await supabase
            .from('sales')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

          if (!salesErr && fetchedSales) {
            await db.sales.bulkPut(fetchedSales);

            const saleIds = fetchedSales.map((s) => s.id);
            if (saleIds.length > 0) {
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
              let name = item.custom_name;
              if (!name) {
                const prod = await db.products.get(item.product_id);
                name = prod ? prod.product_name : 'Unknown Product';
              }
              return item.is_voided ? `${name} (Returned)` : name;
            }),
          );
          return {
            ...sale,
            productNames: itemsWithNames.join(', '),
            itemCount: itemsWithNames.length,
            firstItemName: itemsWithNames[0],
            hasDiscount: items.some((item) => item.is_discounted),
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

    const isVoid = s.payment_status === 'VOIDED' || s.receipt_number.includes('[VOID');
    const matchesPayMethod = filterPayMethod
      ? filterPayMethod === 'VOIDED'
        ? isVoid
        : s.payment_method === filterPayMethod && !isVoid
      : true;

    const saleDate = (s.created_at || '').split('T')[0];
    const matchesStartDate = startDate ? saleDate >= startDate : true;
    const matchesEndDate = endDate ? saleDate <= endDate : true;

    return matchesSearch && matchesPayMethod && matchesStartDate && matchesEndDate;
  });

  const activeSales = sales.filter(
    (s) => s.payment_status !== 'VOIDED' && !s.receipt_number.includes('[VOID'),
  );
  const totalRevenue = activeSales.reduce((acc, sale) => acc + sale.total_amount, 0);
  const totalGrossProfit = activeSales.reduce(
    (acc, sale) => acc + Number(sale.gross_profit || 0),
    0,
  );

  const viewReceipt = async (sale: Sale) => {
    const items = await db.saleItems.where('sale_id').equals(sale.id).toArray();
    const itemsWithNames = await Promise.all(
      items.map(async (item) => {
        const prod = await db.products.get(item.product_id);
        return {
          ...item,
          product_name: item.custom_name || (prod ? prod.product_name : 'Unknown Product'),
        };
      }),
    );
    setSelectedSale(sale);
    setSelectedSaleItems(itemsWithNames);
    setIsReceiptOpen(true);
  };

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
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

      <SalesHistoryStats
        totalRevenue={totalRevenue}
        totalGrossProfit={totalGrossProfit}
        salesCount={sales.length}
        formatCurrency={formatCurrency}
        formatCompactCurrency={formatCompactCurrency}
        formatNumber={formatNumber}
        formatCompactNumber={formatCompactNumber}
      />

      <Card className="overflow-hidden">
        <SalesHistoryFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filterPayMethod={filterPayMethod}
          onFilterPayMethodChange={(val) => {
            setFilterPayMethod(val);
            setCurrentPage(1);
          }}
          period={period}
          onPeriodChange={(val) => {
            setPeriod(val);
            setCurrentPage(1);
          }}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={() => {
            setPeriod('THIS_MONTH');
            setFilterPayMethod('');
            setSearchQuery('');
            setCurrentPage(1);
          }}
        />

        <SalesHistoryTable
          paginatedSales={paginatedSales}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onViewReceipt={viewReceipt}
          onVoidSale={setVoidSaleId}
          currentRole={currentRole}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      <VoidSaleModal
        isOpen={!!voidSaleId}
        onClose={() => setVoidSaleId(null)}
        onConfirm={confirmVoidSale}
        voidReasonSelect={voidReasonSelect}
        setVoidReasonSelect={setVoidReasonSelect}
        customVoidReason={customVoidReason}
        setCustomVoidReason={setCustomVoidReason}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
        saleItems={selectedSaleItems}
        onVoidSale={setVoidSaleId}
        onReturnItem={handleReturnItem}
      />
    </div>
  );
};
