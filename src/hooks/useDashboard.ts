import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from './useBusiness';
import { useInventory } from './useInventory';
import { useExpenses } from './useExpenses';
import { useFinancials } from './useFinancials';
import { db } from '../lib/dexie';
import type { DashboardKPIs } from '../types/dashboard';

export const useDashboard = () => {
  const { business } = useBusiness();
  const { products, totalValuation } = useInventory();
  const { expenses } = useExpenses();
  const { health } = useFinancials();

  const businessId = business?.id;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<DashboardKPIs>({
    todaySales: 0,
    todayExpenses: 0,
    todayProfit: 0,
    cashPosition: 0,
    inventoryValue: 0,
    activeProducts: 0,
    comparisonPeriod: 'Yesterday',
    todaySalesChangePerc: 0,
    todayExpensesChangePerc: 0,
    todayProfitChangePerc: 0,
    cashIn: 0,
    cashOut: 0,
    isSalesUp: true,
    isExpensesUp: false,
    isProfitUp: true,
  });

  const refreshDashboard = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // 1. Fetch sales and sale items from local offline Dexie database
      const allSales = await db.sales.where('business_id').equals(businessId).toArray();

      const allSaleItems = await db.saleItems.toArray();

      // 2. Filter today and yesterday sales
      const todaySalesList = allSales.filter(
        (s) => (s.created_at || '').split('T')[0] === todayStr,
      );
      const yesterdaySalesList = allSales.filter(
        (s) => (s.created_at || '').split('T')[0] === yesterdayStr,
      );

      const todaySaleIds = new Set(todaySalesList.map((s) => s.id));
      const yesterdaySaleIds = new Set(yesterdaySalesList.map((s) => s.id));

      const todaySaleItems = allSaleItems.filter((si) => todaySaleIds.has(si.sale_id));
      const yesterdaySaleItems = allSaleItems.filter((si) => yesterdaySaleIds.has(si.sale_id));

      // 3. Compute Today's Metrics
      const todaySales = todaySalesList.reduce((sum, s) => sum + Number(s.total_amount), 0);
      const todayCOGS = todaySaleItems.reduce(
        (sum, si) => sum + Number(si.unit_cost) * Number(si.quantity),
        0,
      );
      const todayGrossProfit = todaySales - todayCOGS;

      const todayExpensesList = expenses.filter(
        (e) => !e.deleted_at && e.expense_date === todayStr,
      );
      const todayExpenses = todayExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);
      const todayProfit = todayGrossProfit - todayExpenses;

      // 4. Compute Yesterday's Metrics for comparison
      const yesterdaySales = yesterdaySalesList.reduce((sum, s) => sum + Number(s.total_amount), 0);
      const yesterdayCOGS = yesterdaySaleItems.reduce(
        (sum, si) => sum + Number(si.unit_cost) * Number(si.quantity),
        0,
      );
      const yesterdayGrossProfit = yesterdaySales - yesterdayCOGS;

      const yesterdayExpensesList = expenses.filter(
        (e) => !e.deleted_at && e.expense_date === yesterdayStr,
      );
      const yesterdayExpenses = yesterdayExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);
      const yesterdayProfit = yesterdayGrossProfit - yesterdayExpenses;

      // 5. Calculate Percentage Changes
      const calcPercentageChange = (current: number, previous: number): number => {
        if (previous === 0) {
          return current > 0 ? 100 : current < 0 ? -100 : 0;
        }
        return Math.round(((current - previous) / Math.abs(previous)) * 100);
      };

      const todaySalesChangePerc = calcPercentageChange(todaySales, yesterdaySales);
      const todayExpensesChangePerc = calcPercentageChange(todayExpenses, yesterdayExpenses);
      const todayProfitChangePerc = calcPercentageChange(todayProfit, yesterdayProfit);

      // 6. Compute Cash Position (Total Cash Available, plus Today's Cash In / Out)
      const allCashSales = allSales
        .filter((s) => s.payment_method === 'CASH')
        .reduce((sum, s) => sum + Number(s.total_amount), 0);

      const allCashExpenses = expenses
        .filter((e) => !e.deleted_at && e.payment_method === 'CASH')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const cashPosition = allCashSales - allCashExpenses;

      const cashIn = todaySalesList
        .filter((s) => s.payment_method === 'CASH')
        .reduce((sum, s) => sum + Number(s.total_amount), 0);

      const cashOut = todayExpensesList
        .filter((e) => e.payment_method === 'CASH')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      // 7. Assemble final KPIs
      setKpis({
        todaySales,
        todayExpenses,
        todayProfit,
        cashPosition,
        inventoryValue: totalValuation || 0,
        activeProducts: products.length || 0,
        comparisonPeriod: 'Yesterday',
        todaySalesChangePerc,
        todayExpensesChangePerc,
        todayProfitChangePerc,
        cashIn,
        cashOut,
        isSalesUp: todaySalesChangePerc >= 0,
        isExpensesUp: todayExpensesChangePerc > 0,
        isProfitUp: todayProfitChangePerc >= 0,
      });
    } catch (err) {
      console.error('Failed to compute dashboard KPIs:', err);
      const msg = err instanceof Error ? err.message : 'Error computing dashboard KPIs';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, expenses, products.length, totalValuation]);

  // Reactive auto-refresh when inventory or expenses update
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshDashboard]);

  return {
    kpis,
    health,
    isLoading,
    error,
    refreshDashboard,
    hasData: kpis.todaySales > 0 || kpis.activeProducts > 0 || expenses.length > 0,
  };
};
