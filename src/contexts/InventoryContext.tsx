import { createContext } from 'react';
import type { InventoryContextType } from '../types/inventory';

export const InventoryContext = createContext<InventoryContextType>({
  products: [],
  categories: [],
  transactions: [],
  locations: [],
  restockBatches: [],
  itemUnits: [],
  isLoading: true,
  error: null,
  totalValuation: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  createCategory: async () => null,
  createProduct: async () => null,
  updateProduct: async () => false,
  archiveProduct: async () => false,
  recordStockAdjustment: async () => false,
  createRestockBatch: async () => false,
  voidRestockBatch: async () => false,
  voidItemUnit: async () => false,
  refreshInventory: async () => {},
});
