import { useState, useEffect, useCallback, useMemo } from 'react';
import { useExpenses } from './useExpenses';
import type { ExpenseTrend } from '../types/dashboard';

export type ExpenseGranularity = 'daily' | 'weekly' | 'monthly';

export interface ExpenseTrendDataPoint extends ExpenseTrend {
  label: string;
  transactionCount: number;
  topCategoryName: string;
}

export interface ExpenseTrendSummary {
  totalExpenses: number;
  periodAverage: number;
  peakExpenseAmount: number;
  peakPeriodLabel: string;
  topOverallCategory: string;
  changePercentage: number;
  isReduced: boolean; // True if spending in 2nd half is lower or equal to 1st half
}

export interface UseExpenseTrendReturn {
  trendData: ExpenseTrendDataPoint[];
  summary: ExpenseTrendSummary;
  isLoading: boolean;
  error: string | null;
  granularity: ExpenseGranularity;
  setGranularity: (g: ExpenseGranularity) => void;
}

export function useExpenseTrend(
  initialGranularity: ExpenseGranularity = 'daily',
): UseExpenseTrendReturn {
  const {
    expenses,
    categories,
    isLoading: isExpensesLoading,
    error: expensesError,
  } = useExpenses();
  const [granularity, setGranularity] = useState<ExpenseGranularity>(initialGranularity);
  const [trendData, setTrendData] = useState<ExpenseTrendDataPoint[]>([]);
  const [summary, setSummary] = useState<ExpenseTrendSummary>({
    totalExpenses: 0,
    periodAverage: 0,
    peakExpenseAmount: 0,
    peakPeriodLabel: 'N/A',
    topOverallCategory: 'None',
    changePercentage: 0,
    isReduced: true,
  });

  // Map category ID to Category Name
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [categories]);

  const calculateExpenseTrend = useCallback(() => {
    if (isExpensesLoading) return;

    const activeExpenses = expenses.filter((e) => !e.deleted_at);
    const dataPoints: ExpenseTrendDataPoint[] = [];
    const now = new Date();

    if (granularity === 'daily') {
      // Last 14 days for optimal Bar Chart readability
      const daysCount = 14;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const dayExps = activeExpenses.filter((e) => e.expense_date === dateStr);
        let daySum = 0;
        const catTally = new Map<string, number>();

        dayExps.forEach((e) => {
          const amt = Number(e.amount) || 0;
          daySum += amt;
          const catName = (e.category_id ? categoryMap.get(e.category_id) : undefined) || 'General';
          catTally.set(catName, (catTally.get(catName) || 0) + amt);
        });

        let topCat = 'None';
        let topCatAmt = -1;
        catTally.forEach((amt, name) => {
          if (amt > topCatAmt) {
            topCat = name;
            topCatAmt = amt;
          }
        });

        dataPoints.push({
          date: dateStr,
          label,
          amount: daySum,
          category: topCat !== 'None' ? topCat : undefined,
          transactionCount: dayExps.length,
          topCategoryName: topCat,
        });
      }
    } else if (granularity === 'weekly') {
      // Last 8 consecutive 7-day intervals backward from today
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

        const weekExps = activeExpenses.filter((e) => {
          const ed = e.expense_date || '';
          return ed >= startStr && ed <= endStr;
        });

        let weekSum = 0;
        const catTally = new Map<string, number>();
        weekExps.forEach((e) => {
          const amt = Number(e.amount) || 0;
          weekSum += amt;
          const catName = (e.category_id ? categoryMap.get(e.category_id) : undefined) || 'General';
          catTally.set(catName, (catTally.get(catName) || 0) + amt);
        });

        let topCat = 'None';
        let topCatAmt = -1;
        catTally.forEach((amt, name) => {
          if (amt > topCatAmt) {
            topCat = name;
            topCatAmt = amt;
          }
        });

        dataPoints.push({
          date: startStr,
          label: i === 0 ? 'This Week' : startLabel,
          amount: weekSum,
          category: topCat !== 'None' ? topCat : undefined,
          transactionCount: weekExps.length,
          topCategoryName: topCat,
        });
      }
    } else {
      // Monthly granularity: Last 6 calendar months
      const monthsCount = 6;
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${year}-${month}`;
        const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });

        const monthExps = activeExpenses.filter((e) =>
          (e.expense_date || '').startsWith(monthPrefix),
        );

        let monthSum = 0;
        const catTally = new Map<string, number>();
        monthExps.forEach((e) => {
          const amt = Number(e.amount) || 0;
          monthSum += amt;
          const catName = (e.category_id ? categoryMap.get(e.category_id) : undefined) || 'General';
          catTally.set(catName, (catTally.get(catName) || 0) + amt);
        });

        let topCat = 'None';
        let topCatAmt = -1;
        catTally.forEach((amt, name) => {
          if (amt > topCatAmt) {
            topCat = name;
            topCatAmt = amt;
          }
        });

        dataPoints.push({
          date: monthPrefix,
          label,
          amount: monthSum,
          category: topCat !== 'None' ? topCat : undefined,
          transactionCount: monthExps.length,
          topCategoryName: topCat,
        });
      }
    }

    // Compute Summary metrics across the selected timeframe
    let totalExpenses = 0;
    let peakExpenseAmount = 0;
    let peakPeriodLabel = 'N/A';
    const overallCatTally = new Map<string, number>();

    dataPoints.forEach((p) => {
      totalExpenses += p.amount;
      if (p.amount >= peakExpenseAmount && p.amount > 0) {
        peakExpenseAmount = p.amount;
        peakPeriodLabel = p.label;
      }
      if (p.topCategoryName && p.topCategoryName !== 'None') {
        overallCatTally.set(
          p.topCategoryName,
          (overallCatTally.get(p.topCategoryName) || 0) + p.amount,
        );
      }
    });

    const periodAverage = dataPoints.length > 0 ? totalExpenses / dataPoints.length : 0;

    let topOverallCategory = 'None';
    let maxCatVal = -1;
    overallCatTally.forEach((val, cat) => {
      if (val > maxCatVal && val > 0) {
        maxCatVal = val;
        topOverallCategory = cat;
      }
    });

    // Trend direction comparison (First half vs Second half of the period)
    const midPoint = Math.floor(dataPoints.length / 2);
    const firstHalfSum = dataPoints.slice(0, midPoint).reduce((s, p) => s + p.amount, 0);
    const secondHalfSum = dataPoints.slice(midPoint).reduce((s, p) => s + p.amount, 0);

    let changePercentage = 0;
    if (firstHalfSum > 0) {
      changePercentage = Math.round(((secondHalfSum - firstHalfSum) / firstHalfSum) * 100);
    } else if (secondHalfSum > 0) {
      changePercentage = 100;
    }

    setTrendData(dataPoints);
    setSummary({
      totalExpenses,
      periodAverage,
      peakExpenseAmount,
      peakPeriodLabel: peakExpenseAmount > 0 ? peakPeriodLabel : 'No expenses yet',
      topOverallCategory: totalExpenses > 0 ? topOverallCategory : 'None recorded',
      changePercentage,
      isReduced: changePercentage <= 0,
    });
  }, [expenses, categoryMap, isExpensesLoading, granularity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateExpenseTrend();
    }, 0);
    return () => clearTimeout(timer);
  }, [calculateExpenseTrend]);

  return {
    trendData,
    summary,
    isLoading: isExpensesLoading,
    error: expensesError,
    granularity,
    setGranularity,
  };
}
