import { supabase } from '../../lib/supabase';
import { db } from '../../lib/dexie';
import { processSyncQueue } from '../../services/sync';
import type {
  Product,
  InventoryTransaction,
  RestockBatch,
  ItemUnit,
  StockMovementType,
} from '../../types/inventory';

interface UseStockActionsParams {
  businessId?: string;
  currentUserId?: string;
  isOnline: boolean;
  productsRaw: Product[];
  itemUnits: ItemUnit[];
  restockBatches: RestockBatch[];
  setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
  setRestockBatches: React.Dispatch<React.SetStateAction<RestockBatch[]>>;
  setItemUnits: React.Dispatch<React.SetStateAction<ItemUnit[]>>;
  refreshInventory: () => Promise<void>;
}

export const useStockActions = ({
  businessId,
  currentUserId,
  isOnline,
  productsRaw,
  itemUnits,
  restockBatches,
  setTransactions,
  setRestockBatches,
  setItemUnits,
}: UseStockActionsParams) => {
  const recordStockAdjustment = async (
    productId: string,
    movementType: StockMovementType,
    quantity: number,
    unitCost: number | undefined,
    remarks: string,
  ): Promise<boolean> => {
    if (!businessId || !currentUserId) return false;
    const now = new Date().toISOString();

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

  const createRestockBatch = async (
    productId: string,
    quantity: number,
    costPrice: number,
    serials?: string[],
    customRemarks?: string,
  ): Promise<boolean> => {
    if (!businessId || !currentUserId) return false;

    const now = new Date().toISOString();
    const batchId = crypto.randomUUID();

    const newBatch: RestockBatch = {
      id: batchId,
      business_id: businessId,
      product_id: productId,
      quantity,
      cost_price: costPrice,
      created_by: currentUserId,
      status: 'ACTIVE',
      created_at: now,
    };

    const product = productsRaw.find((p) => p.id === productId);
    // Use fallback check for serials.length > 0 to resolve race conditions
    // where productsRaw state hasn't updated yet when creating a new serialized product offline
    const isSerialized = product?.is_serialized ?? (serials && serials.length > 0);

    const newUnits: ItemUnit[] = [];
    if (isSerialized && serials && serials.length > 0) {
      for (const serial of serials) {
        newUnits.push({
          id: crypto.randomUUID(),
          business_id: businessId,
          product_id: productId,
          serial_barcode: serial,
          status: 'AVAILABLE',
          restock_batch_id: batchId,
          cost_price: costPrice,
          created_at: now,
        });
      }
    }

    const newTx: InventoryTransaction = {
      id: crypto.randomUUID(),
      business_id: businessId,
      product_id: productId,
      movement_type: 'Stock Adjustment Increase',
      quantity: Math.abs(Number(quantity)),
      unit_cost: costPrice,
      remarks: customRemarks || `Restock Batch ${batchId}${isSerialized ? ' (Serialized)' : ''}`,
      created_by: currentUserId,
      created_at: now,
    };

    // Optimistic UI updates
    setRestockBatches((prev) => [newBatch, ...prev]);
    if (newUnits.length > 0) {
      setItemUnits((prev) => [...newUnits, ...prev]);
    }
    setTransactions((prev) => [newTx, ...prev]);

    // Local DB writes
    await db.restockBatches.put(newBatch);
    if (newUnits.length > 0) await db.itemUnits.bulkPut(newUnits);
    await db.inventoryTransactions.put(newTx);

    // Cloud sync queue
    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'restock_batch',
      payload: newBatch,
      createdAt: Date.now(),
      status: 'pending',
    });

    for (const unit of newUnits) {
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'item_unit',
        payload: unit,
        createdAt: Date.now() + 1,
        status: 'pending',
      });
    }

    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'inventory_transaction',
      payload: newTx,
      createdAt: Date.now() + 2,
      status: 'pending',
    });

    if (isOnline) {
      setTimeout(() => processSyncQueue(), 500);
    }

    return true;
  };

  const voidRestockBatch = async (batchId: string, reason: string): Promise<boolean> => {
    if (!businessId || !currentUserId) return false;

    const batchUnits = itemUnits.filter((u) => u.restock_batch_id === batchId);
    const soldUnits = batchUnits.filter((u) => u.status === 'SOLD');
    if (soldUnits.length > 0) {
      alert(`Cannot void batch: ${soldUnits.length} unit(s) are already SOLD.`);
      return false;
    }

    const batch = restockBatches.find((b) => b.id === batchId);
    if (!batch) return false;

    const product = productsRaw.find((p) => p.id === batch.product_id);
    const isSerialized = product?.is_serialized ?? batchUnits.length > 0;
    const now = new Date().toISOString();

    const updatedBatch: Partial<RestockBatch> = {
      id: batchId,
      status: 'VOID',
      void_reason: reason,
    };

    const updatedUnits = batchUnits.map((u) => ({ ...u, status: 'VOID' as const }));

    let newTx: InventoryTransaction | null = null;
    if (!isSerialized) {
      newTx = {
        id: crypto.randomUUID(),
        business_id: businessId,
        product_id: batch.product_id,
        movement_type: 'Void Restock',
        quantity: -Math.abs(Number(batch.quantity)),
        unit_cost: batch.cost_price,
        remarks: `Voided batch ${batchId} Reason: ${reason}`,
        created_by: currentUserId,
        created_at: now,
      };
    }

    setRestockBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, ...updatedBatch } : b)),
    );
    setItemUnits((prev) =>
      prev.map((u) => (u.restock_batch_id === batchId ? { ...u, status: 'VOID' } : u)),
    );
    if (newTx) setTransactions((prev) => [newTx, ...prev]);

    await db.restockBatches.update(batchId, updatedBatch);
    if (updatedUnits.length > 0) await db.itemUnits.bulkPut(updatedUnits);
    if (newTx) await db.inventoryTransactions.put(newTx);

    await db.syncQueue.add({
      action: 'UPDATE',
      entity: 'restock_batch',
      payload: updatedBatch,
      createdAt: Date.now(),
      status: 'pending',
    });

    for (const unit of updatedUnits) {
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'item_unit',
        payload: { id: unit.id, status: 'VOID' },
        createdAt: Date.now() + 1,
        status: 'pending',
      });
    }

    if (newTx) {
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'inventory_transaction',
        payload: newTx,
        createdAt: Date.now() + 2,
        status: 'pending',
      });
    }

    if (isOnline) {
      setTimeout(() => processSyncQueue(), 500);
    }

    return true;
  };

  const voidItemUnit = async (unit: ItemUnit, reason: string): Promise<boolean> => {
    if (!businessId || !currentUserId) return false;

    const now = new Date().toISOString();
    const updatedUnit = { id: unit.id, status: 'VOID' as const };

    const newTx: InventoryTransaction = {
      id: crypto.randomUUID(),
      business_id: businessId,
      product_id: unit.product_id,
      movement_type: 'Stock Adjustment Decrease',
      quantity: -1,
      unit_cost: unit.cost_price,
      remarks: `Voided serial: ${unit.serial_barcode}. Reason: ${reason}`,
      created_by: currentUserId,
      created_at: now,
    };

    // Optimistic UI updates
    setItemUnits((prev) => prev.map((u) => (u.id === unit.id ? { ...u, status: 'VOID' } : u)));
    setTransactions((prev) => [newTx, ...prev]);

    // Local DB writes
    await db.itemUnits.update(unit.id, updatedUnit);
    await db.inventoryTransactions.put(newTx);

    // Cloud sync queue
    await db.syncQueue.add({
      action: 'UPDATE',
      entity: 'item_unit',
      payload: updatedUnit,
      createdAt: Date.now(),
      status: 'pending',
    });

    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'inventory_transaction',
      payload: newTx,
      createdAt: Date.now() + 1,
      status: 'pending',
    });

    if (isOnline) {
      setTimeout(() => processSyncQueue(), 500);
    }

    return true;
  };

  return {
    recordStockAdjustment,
    createRestockBatch,
    voidRestockBatch,
    voidItemUnit,
  };
};
