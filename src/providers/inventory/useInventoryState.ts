import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/dexie';
import { processSyncQueue } from '../../services/sync';
import type {
  ProductCategory,
  Product,
  InventoryTransaction,
  RestockBatch,
  ItemUnit,
  Location,
} from '../../types/inventory';

export const useInventoryState = (businessId?: string, isOnline?: boolean) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsRaw, setProductsRaw] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [locations] = useState<Location[]>([]);
  const [restockBatches, setRestockBatches] = useState<RestockBatch[]>([]);
  const [itemUnits, setItemUnits] = useState<ItemUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInventory = useCallback(async () => {
    await Promise.resolve(); // Async microtask boundary prevents synchronous cascading setState warnings
    if (!businessId) {
      setCategories([]);
      setProductsRaw([]);
      setTransactions([]);
      setRestockBatches([]);
      setItemUnits([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Ensure pending offline queue is flushed before fetching from cloud
        await processSyncQueue();

        const [catRes, prodRes, txRes, batchRes, unitRes] = await Promise.all([
          supabase.from('product_categories').select('*').eq('business_id', businessId),
          supabase.from('products').select('*').eq('business_id', businessId).eq('is_active', true),
          supabase
            .from('inventory_transactions')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false }),
          supabase
            .from('restock_batches')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false }),
          supabase.from('item_units').select('*').eq('business_id', businessId),
        ]);

        if (!catRes.error && !prodRes.error && !txRes.error && !batchRes.error && !unitRes.error) {
          const fetchedCats = (catRes.data || []) as ProductCategory[];
          const fetchedProds = (prodRes.data || []) as Product[];
          const fetchedTxs = (txRes.data || []) as InventoryTransaction[];
          const fetchedBatches = (batchRes.data || []) as RestockBatch[];
          const fetchedUnits = (unitRes.data || []) as ItemUnit[];

          setCategories(fetchedCats);
          setProductsRaw(fetchedProds);
          setTransactions(fetchedTxs);
          setRestockBatches(fetchedBatches);
          setItemUnits(fetchedUnits);

          // Mirror into offline Dexie cache
          try {
            await db.productCategories.bulkPut(fetchedCats);
            await db.products.bulkPut(fetchedProds);
            await db.inventoryTransactions.bulkPut(fetchedTxs);
            await db.restockBatches.bulkPut(fetchedBatches);
            await db.itemUnits.bulkPut(fetchedUnits);
          } catch (cacheErr) {
            console.error('Failed to update Dexie inventory cache:', cacheErr);
          }
          setIsLoading(false);
          return;
        }
      }

      // Offline mode or cloud error: fall back to local Dexie cache
      const localCats = await db.productCategories
        .where('business_id')
        .equals(businessId)
        .toArray();
      const localProds = await db.products
        .where('business_id')
        .equals(businessId)
        .filter((p) => p.is_active !== false)
        .toArray();
      const localTxs = await db.inventoryTransactions
        .where('business_id')
        .equals(businessId)
        .reverse()
        .sortBy('created_at');
      const localBatches = await db.restockBatches
        .where('business_id')
        .equals(businessId)
        .reverse()
        .sortBy('created_at');
      const localUnits = await db.itemUnits.where('business_id').equals(businessId).toArray();

      setCategories(localCats);
      setProductsRaw(localProds);
      setTransactions(localTxs);
      setRestockBatches(localBatches);
      setItemUnits(localUnits);
    } catch (err: unknown) {
      console.error('Error refreshing inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  }, [businessId, isOnline]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshInventory();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshInventory]);

  return {
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
  };
};
