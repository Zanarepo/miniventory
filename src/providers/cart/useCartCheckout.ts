import type { CartItem } from '../../contexts/CartContext';
import type { PaymentMethod, Sale, SaleItem } from '../../types/sales';
import type { InventoryTransaction, ItemUnit } from '../../types/inventory';
import { db } from '../../lib/dexie';
import { supabase } from '../../lib/supabase';
import { CART_STORAGE_KEY } from './useCartState';

export const useCartCheckout = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  subtotal: number,
  totalCost: number,
  grossProfit: number,
  businessId: string | undefined,
  currentUserId: string | undefined,
  itemUnits: ItemUnit[],
  isOnline: boolean,
  refreshInventory: () => void,
) => {
  const checkout = async (
    paymentMethod: PaymentMethod,
    customerId?: string,
    amountPaid?: number,
    salePaymentsInput?: { payment_method: PaymentMethod; amount: number }[],
  ): Promise<{ success: boolean; receiptNumber?: string; message?: string }> => {
    if (!businessId || !currentUserId || cart.length === 0) {
      return { success: false, message: 'Invalid checkout state' };
    }

    // Pre-checkout validation
    const invalidSerials = cart.flatMap((item) => {
      const allItemSerials = [
        ...(item.serials || []),
        ...(item.overridden_serials?.map((o) => o.serial) || []),
      ];
      return allItemSerials.filter((serial) => {
        const unit = itemUnits.find((u) => u.serial_barcode === serial);
        const isOverridden = item.overridden_serials?.some((o) => o.serial === serial);
        return unit && unit.status === 'SOLD' && !isOverridden;
      });
    });

    if (invalidSerials.length > 0) {
      return {
        success: false,
        message: `Checkout failed: The following serials were already sold: ${invalidSerials.join(', ')}. Please remove them from the cart.`,
      };
    }

    try {
      const now = new Date().toISOString();
      const receiptNumber = `BT-${Date.now().toString().slice(-6)}`;
      const saleId = crypto.randomUUID();

      const sale: Sale = {
        id: saleId,
        business_id: businessId,
        receipt_number: receiptNumber,
        subtotal,
        total_amount: subtotal,
        total_cost: totalCost,
        gross_profit: grossProfit,
        payment_method: paymentMethod,
        customer_id: customerId,
        payment_status:
          amountPaid !== undefined
            ? amountPaid >= subtotal
              ? 'PAID'
              : amountPaid > 0
                ? 'PARTIAL'
                : 'UNPAID'
            : 'PAID',
        amount_paid: amountPaid !== undefined ? amountPaid : subtotal,
        created_by: currentUserId,
        created_at: now,
      };

      const saleItems: SaleItem[] = cart.flatMap((item) => {
        const sellingPrice = item.custom_price ?? Number(item.product.selling_price);
        const allSerials = [
          ...(item.serials || []),
          ...(item.overridden_serials?.map((o) => o.serial) || []),
        ];

        if (allSerials.length > 0) {
          return allSerials.map((serial) => {
            const lineTotal = sellingPrice * 1;
            const lineCost = Number(item.product.cost_price) * 1;
            return {
              id: crypto.randomUUID(),
              sale_id: saleId,
              product_id: item.product.id,
              quantity: 1,
              unit_cost: Number(item.product.cost_price),
              selling_price: sellingPrice,
              line_total: lineTotal,
              line_profit: lineTotal - lineCost,
              custom_name: item.custom_name,
              is_discounted: item.is_discounted,
              serials: [serial],
              created_at: now,
            };
          });
        }

        const lineTotal = sellingPrice * item.quantity;
        const lineCost = Number(item.product.cost_price) * item.quantity;
        return [
          {
            id: crypto.randomUUID(),
            sale_id: saleId,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_cost: Number(item.product.cost_price),
            selling_price: sellingPrice,
            line_total: lineTotal,
            line_profit: lineTotal - lineCost,
            custom_name: item.custom_name,
            is_discounted: item.is_discounted,
            serials: [],
            created_at: now,
          },
        ];
      });

      const inventoryTxs: InventoryTransaction[] = cart.map((item) => ({
        id: crypto.randomUUID(),
        business_id: businessId,
        product_id: item.product.id,
        movement_type: 'Sales Deduction',
        quantity: -Math.abs(item.quantity),
        unit_cost: Number(item.product.cost_price),
        remarks: `Sale Receipt: ${receiptNumber}`,
        created_by: currentUserId,
        created_at: now,
      }));

      const salePayments =
        salePaymentsInput?.map((sp) => ({
          id: crypto.randomUUID(),
          business_id: businessId,
          sale_id: saleId,
          amount: sp.amount,
          payment_method: sp.payment_method,
          recorded_by: currentUserId,
          created_at: now,
        })) || [];

      // ─── Collect serial updates ─────────────────────────────────────────
      const serialUpdates: any[] = [];
      cart.forEach((item) => {
        const allSerials = [
          ...(item.serials || []),
          ...(item.overridden_serials?.map((o) => o.serial) || []),
        ];
        allSerials.forEach((serial) => {
          const unit = itemUnits.find((u) => u.serial_barcode === serial);
          if (unit) serialUpdates.push({ ...unit, status: 'SOLD' });
        });
      });

      // ════════════════════════════════════════════════════════════════════
      // SUPABASE FIRST — always attempt cloud write regardless of isOnline flag
      // ════════════════════════════════════════════════════════════════════
      let supabaseSuccess = false;

      if (isOnline) {
        try {
          console.log('[Checkout] Attempting Supabase RPC...');
          const { error: rpcError, data: rpcData } = await supabase.rpc('process_offline_sale', {
            p_sale: sale,
            p_sale_items: saleItems,
            p_sale_payments: salePayments || [],
          });

          if (!rpcError && rpcData?.success) {
            console.log('[Checkout] ✅ Supabase RPC succeeded');
            supabaseSuccess = true;
          } else {
            // RPC failed — try direct table inserts as fallback
            console.warn(
              '[Checkout] RPC failed, trying direct inserts. RPC error:',
              rpcError,
              'data:',
              rpcData,
            );
            const { error: saleError } = await supabase.from('sales').insert(sale);
            if (saleError) throw new Error(`Direct sale insert failed: ${saleError.message}`);

            const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
            if (itemsError)
              throw new Error(`Direct sale_items insert failed: ${itemsError.message}`);

            if (salePayments.length > 0) {
              const { error: paymentsError } = await supabase
                .from('sale_payments')
                .insert(salePayments);
              if (paymentsError)
                throw new Error(`Direct sale_payments insert failed: ${paymentsError.message}`);
            }

            const { error: txError } = await supabase
              .from('inventory_transactions')
              .insert(inventoryTxs);
            if (txError) console.warn('[Checkout] inventory_transactions insert failed:', txError);

            console.log('[Checkout] ✅ Direct Supabase inserts succeeded');
            supabaseSuccess = true;
          }
        } catch (supabaseErr) {
          console.error('[Checkout] ❌ All Supabase writes failed:', supabaseErr);
        }
      }

      // Always write to Dexie as local cache
      await db.sales.put(sale);
      await db.saleItems.bulkPut(saleItems);
      if (salePayments.length > 0) await db.salePayments.bulkPut(salePayments);
      await db.inventoryTransactions.bulkPut(inventoryTxs);

      // If Supabase write failed, queue for retry
      if (!supabaseSuccess) {
        console.warn('[Checkout] Queuing sale for sync retry');
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'sale',
          payload: { sale, saleItems, salePayments: salePayments.length > 0 ? salePayments : null },
          createdAt: Date.now(),
          status: 'pending',
        });
      }

      // ─── Customer balance update ────────────────────────────────────────
      if (customerId && amountPaid !== undefined && amountPaid !== subtotal) {
        const balanceDiff = subtotal - amountPaid;
        const customer = await db.customers.get(customerId);
        if (customer) {
          const newBalance = Number(customer.balance || 0) + balanceDiff;
          await db.customers.update(customerId, { balance: newBalance });
          if (isOnline) {
            await supabase.from('customers').update({ balance: newBalance }).eq('id', customerId);
          } else {
            await db.syncQueue.add({
              action: 'UPDATE',
              entity: 'customer',
              payload: { id: customerId, balance: newBalance },
              createdAt: Date.now(),
              status: 'pending',
            });
          }
        }
      }

      // ─── Serial unit status updates ─────────────────────────────────────
      if (serialUpdates.length > 0) {
        await db.itemUnits.bulkPut(serialUpdates);
        if (isOnline) {
          for (const update of serialUpdates) {
            await supabase.from('item_units').update({ status: 'SOLD' }).eq('id', update.id);
          }
        } else {
          for (const update of serialUpdates) {
            await db.syncQueue.add({
              action: 'UPDATE',
              entity: 'item_unit',
              payload: update,
              createdAt: Date.now(),
              status: 'pending',
            });
          }
        }
      }

      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      refreshInventory();
      return { success: true, receiptNumber };
    } catch (err) {
      console.error('Checkout error:', err);
      return { success: false };
    }
  };

  return { checkout };
};
