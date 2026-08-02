import { db, type CachedAuditLog } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import type { Business } from '../types/business';
import type { Profile } from '../types/auth';
import type { Product, ProductCategory, InventoryTransaction } from '../types/inventory';
import type { Sale, SaleItem } from '../types/sales';
import type { Expense, ExpenseCategory } from '../types/expenses';
import type { ReportHistory } from '../types/reports';

let isSyncing = false;
let isDownloading = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFailedSync = async (id: number, error: any) => {
  const item = await db.syncQueue.get(id);
  if (!item) return;
  const newRetryCount = (item.retryCount || 0) + 1;
  const errorReason = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));

  if (newRetryCount > 10) {
    await db.syncQueue.update(id, {
      status: 'failed',
      retryCount: newRetryCount,
      failedAt: Date.now(),
      reason: errorReason,
    });
    console.warn(`Sync item ${id} permanently failed and moved to DLQ. Reason: ${errorReason}`);
  } else {
    await db.syncQueue.update(id, { status: 'pending', retryCount: newRetryCount });
  }
};

/**
 * Background synchronization processor that flushes offline edits from Dexie to Supabase cloud.
 */
export const processSyncQueue = async (): Promise<number> => {
  if (isSyncing || typeof window === 'undefined' || !window.navigator.onLine) {
    return 0;
  }

  try {
    isSyncing = true;
    const pendingItems = await db.syncQueue.where('status').equals('pending').sortBy('createdAt');
    if (pendingItems.length === 0) {
      return 0;
    }

    let syncedCount = 0;

    for (const item of pendingItems) {
      await db.syncQueue.update(item.id!, { status: 'syncing' });

      try {
        if (item.entity === 'business') {
          if (item.action === 'UPDATE') {
            const payload = item.payload as Partial<Business> & { id: string };
            const { error } = await supabase
              .from('businesses')
              .update(payload)
              .eq('id', payload.id);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          } else if (item.action === 'CREATE') {
            const payload = item.payload as Business;
            const tempId = payload.id;
            const cleanPayload: Partial<Business> = { ...payload };
            delete cleanPayload.id;
            const { data, error } = await supabase
              .from('businesses')
              .insert([cleanPayload as Business])
              .select()
              .single();
            if (!error && data) {
              await db.cachedBusinesses.delete(tempId);
              await db.cachedBusinesses.put(data as Business);
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'profile') {
          if (item.action === 'UPDATE') {
            const payload = item.payload as Partial<Profile> & { id: string };
            const { error } = await supabase.from('profiles').update(payload).eq('id', payload.id);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'product_category') {
          if (item.action === 'CREATE') {
            const payload = item.payload as ProductCategory;
            const { error } = await supabase.from('product_categories').insert([payload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'product') {
          if (item.action === 'CREATE') {
            const payload = item.payload as Product;
            const { error } = await supabase.from('products').insert([payload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          } else if (item.action === 'UPDATE') {
            const payload = item.payload as Partial<Product> & { id: string };
            const { error } = await supabase.from('products').update(payload).eq('id', payload.id);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'inventory_transaction') {
          if (item.action === 'CREATE') {
            const payload = item.payload as InventoryTransaction;
            const { error } = await supabase.from('inventory_transactions').insert([payload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'sale') {
          if (item.action === 'CREATE') {
            const payload = item.payload as { sale: Sale; saleItems: SaleItem[] };
            const { error, data } = await supabase.rpc('process_offline_sale', {
              p_sale: payload.sale,
              p_sale_items: payload.saleItems,
            });
            if (!error && data?.success) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error || new Error('RPC failed'));
            }
          }
        } else if (item.entity === 'expense_category') {
          if (item.action === 'CREATE') {
            const payload = item.payload as ExpenseCategory;
            const { error } = await supabase.from('expense_categories').insert([payload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'expense') {
          if (item.action === 'CREATE') {
            const payload = item.payload as Expense;
            const { error } = await supabase.from('expenses').insert([payload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          } else if (item.action === 'UPDATE') {
            const payload = item.payload as Partial<Expense> & { id: string };
            const { error } = await supabase.from('expenses').update(payload).eq('id', payload.id);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'report_history') {
          if (item.action === 'CREATE') {
            const payload = item.payload as ReportHistory;
            const dbPayload = {
              id: payload.id,
              business_id: payload.businessId,
              report_type: payload.reportType,
              report_name: payload.reportName,
              export_format: payload.exportFormat,
              generated_by: payload.generatedBy || null,
              parameters: payload.parameters || null,
              generated_at: payload.generatedAt,
            };
            const { error } = await supabase.from('report_history').insert([dbPayload]);
            if (!error) {
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else if (item.entity === 'audit_log') {
          if (item.action === 'CREATE') {
            const payload = item.payload as Record<string, unknown>;
            // Remove local 'status' flag before inserting into Supabase
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { status, ...dbPayload } = payload;
            const { error } = await supabase.from('audit_logs').insert([dbPayload]);
            if (!error) {
              if (typeof dbPayload.id === 'string') {
                const existing = await db.auditLogs.get(dbPayload.id);
                if (existing) {
                  await db.auditLogs.update(dbPayload.id, { status: 'synced' });
                }
              }
              await db.syncQueue.delete(item.id!);
              syncedCount++;
            } else {
              await handleFailedSync(item.id!, error);
            }
          }
        } else {
          await handleFailedSync(item.id!, new Error('Unknown entity or action'));
        }
      } catch (itemErr) {
        console.error('Sync failed for item:', itemErr);
        await handleFailedSync(item.id!, itemErr);
      }
    }

    return syncedCount;
  } catch (err) {
    console.error('Critical error in sync processor:', err);
    return 0;
  } finally {
    isSyncing = false;
  }
};

/**
 * Downloads the latest data from Supabase to Dexie to ensure local caches are up to date.
 * Should be called after processSyncQueue to avoid overwriting local pending changes.
 */
export const syncFromServer = async (businessId: string): Promise<boolean> => {
  if (isDownloading || typeof window === 'undefined' || !window.navigator.onLine || !businessId) {
    return false;
  }

  try {
    isDownloading = true;

    // 1. Sync Products & Categories
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').eq('business_id', businessId),
      supabase.from('product_categories').select('*').eq('business_id', businessId),
    ]);

    if (categoriesRes.data) {
      await db.productCategories.bulkPut(categoriesRes.data);
    }

    if (productsRes.data) {
      await db.products.bulkPut(productsRes.data);
      // Also update the simple cache used for quick lookups
      await db.cachedProducts.bulkPut(
        productsRes.data.map((p) => ({
          id: p.id,
          name: p.product_name,
          price: p.price || 0,
          stock: p.current_stock || 0,
          updatedAt: p.updated_at,
        })),
      );
    }

    // 2. Sync Expense Categories & recent Expenses (last 30 days to save space)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [expenseCatRes, expensesRes] = await Promise.all([
      supabase.from('expense_categories').select('*').eq('business_id', businessId),
      supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .gte('expense_date', thirtyDaysAgo.toISOString()),
    ]);

    if (expenseCatRes.data) {
      await db.expenseCategories.bulkPut(expenseCatRes.data);
    }

    if (expensesRes.data) {
      await db.expenses.bulkPut(expensesRes.data);
      await db.cachedExpenses.bulkPut(
        expensesRes.data.map((e) => ({
          id: e.id,
          date: e.expense_date,
          amount: e.amount,
          category: e.category_id || 'unassigned',
        })),
      );
    }

    // 3. Sync recent Sales (last 30 days)
    const salesRes = await supabase
      .from('sales')
      .select('*')
      .eq('business_id', businessId)
      .gte('created_at', thirtyDaysAgo.toISOString());
    if (salesRes.data) {
      await db.sales.bulkPut(salesRes.data);
      await db.cachedSales.bulkPut(
        salesRes.data.map((s) => ({
          id: s.id,
          date: s.created_at,
          total: s.total_amount,
          status: 'synced',
        })),
      );
    }

    // 4. Sync recent Audit Logs (last 30 days)
    const auditRes = await supabase
      .from('audit_logs')
      .select('*')
      .eq('business_id', businessId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(150);
    if (auditRes.data) {
      await db.auditLogs.bulkPut(
        (auditRes.data as unknown as CachedAuditLog[]).map((l) => ({ ...l, status: 'synced' })),
      );
    }

    return true;
  } catch (err) {
    console.error('Failed to sync from server:', err);
    return false;
  } finally {
    isDownloading = false;
  }
};
