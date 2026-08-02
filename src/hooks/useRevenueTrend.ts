import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/dexie';
import { useBusiness } from './useBusiness';
import type { RevenueTrend } from '../types/dashboard';

export interface RevenueTrendDataPoint extends RevenueTrend {
  label: string;
  transactionCount: number;
}

export interface RevenueTrendSummary {
  totalRevenue: number;
  averageDailyRevenue: number;
  peakRevenue: number;
  peakDateLabel: string;
  growthPercentage: number;
  isPositiveGrowth: boolean;
}

export interface UseRevenueTrendReturn {
  trendData: RevenueTrendDataPoint[];
  summary: RevenueTrendSummary;
  isLoading: boolean;
  error: string | null;
  refreshTrend: () => void;
}

export function useRevenueTrend(days: number = 30): UseRevenueTrendReturn {
  const { business } = useBusiness();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<RevenueTrendDataPoint[]>([]);
  const [summary, setSummary] = useState<RevenueTrendSummary>({
    totalRevenue: 0,
    averageDailyRevenue: 0,
    peakRevenue: 0,
    peakDateLabel: 'N/A',
    growthPercentage: 0,
    isPositiveGrowth: true,
  });

  const businessId = business?.id;

  const calculateTrend = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate date sequence for the last N days
      const datesList: { dateStr: string; label: string }[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        datesList.push({ dateStr, label });
      }

      const earliestDate = datesList[0].dateStr;
      const latestDate = datesList[datesList.length - 1].dateStr;

      // 2. Fetch sales from offline Dexie store for this business
      const allSales = await db.sales.where('business_id').equals(businessId).toArray();

      // 3. Filter sales within the date range and map by day
      const revenueMap = new Map<string, { amount: number; count: number }>();

      allSales.forEach((sale) => {
        const saleDate = (sale.created_at || '').split('T')[0];
        if (saleDate >= earliestDate && saleDate <= latestDate) {
          const current = revenueMap.get(saleDate) || { amount: 0, count: 0 };
          revenueMap.set(saleDate, {
            amount: current.amount + Number(sale.total_amount),
            count: current.count + 1,
          });
        }
      });

      // 4. Build complete continuous data series
      const dataPoints: RevenueTrendDataPoint[] = datesList.map(({ dateStr, label }) => {
        const daily = revenueMap.get(dateStr) || { amount: 0, count: 0 };
        return {
          date: dateStr,
          label,
          revenue: daily.amount,
          transactionCount: daily.count,
        };
      });

      // 5. Compute summary statistics
      let totalRevenue = 0;
      let peakRevenue = 0;
      let peakDateLabel = 'N/A';

      dataPoints.forEach((p) => {
        totalRevenue += p.revenue;
        if (p.revenue >= peakRevenue && p.revenue > 0) {
          peakRevenue = p.revenue;
          peakDateLabel = p.label;
        }
      });

      const averageDailyRevenue = days > 0 ? totalRevenue / days : 0;

      // Calculate growth: first half vs second half of the requested timeframe
      const midPoint = Math.floor(dataPoints.length / 2);
      const firstHalfSum = dataPoints.slice(0, midPoint).reduce((s, p) => s + p.revenue, 0);
      const secondHalfSum = dataPoints.slice(midPoint).reduce((s, p) => s + p.revenue, 0);

      let growthPercentage = 0;
      if (firstHalfSum > 0) {
        growthPercentage = Math.round(((secondHalfSum - firstHalfSum) / firstHalfSum) * 100);
      } else if (secondHalfSum > 0) {
        growthPercentage = 100; // jumped from zero to active sales
      }

      setTrendData(dataPoints);
      setSummary({
        totalRevenue,
        averageDailyRevenue,
        peakRevenue,
        peakDateLabel: peakRevenue > 0 ? peakDateLabel : 'No sales yet',
        growthPercentage,
        isPositiveGrowth: growthPercentage >= 0,
      });
    } catch (err) {
      console.error('Failed to calculate revenue trend:', err);
      const msg = err instanceof Error ? err.message : 'Error calculating revenue trend';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, days]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateTrend();
    }, 0);
    return () => clearTimeout(timer);
  }, [calculateTrend]);

  return {
    trendData,
    summary,
    isLoading,
    error,
    refreshTrend: calculateTrend,
  };
}
