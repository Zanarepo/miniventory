import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryContext } from '../contexts/InventoryContext';
import type {
  ProductCategory,
  Product,
  InventoryTransaction,
  ProductWithStock,
  StockMovementType,
} from '../types/inventory';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import { processSyncQueue } from '../services/syncService';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useBusiness();
  const { user, profile } = useAuth();
  const { isOnline } = useNetwork();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsRaw, setProductsRaw] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = business?.id;
  const currentUserId = profile?.id || user?.id;

  // Load and synchronize inventory items
  const refreshInventory = useCallback(async () => {
    await Promise.resolve(); // Async microtask boundary prevents synchronous cascading setState warnings
    if (!businessId) {
      setCategories([]);
      setProductsRaw([]);
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Ensure pending offline queue is flushed before fetching from cloud
        await processSyncQueue();

        const [catRes, prodRes, txRes] = await Promise.all([
          supabase.from('product_categories').select('*').eq('business_id', businessId),
          supabase.from('products').select('*').eq('business_id', businessId).eq('is_active', true),
          supabase
            .from('inventory_transactions')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false }),
        ]);

        if (!catRes.error && !prodRes.error && !txRes.error) {
          const fetchedCats = (catRes.data || []) as ProductCategory[];
          const fetchedProds = (prodRes.data || []) as Product[];
          const fetchedTxs = (txRes.data || []) as InventoryTransaction[];

          setCategories(fetchedCats);
          setProductsRaw(fetchedProds);
          setTransactions(fetchedTxs);

          // Mirror into offline Dexie cache
          try {
            await db.productCategories.bulkPut(fetchedCats);
            await db.products.bulkPut(fetchedProds);
            await db.inventoryTransactions.bulkPut(fetchedTxs);
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

      setCategories(localCats);
      setProductsRaw(localProds);
      setTransactions(localTxs);
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
      const currentStock = stockMap.get(p.id) || 0;
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
  }, [productsRaw, categories, transactions]);

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

  // CRUD Operations
  const createCategory = async (
    name: string,
    description?: string,
  ): Promise<ProductCategory | null> => {
    if (!businessId) return null;
    const newCat: ProductCategory = {
      id: crypto.randomUUID(),
      business_id: businessId,
      name,
      description: description || '',
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCat]);
    await db.productCategories.put(newCat);

    if (isOnline) {
      const { error } = await supabase.from('product_categories').insert([newCat]);
      if (error) {
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'product_category',
          payload: newCat,
          createdAt: Date.now(),
          status: 'pending',
        });
      }
    } else {
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'product_category',
        payload: newCat,
        createdAt: Date.now(),
        status: 'pending',
      });
    }

    return newCat;
  };

  const createProduct = async (
    productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>,
    openingStock: number,
    unitCost?: number,
  ): Promise<Product | null> => {
    if (!businessId) return null;
    const now = new Date().toISOString();
    const productId = crypto.randomUUID();

    const newProd: Product = {
      ...productData,
      id: productId,
      business_id: businessId,
      created_at: now,
      updated_at: now,
    };

    const openingTx: InventoryTransaction = {
      id: crypto.randomUUID(),
      business_id: businessId,
      product_id: productId,
      movement_type: 'Opening Stock',
      quantity: Math.abs(Number(openingStock || 0)),
      unit_cost: unitCost ?? productData.cost_price,
      remarks: 'Initial opening stock recorded at product registration',
      created_by: currentUserId,
      created_at: now,
    };

    setProductsRaw((prev) => [...prev, newProd]);
    if (openingStock > 0) {
      setTransactions((prev) => [openingTx, ...prev]);
    }

    await db.products.put(newProd);
    if (openingStock > 0) {
      await db.inventoryTransactions.put(openingTx);
    }

    if (isOnline) {
      const { error: prodErr } = await supabase.from('products').insert([newProd]);
      if (prodErr) {
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'product',
          payload: newProd,
          createdAt: Date.now(),
          status: 'pending',
        });
        if (openingStock > 0) {
          await db.syncQueue.add({
            action: 'CREATE',
            entity: 'inventory_transaction',
            payload: openingTx,
            createdAt: Date.now() + 1,
            status: 'pending',
          });
        }
      } else if (openingStock > 0) {
        const { error: txErr } = await supabase.from('inventory_transactions').insert([openingTx]);
        if (txErr) {
          await db.syncQueue.add({
            action: 'CREATE',
            entity: 'inventory_transaction',
            payload: openingTx,
            createdAt: Date.now() + 1,
            status: 'pending',
          });
        }
      }
    } else {
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'product',
        payload: newProd,
        createdAt: Date.now(),
        status: 'pending',
      });
      if (openingStock > 0) {
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'inventory_transaction',
          payload: openingTx,
          createdAt: Date.now() + 1,
          status: 'pending',
        });
      }
    }

    return newProd;
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'business_id'>>,
  ): Promise<boolean> => {
    if (!businessId) return false;
    const now = new Date().toISOString();
    const updatedPayload = { ...updates, id, updated_at: now };

    setProductsRaw((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedPayload } : p)));
    await db.products.update(id, updatedPayload);

    if (isOnline) {
      const { error } = await supabase.from('products').update(updatedPayload).eq('id', id);
      if (error) {
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'product',
          payload: updatedPayload,
          createdAt: Date.now(),
          status: 'pending',
        });
      }
    } else {
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'product',
        payload: updatedPayload,
        createdAt: Date.now(),
        status: 'pending',
      });
    }

    return true;
  };

  const archiveProduct = async (id: string): Promise<boolean> => {
    if (!businessId) return false;
    setProductsRaw((prev) => prev.filter((p) => p.id !== id));
    await db.products.update(id, { is_active: false, updated_at: new Date().toISOString() });

    if (isOnline) {
      const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
      if (error) {
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'product',
          payload: { id, is_active: false },
          createdAt: Date.now(),
          status: 'pending',
        });
      }
    } else {
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'product',
        payload: { id, is_active: false },
        createdAt: Date.now(),
        status: 'pending',
      });
    }

    return true;
  };

  const recordStockAdjustment = async (
    productId: string,
    movementType: StockMovementType,
    quantity: number,
    unitCost: number | undefined,
    remarks: string,
  ): Promise<boolean> => {
    if (!businessId) return false;
    const now = new Date().toISOString();

    // Determine sign of quantity based on movement type
    const isDeduction =
      movementType === 'Stock Adjustment Decrease' ||
      movementType === 'Damaged Stock' ||
      movementType === 'Sales Deduction';
    const signedQty = isDeduction ? -Math.abs(Number(quantity)) : Math.abs(Number(quantity));

    const tx: InventoryTransaction = {
      id: crypto.randomUUID(),
      business_id: businessId,
      product_id: productId,
      movement_type: movementType,
      quantity: signedQty,
      unit_cost: unitCost,
      remarks: remarks || `${movementType} entry`,
      created_by: currentUserId,
      created_at: now,
    };

    setTransactions((prev) => [tx, ...prev]);
    await db.inventoryTransactions.put(tx);

    if (isOnline) {
      const { error } = await supabase.from('inventory_transactions').insert([tx]);
      if (error) {
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'inventory_transaction',
          payload: tx,
          createdAt: Date.now(),
          status: 'pending',
        });
      }
    } else {
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'inventory_transaction',
        payload: tx,
        createdAt: Date.now(),
        status: 'pending',
      });
    }

    return true;
  };

  const value = {
    products,
    categories,
    transactions,
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
    refreshInventory,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
