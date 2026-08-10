import { useMemo } from 'react';
import type {
  ProductCategory,
  Product,
  InventoryTransaction,
  ProductWithStock,
  ItemUnit,
} from '../../types/inventory';

export const useInventoryMetrics = (
  productsRaw: Product[],
  categories: ProductCategory[],
  transactions: InventoryTransaction[],
  itemUnits: ItemUnit[],
) => {
  // Compute live stock levels and valuations directly from immutable inventory transactions
  const products: ProductWithStock[] = useMemo(() => {
    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.id, c.name));

    const stockMap = new Map<string, number>();
    transactions.forEach((tx) => {
      const current = stockMap.get(tx.product_id) || 0;
      stockMap.set(tx.product_id, current + Number(tx.quantity));
    });

    return productsRaw.map((p) => {
      let currentStock: number;
      if (p.is_serialized) {
        currentStock = itemUnits.filter(
          (u) => u.product_id === p.id && u.status === 'AVAILABLE',
        ).length;
      } else {
        currentStock = stockMap.get(p.id) || 0;
      }

      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (currentStock <= 0) {
        stockStatus = 'out_of_stock';
      } else if (currentStock <= p.minimum_stock) {
        stockStatus = 'low_stock';
      }
      const valuation = currentStock > 0 ? Number(currentStock) * Number(p.cost_price) : 0;

      return {
        ...p,
        current_stock: currentStock,
        category_name: p.category_id
          ? categoryMap.get(p.category_id) || 'Uncategorized'
          : 'Uncategorized',
        stock_status: stockStatus,
        valuation,
      };
    });
  }, [productsRaw, categories, transactions, itemUnits]);

  // Total calculated metrics
  const totalValuation = useMemo(
    () => products.reduce((acc, p) => acc + p.valuation, 0),
    [products],
  );
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock_status === 'low_stock').length,
    [products],
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock_status === 'out_of_stock').length,
    [products],
  );

  return {
    products,
    totalValuation,
    lowStockCount,
    outOfStockCount,
  };
};
