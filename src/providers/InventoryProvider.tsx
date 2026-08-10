import React from 'react';
import { InventoryContext } from '../contexts/InventoryContext';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';

import { useInventoryState } from './inventory/useInventoryState';
import { useInventoryMetrics } from './inventory/useInventoryMetrics';
import { useProductActions } from './inventory/useProductActions';
import { useStockActions } from './inventory/useStockActions';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useBusiness();
  const { user, profile } = useAuth();
  const { isOnline } = useNetwork();

  const businessId = business?.id;
  const currentUserId = profile?.id || user?.id;

  // 1. Core State
  const {
    categories,
    setCategories,
    productsRaw,
    setProductsRaw,
    transactions,
    setTransactions,
    locations,
    restockBatches,
    setRestockBatches,
    itemUnits,
    setItemUnits,
    isLoading,
    error,
    refreshInventory,
  } = useInventoryState(businessId, isOnline);

  // 2. Computed Metrics
  const { products, totalValuation, lowStockCount, outOfStockCount } = useInventoryMetrics(
    productsRaw,
    categories,
    transactions,
    itemUnits,
  );

  // 3. Product CRUD Actions
  const { createCategory, createProduct, updateProduct, archiveProduct } = useProductActions({
    businessId,
    currentUserId,
    isOnline,
    itemUnits,
    restockBatches,
    setCategories,
    setProductsRaw,
    setTransactions,
    setItemUnits,
    setRestockBatches,
  });

  // 4. Stock specific actions
  const { recordStockAdjustment, createRestockBatch, voidRestockBatch, voidItemUnit } =
    useStockActions({
      businessId,
      currentUserId,
      isOnline,
      productsRaw,
      itemUnits,
      restockBatches,
      setTransactions,
      setRestockBatches,
      setItemUnits,
      refreshInventory,
    });

  const value = {
    products,
    categories,
    transactions,
    locations,
    restockBatches,
    itemUnits,
    isLoading,
    error,
    totalValuation,
    lowStockCount,
    outOfStockCount,
    createCategory,
    createProduct,
    updateProduct,
    archiveProduct,
    recordStockAdjustment,
    createRestockBatch,
    voidRestockBatch,
    voidItemUnit,
    refreshInventory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
