import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from './useBusiness';
import { useInventory } from './useInventory';
import { db } from '../lib/dexie';

export type TopSellingSortBy = 'revenue' | 'units' | 'profit';

export interface BestsellerProductItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  categoryName: string;
  unitsSold: number;
  unit: string;
  revenue: number;
  profit: number;
  marginPercent: number;
  rank: number;
}

export interface TopSellingSummary {
  totalTopRevenue: number;
  totalTopUnits: number;
  totalTopProfit: number;
  timeframeDays: number;
}

export const useTopSellingProducts = (initialDays: number = 30) => {
  const { business } = useBusiness();
  const { products, isLoading: isInventoryLoading } = useInventory();
  const businessId = business?.id;

  const [days, setDays] = useState<number>(initialDays);
  const [sortBy, setSortBy] = useState<TopSellingSortBy>('revenue');
  const [items, setItems] = useState<BestsellerProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const productMap = useMemo(() => {
    const map = new Map<string, { name: string; sku?: string; category: string; unit: string }>();
    for (const p of products) {
      map.set(p.id, {
        name: p.product_name,
        sku: p.sku,
        category: p.category_name || 'General',
        unit: p.unit || 'pcs',
      });
    }
    return map;
  }, [products]);

  const fetchTopProducts = useCallback(async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - days);

      const allSales = await db.sales.where('business_id').equals(businessId).toArray();

      const filteredSales = allSales.filter((s) => {
        if (!s.created_at) return false;
        const saleDate = new Date(s.created_at);
        return saleDate >= cutoff && saleDate <= now;
      });

      const validSaleIds = new Set(filteredSales.map((s) => s.id));
      if (validSaleIds.size === 0) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      const allSaleItems = await db.saleItems.toArray();
      const relevantItems = allSaleItems.filter((si) => validSaleIds.has(si.sale_id));

      const aggregated = new Map<string, { units: number; revenue: number; profit: number }>();

      for (const si of relevantItems) {
        const pId = si.product_id || 'unknown';
        const qty = Number(si.quantity || 0);
        const rev = Number(si.line_total ?? si.selling_price * qty);
        const prof = Number(si.line_profit ?? (si.selling_price - si.unit_cost) * qty);

        const existing = aggregated.get(pId) || { units: 0, revenue: 0, profit: 0 };
        existing.units += qty;
        existing.revenue += rev;
        existing.profit += prof;
        aggregated.set(pId, existing);
      }

      const rawList: BestsellerProductItem[] = [];
      for (const [productId, stats] of aggregated.entries()) {
        const meta = productMap.get(productId) || {
          name: `Product (${productId.slice(0, 6)}...)`,
          category: 'Archived / General',
          unit: 'pcs',
        };

        const marginPercent = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0;

        rawList.push({
          id: productId,
          productId,
          productName: meta.name,
          sku: meta.sku,
          categoryName: meta.category,
          unit: meta.unit,
          unitsSold: stats.units,
          revenue: stats.revenue,
          profit: stats.profit,
          marginPercent,
          rank: 0,
        });
      }

      // Sort according to active sort option
      rawList.sort((a, b) => {
        if (sortBy === 'units') return b.unitsSold - a.unitsSold;
        if (sortBy === 'profit') return b.profit - a.profit;
        return b.revenue - a.revenue;
      });

      // Top 10 Slice with assigned ranks
      const top10 = rawList.slice(0, 10).map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setItems(top10);
    } catch (err) {
      console.error('Failed to aggregate top selling products:', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, days, sortBy, productMap]);

  useEffect(() => {
    if (!isInventoryLoading) {
      const timer = setTimeout(() => {
        fetchTopProducts();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isInventoryLoading, fetchTopProducts]);

  const summary = useMemo<TopSellingSummary>(() => {
    let totalTopRevenue = 0;
    let totalTopUnits = 0;
    let totalTopProfit = 0;

    for (const item of items) {
      totalTopRevenue += item.revenue;
      totalTopUnits += item.unitsSold;
      totalTopProfit += item.profit;
    }

    return {
      totalTopRevenue,
      totalTopUnits,
      totalTopProfit,
      timeframeDays: days,
    };
  }, [items, days]);

  return {
    topProducts: items,
    summary,
    isLoading: isLoading || isInventoryLoading,
    days,
    setDays,
    sortBy,
    setSortBy,
    refresh: fetchTopProducts,
  };
};
