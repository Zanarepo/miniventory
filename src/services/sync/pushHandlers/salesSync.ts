import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type { Sale, SaleItem, SalePayment } from '../../../types/sales';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleSaleSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as {
      sale: Sale;
      saleItems: SaleItem[];
      salePayments?: SalePayment[];
    };
    if (!payload.sale || !payload.saleItems) {
      console.warn('Deleting invalid legacy sale sync payload:', item.id);
      await db.syncQueue.delete(item.id!);
      return true;
    }
    // Strip invalid fields that might be stuck in legacy offline queues
    if (payload.saleItems) {
      payload.saleItems = payload.saleItems.map((si: any) => {
        const { unit_price, unit_cost, ...rest } = si;
        return {
          ...rest,
          unit_cost: unit_cost !== undefined ? unit_cost : unit_price,
        };
      });
    }

    const { error, data } = await supabase.rpc('process_offline_sale', {
      p_sale: payload.sale,
      p_sale_items: payload.saleItems,
      p_sale_payments: payload.salePayments || [],
    });
    if (!error && data?.success) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error || new Error(data?.error || 'RPC failed'));
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<Sale> & { id: string } & Record<string, unknown>;
    // Remove local computed fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productNames, itemCount, firstItemName, hasDiscount, ...dbPayload } = payload;
    const { error } = await supabase.from('sales').update(dbPayload).eq('id', payload.id);
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
export const handleSaleItemSync = async (item: any): Promise<boolean> => {
  if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<SaleItem> & { id: string } & Record<string, unknown>;
    // Remove local computed fields and legacy unit_price
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { product_name, unit_price, ...dbPayload } = payload;
    const { error } = await supabase.from('sale_items').update(dbPayload).eq('id', payload.id);
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
export const handleSalePaymentSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as SalePayment;
    const { error } = await supabase.from('sale_payments').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
