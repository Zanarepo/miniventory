import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/dexie';
import type { SalePayment } from '../types/sales';
import type { Sale, SaleItem, PaymentStatus } from '../types/sales';
import { useBusiness } from './useBusiness';

export interface LedgerSaleItem extends SaleItem {
  product_name?: string;
  is_discounted?: boolean;
}

export interface LedgerSale extends Sale {
  items: LedgerSaleItem[];
}

export function useCustomerLedger(customerId: string | null) {
  const { business } = useBusiness();
  const businessId = business?.id;

  const ledgerData = useLiveQuery(
    async () => {
      if (!businessId || !customerId) return { unpaidInvoices: [], paidInvoices: [] };

      // 1. Fetch all sales for this customer
      const customerSales = await db.sales
        .where('business_id')
        .equals(businessId)
        .filter((s) => s.customer_id === customerId)
        .reverse()
        .sortBy('created_at');

      // 2. Fetch all items for these sales
      const saleIds = customerSales.map((s) => s.id);
      const items = await db.saleItems.where('sale_id').anyOf(saleIds).toArray();

      // 2b. Fetch corresponding products to get their names
      const productIds = [...new Set(items.map((item) => item.product_id))];
      const products = await db.products.where('id').anyOf(productIds).toArray();
      const productMap = new Map(products.map((p) => [p.id, p.product_name]));

      // Group items by sale_id and enrich with product name
      const itemsBySaleId = items.reduce(
        (acc, item) => {
          if (!acc[item.sale_id]) acc[item.sale_id] = [];

          const enrichedItem: LedgerSaleItem = {
            ...item,
            product_name: productMap.get(item.product_id),
          };

          acc[item.sale_id].push(enrichedItem);
          return acc;
        },
        {} as Record<string, LedgerSaleItem[]>,
      );

      // 3. Assemble and categorize
      const unpaidInvoices: LedgerSale[] = [];
      const paidInvoices: LedgerSale[] = [];

      for (const sale of customerSales) {
        const saleWithItems: LedgerSale = {
          ...sale,
          items: itemsBySaleId[sale.id] || [],
        };

        const paidAmount = sale.amount_paid !== undefined ? sale.amount_paid : sale.total_amount;

        if (sale.total_amount > paidAmount) {
          unpaidInvoices.push(saleWithItems);
        } else {
          paidInvoices.push(saleWithItems);
        }
      }

      return { unpaidInvoices, paidInvoices };
    },
    [businessId, customerId],
    { unpaidInvoices: [], paidInvoices: [] },
  );

  const payInvoice = async (saleId: string, amount: number) => {
    if (!businessId || !customerId) throw new Error('Missing business or customer context');
    if (amount <= 0) return;

    // Run in a transaction to ensure both sale and customer balance are updated atomically
    await db.transaction('rw', db.sales, db.customers, db.syncQueue, db.salePayments, async () => {
      const sale = await db.sales.get(saleId);
      const customer = await db.customers.get(customerId);

      if (!sale || !customer) throw new Error('Sale or Customer not found');

      const currentPaid = sale.amount_paid || 0;
      const newPaidAmount = currentPaid + amount;

      // Prevent overpayment
      const finalPaidAmount = Math.min(newPaidAmount, sale.total_amount);
      const actualPaymentApplied = finalPaidAmount - currentPaid;

      const newStatus: PaymentStatus = finalPaidAmount >= sale.total_amount ? 'PAID' : 'PARTIAL';

      // 1. Update the Sale
      const saleUpdates = {
        amount_paid: finalPaidAmount,
        payment_status: newStatus,
      };

      await db.sales.update(saleId, saleUpdates);
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'sale',
        payload: { id: saleId, ...saleUpdates },
        createdAt: Date.now(),
        status: 'pending',
      });

      // 2. Add a SalePayment record for tracking
      const paymentRecord = {
        id: crypto.randomUUID(),
        business_id: businessId,
        sale_id: saleId,
        amount: actualPaymentApplied,
        payment_method: 'CASH', // Defaulting for simple ledger payments, could be expanded
        recorded_by: sale.created_by, // Or current user if available
        created_at: new Date().toISOString(),
      };
      // Note: We might not strictly need to sync salePayments if we just update amount_paid, but good practice.
      await db.salePayments.put(paymentRecord as unknown as SalePayment);
      await db.syncQueue.add({
        action: 'CREATE',
        entity: 'sale_payment',
        payload: paymentRecord,
        createdAt: Date.now(),
        status: 'pending',
      });

      // 3. Update the Customer's overall balance
      const newBalance = Math.max(0, customer.balance - actualPaymentApplied);
      await db.customers.update(customerId, {
        balance: newBalance,
      });
      await db.syncQueue.add({
        action: 'UPDATE',
        entity: 'customer',
        payload: { id: customerId, balance: newBalance },
        createdAt: Date.now(),
        status: 'pending',
      });
    });
  };

  return {
    ...ledgerData,
    payInvoice,
  };
}
