import { db, type CachedAuditLog } from '../../lib/dexie';
import { supabase } from '../../lib/supabase';
import { downloadPromise, setDownloadPromise } from './core';

/**
 * Downloads the latest data from Supabase to Dexie to ensure local caches are up to date.
 * Should be called after processSyncQueue to avoid overwriting local pending changes.
 */
export const syncFromServer = async (businessId: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.navigator.onLine || !businessId) {
    return false;
  }
  if (downloadPromise) return downloadPromise;

  const promise = (async () => {
    try {
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

        const saleIds = salesRes.data.map((s) => s.id);
        if (saleIds.length > 0) {
          // Fetch sale_items and sale_payments in chunks to avoid URL length issues if there are many sales
          const [saleItemsRes, salePaymentsRes] = await Promise.all([
            supabase.from('sale_items').select('*').in('sale_id', saleIds),
            supabase.from('sale_payments').select('*').in('sale_id', saleIds),
          ]);

          if (saleItemsRes.data) {
            await db.saleItems.bulkPut(saleItemsRes.data);
          }
          if (salePaymentsRes.data) {
            await db.salePayments.bulkPut(salePaymentsRes.data);
          }
        }
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

      // 5. Sync Customers
      const customersRes = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId);
      if (customersRes.data) {
        await db.customers.bulkPut(customersRes.data);
      }

      // 6. Sync Restock Batches and Item Units
      const [batchesRes, unitsRes] = await Promise.all([
        supabase
          .from('restock_batches')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('item_units').select('*').eq('business_id', businessId),
      ]);

      if (batchesRes.data) {
        await db.restockBatches.bulkPut(batchesRes.data);
      }

      if (unitsRes.data) {
        await db.itemUnits.bulkPut(unitsRes.data);
      }

      return true;
    } catch (err) {
      console.error('Failed to sync from server:', err);
      return false;
    } finally {
      setDownloadPromise(null);
    }
  })();

  setDownloadPromise(promise);
  return promise;
};
