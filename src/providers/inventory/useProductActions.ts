import { supabase } from '../../lib/supabase';
import { db } from '../../lib/dexie';
import type {
  ProductCategory,
  Product,
  InventoryTransaction,
  ItemUnit,
  RestockBatch,
} from '../../types/inventory';

interface UseProductActionsParams {
  businessId?: string;
  currentUserId?: string;
  isOnline: boolean;
  itemUnits: ItemUnit[];
  restockBatches: RestockBatch[];
  setCategories: React.Dispatch<React.SetStateAction<ProductCategory[]>>;
  setProductsRaw: React.Dispatch<React.SetStateAction<Product[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
  setItemUnits: React.Dispatch<React.SetStateAction<ItemUnit[]>>;
  setRestockBatches: React.Dispatch<React.SetStateAction<RestockBatch[]>>;
}

export const useProductActions = ({
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
}: UseProductActionsParams) => {
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
    if (!businessId || !currentUserId) return null;
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

    // Find active orphans
    const activeUnits = itemUnits.filter((u) => u.product_id === id && u.status === 'AVAILABLE');
    const activeBatches = restockBatches.filter(
      (b) => b.product_id === id && b.status === 'ACTIVE',
    );

    setProductsRaw((prev) => prev.filter((p) => p.id !== id));

    if (activeUnits.length > 0) {
      setItemUnits((prev) =>
        prev.map((u) =>
          u.product_id === id && u.status === 'AVAILABLE' ? { ...u, status: 'VOID' } : u,
        ),
      );
    }
    if (activeBatches.length > 0) {
      setRestockBatches((prev) =>
        prev.map((b) =>
          b.product_id === id && b.status === 'ACTIVE'
            ? { ...b, status: 'VOID', void_reason: 'Product archived' }
            : b,
        ),
      );
    }

    await db.products.update(id, { is_active: false, updated_at: new Date().toISOString() });

    for (const unit of activeUnits) {
      await db.itemUnits.update(unit.id, { status: 'VOID' });
    }
    for (const batch of activeBatches) {
      await db.restockBatches.update(batch.id, { status: 'VOID', void_reason: 'Product archived' });
    }

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

      for (const unit of activeUnits) {
        const payload = { id: unit.id, status: 'VOID' };
        const { error: unitErr } = await supabase
          .from('item_units')
          .update(payload)
          .eq('id', unit.id);
        if (unitErr) {
          await db.syncQueue.add({
            action: 'UPDATE',
            entity: 'item_unit',
            payload,
            createdAt: Date.now(),
            status: 'pending',
          });
        }
      }

      for (const batch of activeBatches) {
        const payload = { id: batch.id, status: 'VOID', void_reason: 'Product archived' };
        const { error: batchErr } = await supabase
          .from('restock_batches')
          .update(payload)
          .eq('id', batch.id);
        if (batchErr) {
          await db.syncQueue.add({
            action: 'UPDATE',
            entity: 'restock_batch',
            payload,
            createdAt: Date.now(),
            status: 'pending',
          });
        }
      }
    } else {
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'product',
        payload: { id, is_active: false },
        createdAt: Date.now(),
        status: 'pending',
      });
      for (const unit of activeUnits) {
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'item_unit',
          payload: { id: unit.id, status: 'VOID' },
          createdAt: Date.now(),
          status: 'pending',
        });
      }
      for (const batch of activeBatches) {
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'restock_batch',
          payload: { id: batch.id, status: 'VOID', void_reason: 'Product archived' },
          createdAt: Date.now(),
          status: 'pending',
        });
      }
    }

    return true;
  };

  return {
    createCategory,
    createProduct,
    updateProduct,
    archiveProduct,
  };
};
