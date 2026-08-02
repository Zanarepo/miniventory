import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { useInventory } from '../hooks/useInventory';
import { useExpenses } from '../hooks/useExpenses';
import { db } from '../lib/dexie';
import { FinancialContext } from '../contexts/FinancialContext';
import type { FinancialSummary, BusinessHealth, PeriodSelection } from '../types/financials';

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useBusiness();
  const { products, totalValuation, outOfStockCount } = useInventory();
  const { expenses } = useExpenses();

  const businessId = business?.id;

  const [period, setPeriod] = useState<PeriodSelection>('THIS_MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [summary, setSummary] = useState<FinancialSummary>({
    revenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
    cashPosition: 0,
    inventoryValue: 0,
  });

  const [health, setHealth] = useState<BusinessHealth>({
    score: 100,
    rating: 'Excellent',
    evaluatedAt: new Date().toISOString(),
  });

  // Calculate Dates based on PeriodSelection
  const calculateDates = useCallback((p: PeriodSelection) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (p) {
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
        // Keep current values, let the user define it
        break;
    }
  }, []);

  // Set standard dates when period selection changes
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateDates(period);
    }, 0);
    return () => clearTimeout(timer);
  }, [period, calculateDates]);

  // Main Calculation Engine
  const refreshFinancials = useCallback(async () => {
    if (!businessId || !startDate || !endDate) return;

    setIsLoading(true);
    try {
      // 1. Fetch Sales and SaleItems from Dexie
      const localSales = await db.sales.where('business_id').equals(businessId).toArray();

      const localSaleItems = await db.saleItems.toArray();

      // 2. Filter sales within target date range
      const salesInRange = localSales.filter((s) => {
        const saleDate = (s.created_at || '').split('T')[0];
        return saleDate >= startDate && saleDate <= endDate;
      });

      const saleIds = new Set(salesInRange.map((s) => s.id));
      const saleItemsInRange = localSaleItems.filter((si) => saleIds.has(si.sale_id));

      // 3. Compute Metrics
      const revenue = salesInRange.reduce((sum, s) => sum + Number(s.total_amount), 0);
      const costOfGoodsSold = saleItemsInRange.reduce(
        (sum, si) => sum + Number(si.unit_cost) * Number(si.quantity),
        0,
      );
      const grossProfit = revenue - costOfGoodsSold;

      // 4. Compute Expenses
      const expensesInRange = expenses.filter(
        (e) => !e.deleted_at && e.expense_date >= startDate && e.expense_date <= endDate,
      );
      const expensesSum = expensesInRange.reduce((sum, e) => sum + Number(e.amount), 0);
      const netProfit = grossProfit - expensesSum;

      // 5. Cash Position (Cash Sales - Cash Expenses)
      const cashSales = salesInRange
        .filter((s) => s.payment_method === 'CASH')
        .reduce((sum, s) => sum + Number(s.total_amount), 0);

      const cashExpenses = expensesInRange
        .filter((e) => e.payment_method === 'CASH')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const cashPosition = cashSales - cashExpenses;

      // 6. Calculate Business Health Score
      // Profitability score (35 points max)
      let profitabilityPoints = 20;
      if (revenue > 0) {
        const netMargin = netProfit / revenue;
        if (netMargin >= 0.2) profitabilityPoints = 35;
        else if (netMargin > 0) profitabilityPoints = Math.round((netMargin / 0.2) * 35);
        else profitabilityPoints = 5;
      }

      // Expense control score (20 points max)
      let expensePoints = 15;
      if (revenue > 0) {
        const expRatio = expensesSum / revenue;
        if (expRatio <= 0.25) expensePoints = 20;
        else if (expRatio <= 0.6) expensePoints = Math.round((1 - (expRatio - 0.25) / 0.35) * 20);
        else expensePoints = 5;
      } else if (expensesSum > 0) {
        expensePoints = 5;
      }

      // Inventory health score (20 points max)
      let inventoryPoints = 20;
      if (products.length > 0) {
        const stockRatio = (products.length - outOfStockCount) / products.length;
        inventoryPoints = Math.round(stockRatio * 20);
      }

      // Revenue growth / activity (15 points max)
      const growthPoints = revenue > 0 ? 15 : 5;

      // Cash position health (10 points max)
      const cashPoints = cashPosition >= 0 ? 10 : 0;

      const totalScore = Math.min(
        100,
        Math.max(
          0,
          profitabilityPoints + expensePoints + inventoryPoints + growthPoints + cashPoints,
        ),
      );

      let rating: 'Excellent' | 'Healthy' | 'Stable' | 'At Risk' | 'Critical' = 'Stable';
      if (totalScore >= 90) rating = 'Excellent';
      else if (totalScore >= 75) rating = 'Healthy';
      else if (totalScore >= 60) rating = 'Stable';
      else if (totalScore >= 40) rating = 'At Risk';
      else rating = 'Critical';

      setSummary({
        revenue,
        costOfGoodsSold,
        grossProfit,
        expenses: expensesSum,
        netProfit,
        cashPosition,
        inventoryValue: totalValuation,
      });

      setHealth({
        score: totalScore,
        rating,
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to compute financials:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, startDate, endDate, expenses, products.length, outOfStockCount, totalValuation]);

  // Trigger recalculations dynamically when dependencies update
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshFinancials();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshFinancials]);

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPeriod('CUSTOM');
  };

  const contextValue = useMemo(
    () => ({
      summary,
      health,
      period,
      startDate,
      endDate,
      isLoading,
      setPeriod,
      setDateRange,
      refreshFinancials,
    }),
    [summary, health, period, startDate, endDate, isLoading, refreshFinancials],
  );

  return <FinancialContext.Provider value={contextValue}>{children}</FinancialContext.Provider>;
};
