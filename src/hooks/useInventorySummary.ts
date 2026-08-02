import { useMemo } from 'react';
import { useInventory } from './useInventory';
import type { InventorySummary } from '../types/dashboard';

export interface DashboardInventorySummary extends InventorySummary {
  availableProducts: number;
  totalUnitsInStock: number;
  healthyPercentage: number;
  lowStockPercentage: number;
  outOfStockPercentage: number;
  hasProducts: boolean;
}

export interface UseInventorySummaryReturn {
  summary: DashboardInventorySummary;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInventorySummary(): UseInventorySummaryReturn {
  const {
    products,
    isLoading,
    error,
    totalValuation,
    lowStockCount,
    outOfStockCount,
    refreshInventory,
  } = useInventory();

  const summary = useMemo<DashboardInventorySummary>(() => {
    const activeProducts = products.filter((p) => p.is_active !== false);
    const totalCount = activeProducts.length;
    const available = activeProducts.filter((p) => (Number(p.current_stock) || 0) > 0).length;
    const totalUnits = activeProducts.reduce(
      (sum, p) => sum + Math.max(Number(p.current_stock) || 0, 0),
      0,
    );

    let healthyPerc = 0;
    let lowPerc = 0;
    let outPerc = 0;

    if (totalCount > 0) {
      // Healthy stock items are active items that are neither zero nor below minimum threshold
      const outCount = outOfStockCount;
      const lowCount = lowStockCount;
      const healthyCount = Math.max(totalCount - outCount - lowCount, 0);

      healthyPerc = Math.round((healthyCount / totalCount) * 100);
      lowPerc = Math.round((lowCount / totalCount) * 100);
      // Ensure percentages balance cleanly to 100% when products exist
      outPerc = Math.max(100 - healthyPerc - lowPerc, 0);
    }

    return {
      products: totalCount,
      availableProducts: available,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      inventoryValue: totalValuation,
      totalUnitsInStock: totalUnits,
      healthyPercentage: healthyPerc,
      lowStockPercentage: lowPerc,
      outOfStockPercentage: outPerc,
      hasProducts: totalCount > 0,
    };
  }, [products, totalValuation, lowStockCount, outOfStockCount]);

  return {
    summary,
    isLoading,
    error,
    refresh: refreshInventory,
  };
}
