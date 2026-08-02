import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from './useBusiness';
import { useExpenses } from './useExpenses';
import { useInventory } from './useInventory';
import { db } from '../lib/dexie';

export type TransactionType = 'sale' | 'expense' | 'inventory';
export type TransactionFilter = 'all' | 'sale' | 'expense' | 'inventory';

export interface RecentTransactionItem {
  id: string;
  type: TransactionType;
  date: string;
  displayDate: string;
  title: string;
  description: string;
  amount: number;
  isMonetary: boolean;
  isCredit: boolean;
  paymentMethod?: string;
  status: 'Completed' | 'Adjusted' | 'Pending';
  linkUrl: string;
}

export interface RecentTransactionsSummary {
  totalCount: number;
  salesCount: number;
  expensesCount: number;
  inventoryCount: number;
}

export const useRecentTransactions = () => {
  const { business } = useBusiness();
  const { expenses, isLoading: isExpensesLoading } = useExpenses();
  const { products, transactions: invTransactions, isLoading: isInvLoading } = useInventory();
  const businessId = business?.id;

  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [rawTransactions, setRawTransactions] = useState<RecentTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      map.set(p.id, p.product_name);
    }
    return map;
  }, [products]);

  const formatDisplayDate = (dateStr?: string): string => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const fetchAllTransactions = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const items: RecentTransactionItem[] = [];

      // 1. Fetch sales from offline Dexie store
      const sales = await db.sales.where('business_id').equals(businessId).toArray();

      for (const s of sales) {
        const dateStr = s.created_at || new Date().toISOString();
        items.push({
          id: `sale_${s.id}`,
          type: 'sale',
          date: dateStr,
          displayDate: formatDisplayDate(dateStr),
          title: s.receipt_number ? `Sale #${s.receipt_number}` : 'Customer Sale Receipt',
          description: `Payment via ${s.payment_method || 'CASH'}`,
          amount: Number(s.total_amount || 0),
          isMonetary: true,
          isCredit: true,
          paymentMethod: s.payment_method || 'CASH',
          status: 'Completed',
          linkUrl: '/sales-history',
        });
      }

      // 2. Add Expenses
      for (const e of expenses) {
        const dateStr = e.created_at || e.expense_date || new Date().toISOString();
        items.push({
          id: `exp_${e.id}`,
          type: 'expense',
          date: dateStr,
          displayDate: formatDisplayDate(dateStr),
          title: e.description || 'Operational Expense',
          description: `Outflow via ${e.payment_method || 'CASH'}`,
          amount: Number(e.amount || 0),
          isMonetary: true,
          isCredit: false,
          paymentMethod: e.payment_method || 'CASH',
          status: 'Completed',
          linkUrl: '/expenses',
        });
      }

      // 3. Add Inventory Adjustments & Stock Events
      for (const t of invTransactions) {
        // Skip redundant Sales Deduction stock movements as they are already recorded under Sales receipts
        if (t.movement_type === 'Sales Deduction') continue;

        const dateStr = t.created_at || new Date().toISOString();
        const productName = productMap.get(t.product_id || '') || 'Inventory Item';
        const moveLabel = t.movement_type ? t.movement_type.replace(/_/g, ' ') : 'Adjustment';
        const qty = Number(t.quantity || 0);

        items.push({
          id: `inv_${t.id}`,
          type: 'inventory',
          date: dateStr,
          displayDate: formatDisplayDate(dateStr),
          title: `Stock ${moveLabel}: ${productName}`,
          description: t.remarks
            ? t.remarks
            : `Inventory quantity modification (${qty >= 0 ? '+' : ''}${qty} units)`,
          amount: Math.abs(qty),
          isMonetary: false,
          isCredit: qty >= 0,
          status: 'Adjusted',
          linkUrl: '/inventory',
        });
      }

      // Sort chronologically by date descending (newest first)
      items.sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

      setRawTransactions(items);
    } catch (err) {
      console.error('Failed to aggregate recent transactions:', err);
      setRawTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, expenses, invTransactions, productMap]);

  useEffect(() => {
    if (!isExpensesLoading && !isInvLoading) {
      const timer = setTimeout(() => {
        fetchAllTransactions();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isExpensesLoading, isInvLoading, fetchAllTransactions]);

  const filteredTransactions = useMemo(() => {
    const list =
      filter === 'all' ? rawTransactions : rawTransactions.filter((t) => t.type === filter);
    // Limit to maximum 10 records as specified in Epic 8 PRD
    return list.slice(0, 10);
  }, [rawTransactions, filter]);

  const summary = useMemo<RecentTransactionsSummary>(() => {
    let salesCount = 0;
    let expensesCount = 0;
    let inventoryCount = 0;

    for (const t of rawTransactions) {
      if (t.type === 'sale') salesCount++;
      else if (t.type === 'expense') expensesCount++;
      else if (t.type === 'inventory') inventoryCount++;
    }

    return {
      totalCount: rawTransactions.length,
      salesCount,
      expensesCount,
      inventoryCount,
    };
  }, [rawTransactions]);

  return {
    transactions: filteredTransactions,
    summary,
    isLoading: isLoading || isExpensesLoading || isInvLoading,
    filter,
    setFilter,
    refresh: fetchAllTransactions,
  };
};
