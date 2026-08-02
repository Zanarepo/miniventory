import { useMemo } from 'react';
import { useInventory } from './useInventory';
import type { ProductWithStock } from '../types/inventory';

export type AlertSeverity = 'red' | 'yellow' | 'green';

export interface LowStockAlertItem {
  id: string;
  productName: string;
  sku?: string;
  categoryName?: string;
  remainingQuantity: number;
  minimumQuantity: number;
  unit: string;
  severity: AlertSeverity;
  statusText: string;
  rawProduct: ProductWithStock;
}

export interface LowStockAlertsSummary {
  totalAlerts: number; // Red + Yellow items requiring action
  redCount: number;
  yellowCount: number;
  greenCount: number;
}

export const useLowStockAlerts = () => {
  const { products, isLoading, error } = useInventory();

  const alerts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    const mapItem = (p: ProductWithStock): LowStockAlertItem => {
      const current = p.current_stock ?? 0;
      const min = p.minimum_stock ?? 5;
      const unit = p.unit || 'units';

      let severity: AlertSeverity = 'green';
      let statusText = 'In Stock (Optimal)';

      if (current <= 0) {
        severity = 'red';
        statusText = 'Out of Stock';
      } else if (current <= min) {
        severity = 'yellow';
        statusText = 'Low Stock (Reorder)';
      }

      return {
        id: p.id,
        productName: p.product_name,
        sku: p.sku,
        categoryName: p.category_name || 'General',
        remainingQuantity: current,
        minimumQuantity: min,
        unit,
        severity,
        statusText,
        rawProduct: p,
      };
    };

    const items = products.map(mapItem);

    // Sort priority: Critical out-of-stock first, low-stock warnings second, healthy items last.
    const getSeverityWeight = (s: AlertSeverity) => {
      if (s === 'red') return 0;
      if (s === 'yellow') return 1;
      return 2;
    };

    return items.sort((a, b) => {
      const weightDiff = getSeverityWeight(a.severity) - getSeverityWeight(b.severity);
      if (weightDiff !== 0) return weightDiff;
      return a.remainingQuantity - b.remainingQuantity;
    });
  }, [products]);

  const summary = useMemo<LowStockAlertsSummary>(() => {
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    for (const item of alerts) {
      if (item.severity === 'red') redCount++;
      else if (item.severity === 'yellow') yellowCount++;
      else greenCount++;
    }

    return {
      totalAlerts: redCount + yellowCount,
      redCount,
      yellowCount,
      greenCount,
    };
  }, [alerts]);

  return {
    alerts,
    summary,
    isLoading,
    error,
    hasData: products.length > 0,
  };
};
