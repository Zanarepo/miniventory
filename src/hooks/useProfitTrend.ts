import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from './useBusiness';
import { useExpenses } from './useExpenses';
import { db } from '../lib/dexie';
import type { ProfitTrend } from '../types/dashboard';

export type ProfitGranularity = 'daily' | 'weekly' | 'monthly';

export interface ProfitTrendDataPoint extends ProfitTrend {
  label: string;
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  profitMargin: number;
}

export interface ProfitTrendSummary {
  totalNetProfit: number;
  totalRevenue: number;
  totalCOGS: number;
  totalExpenses: number;
  profitMargin: number;
  averageProfit: number;
  peakProfitAmount: number;
  peakPeriodLabel: string;
  isProfitPositive: boolean;
  hasActivity: boolean;
}

export interface UseProfitTrendReturn {
  trendData: ProfitTrendDataPoint[];
  summary: ProfitTrendSummary;
  isLoading: boolean;
  error: string | null;
  granularity: ProfitGranularity;
  setGranularity: (g: ProfitGranularity) => void;
  refresh: () => Promise<void>;
}

export function useProfitTrend(
  initialGranularity: ProfitGranularity = 'daily',
): UseProfitTrendReturn {
  const { business } = useBusiness();
  const { expenses, isLoading: isExpensesLoading, error: expensesError } = useExpenses();
  const [granularity, setGranularity] = useState<ProfitGranularity>(initialGranularity);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<ProfitTrendDataPoint[]>([]);
  const [summary, setSummary] = useState<ProfitTrendSummary>({
    totalNetProfit: 0,
    totalRevenue: 0,
    totalCOGS: 0,
    totalExpenses: 0,
    profitMargin: 0,
    averageProfit: 0,
    peakProfitAmount: 0,
    peakPeriodLabel: 'N/A',
    isProfitPositive: true,
    hasActivity: false,
  });

  const calculateProfitTrend = useCallback(async () => {
    const businessId = business?.id;
    if (!businessId || isExpensesLoading) {
      if (!isExpensesLoading) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allSales = await db.sales.where('business_id').equals(businessId).toArray();

      const allSaleItems = await db.saleItems.toArray();
      const activeExpenses = expenses.filter((e) => !e.deleted_at);

      // Pre-calculate COGS per sale ID using Sprint 5 formulas
      const saleCogsMap = new Map<string, number>();
      allSaleItems.forEach((si) => {
        const cogs = (Number(si.unit_cost) || 0) * (Number(si.quantity) || 0);
        saleCogsMap.set(si.sale_id, (saleCogsMap.get(si.sale_id) || 0) + cogs);
      });

      const dataPoints: ProfitTrendDataPoint[] = [];
      const now = new Date();

      if (granularity === 'daily') {
        const daysCount = 14;
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          const daySales = allSales.filter((s) => (s.created_at || '').split('T')[0] === dateStr);
          const dayExps = activeExpenses.filter((e) => e.expense_date === dateStr);

          const revenue = daySales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
          const cogs = daySales.reduce((sum, s) => sum + (saleCogsMap.get(s.id) || 0), 0);
          const opExpenses = dayExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

          const grossProfit = revenue - cogs;
          const netProfit = grossProfit - opExpenses;
          const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

          dataPoints.push({
            date: dateStr,
            label,
            profit: netProfit,
            revenue,
            cogs,
            expenses: opExpenses,
            grossProfit,
            profitMargin: margin,
          });
        }
      } else if (granularity === 'weekly') {
        const weeksCount = 8;
        for (let i = weeksCount - 1; i >= 0; i--) {
          const endDate = new Date(now);
          endDate.setDate(now.getDate() - i * 7);
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 6);

          const startStr = startDate.toISOString().split('T')[0];
          const endStr = endDate.toISOString().split('T')[0];
          const startLabel = startDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          const weekSales = allSales.filter((s) => {
            const sd = (s.created_at || '').split('T')[0];
            return sd >= startStr && sd <= endStr;
          });
          const weekExps = activeExpenses.filter((e) => {
            const ed = e.expense_date || '';
            return ed >= startStr && ed <= endStr;
          });

          const revenue = weekSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
          const cogs = weekSales.reduce((sum, s) => sum + (saleCogsMap.get(s.id) || 0), 0);
          const opExpenses = weekExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

          const grossProfit = revenue - cogs;
          const netProfit = grossProfit - opExpenses;
          const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

          dataPoints.push({
            date: startStr,
            label: i === 0 ? 'This Week' : startLabel,
            profit: netProfit,
            revenue,
            cogs,
            expenses: opExpenses,
            grossProfit,
            profitMargin: margin,
          });
        }
      } else {
        const monthsCount = 6;
        for (let i = monthsCount - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const monthPrefix = `${year}-${month}`;
          const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });

          const monthSales = allSales.filter((s) => (s.created_at || '').startsWith(monthPrefix));
          const monthExps = activeExpenses.filter((e) =>
            (e.expense_date || '').startsWith(monthPrefix),
          );

          const revenue = monthSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
          const cogs = monthSales.reduce((sum, s) => sum + (saleCogsMap.get(s.id) || 0), 0);
          const opExpenses = monthExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

          const grossProfit = revenue - cogs;
          const netProfit = grossProfit - opExpenses;
          const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

          dataPoints.push({
            date: monthPrefix,
            label,
            profit: netProfit,
            revenue,
            cogs,
            expenses: opExpenses,
            grossProfit,
            profitMargin: margin,
          });
        }
      }

      // Calculate overarching summary metrics
      let totalNetProfit = 0;
      let totalRevenue = 0;
      let totalCOGS = 0;
      let totalExpenses = 0;
      let peakProfitAmount = -Infinity;
      let peakPeriodLabel = 'N/A';
      let hasActivity = false;

      dataPoints.forEach((p) => {
        totalNetProfit += p.profit;
        totalRevenue += p.revenue;
        totalCOGS += p.cogs;
        totalExpenses += p.expenses;

        if (p.revenue > 0 || p.expenses > 0 || p.cogs > 0) {
          hasActivity = true;
        }

        if (p.profit > peakProfitAmount && (p.revenue > 0 || p.profit !== 0)) {
          peakProfitAmount = p.profit;
          peakPeriodLabel = p.label;
        }
      });

      const averageProfit = dataPoints.length > 0 ? totalNetProfit / dataPoints.length : 0;
      const profitMargin = totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100) : 0;
      const isProfitPositive = totalNetProfit >= 0;

      if (!hasActivity) {
        peakProfitAmount = 0;
        peakPeriodLabel = 'No activity yet';
      }

      setTrendData(dataPoints);
      setSummary({
        totalNetProfit,
        totalRevenue,
        totalCOGS,
        totalExpenses,
        profitMargin,
        averageProfit,
        peakProfitAmount: peakProfitAmount === -Infinity ? 0 : peakProfitAmount,
        peakPeriodLabel,
        isProfitPositive,
        hasActivity,
      });
    } catch (err) {
      console.error('Error computing profit trend analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate profit trend data');
    } finally {
      setIsLoading(false);
    }
  }, [business?.id, expenses, isExpensesLoading, granularity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateProfitTrend();
    }, 0);
    return () => clearTimeout(timer);
  }, [calculateProfitTrend]);

  return {
    trendData,
    summary,
    isLoading: isLoading || isExpensesLoading,
    error: error || expensesError,
    granularity,
    setGranularity,
    refresh: calculateProfitTrend,
  };
}
