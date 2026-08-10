import { db } from '../../lib/dexie';
import { syncPromise, setSyncPromise } from './core';

// Handlers
import { handleProfileSync } from './pushHandlers/authSync';
import { handleBusinessSync, handleCustomerSync } from './pushHandlers/businessSync';
import { handleExpenseCategorySync, handleExpenseSync } from './pushHandlers/expenseSync';
import {
  handleProductCategorySync,
  handleProductSync,
  handleInventoryTransactionSync,
  handleRestockBatchSync,
  handleItemUnitSync,
  handlePendingRestockSync,
} from './pushHandlers/inventorySync';
import { handleReportHistorySync, handleAuditLogSync } from './pushHandlers/reportsSync';
import {
  handleSaleSync,
  handleSaleItemSync,
  handleSalePaymentSync,
} from './pushHandlers/salesSync';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: Record<string, (item: any) => Promise<boolean>> = {
  profile: handleProfileSync,
  business: handleBusinessSync,
  customer: handleCustomerSync,
  expense_category: handleExpenseCategorySync,
  expense: handleExpenseSync,
  product_category: handleProductCategorySync,
  product: handleProductSync,
  inventory_transaction: handleInventoryTransactionSync,
  restock_batch: handleRestockBatchSync,
  item_unit: handleItemUnitSync,
  pending_restock: handlePendingRestockSync,
  report_history: handleReportHistorySync,
  audit_log: handleAuditLogSync,
  sale: handleSaleSync,
  sale_item: handleSaleItemSync,
  sale_payment: handleSalePaymentSync,
};

/**
 * Background synchronization processor that flushes offline edits from Dexie to Supabase cloud.
 */
export const processSyncQueue = async (): Promise<number> => {
  if (typeof window === 'undefined' || !window.navigator.onLine) {
    return 0;
  }
  if (syncPromise) return syncPromise;

  const promise = (async () => {
    try {
      const pendingItems = await db.syncQueue.where('status').equals('pending').sortBy('createdAt');
      if (pendingItems.length === 0) {
        return 0;
      }

      let syncedCount = 0;

      for (const item of pendingItems) {
        await db.syncQueue.update(item.id!, { status: 'syncing' });

        try {
          const handler = handlers[item.entity];
          if (handler) {
            const success = await handler(item);
            if (success) {
              syncedCount++;
            }
          } else {
            console.warn(`No sync handler found for entity: ${item.entity}`);
            await db.syncQueue.update(item.id!, { status: 'failed', reason: 'No handler found' });
          }
        } catch (error) {
          console.error(`Unexpected error processing sync item ${item.id}`, error);
        }
      }

      return syncedCount;
    } finally {
      setSyncPromise(null);
    }
  })();

  setSyncPromise(promise);
  return promise;
};
