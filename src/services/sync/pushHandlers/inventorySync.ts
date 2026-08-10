import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type {
  Product,
  ProductCategory,
  InventoryTransaction,
  RestockBatch,
  ItemUnit,
} from '../../../types/inventory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleProductCategorySync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as ProductCategory;
    const { error } = await supabase.from('product_categories').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleProductSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as Product;
    const { error } = await supabase.from('products').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<Product> & { id: string };
    const { error } = await supabase.from('products').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleInventoryTransactionSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as InventoryTransaction;
    const { error } = await supabase.from('inventory_transactions').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleRestockBatchSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as RestockBatch;
    const { error } = await supabase.from('restock_batches').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<RestockBatch> & { id: string };
    const { error } = await supabase.from('restock_batches').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleItemUnitSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as ItemUnit;
    const { error } = await supabase.from('item_units').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<ItemUnit> & { id: string };
    const { error } = await supabase.from('item_units').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlePendingRestockSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = item.payload as any;
    const { error } = await supabase.from('pending_restocks').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = item.payload as any;
    const { error } = await supabase.from('pending_restocks').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
