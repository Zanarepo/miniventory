import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CartContext } from '../contexts/CartContext';
import type { CartItem } from '../contexts/CartContext';
import type { Product } from '../types/inventory';
import type { Sale, SaleItem, PaymentMethod } from '../types/sales';
import type { InventoryTransaction } from '../types/inventory';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { useInventory } from '../hooks/useInventory';
import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';

const CART_STORAGE_KEY = 'biztrack_cart_draft';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const { business } = useBusiness();
  const { profile, user } = useAuth();
  const { isOnline } = useNetwork();
  const { refreshInventory } = useInventory();

  const businessId = business?.id;
  const currentUserId = profile?.id || user?.id;

  const itemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.custom_price ?? Number(item.product.selling_price)) * item.quantity, 0),
    [cart],
  );

  const totalCost = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.product.cost_price) * item.quantity, 0),
    [cart],
  );

  const grossProfit = useMemo(() => subtotal - totalCost, [subtotal, totalCost]);

  const addToCart = useCallback((product: Product, quantity = 1, custom_name?: string, custom_price?: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.custom_name === custom_name && item.custom_price === custom_price);
      if (existing) {
        return prev.map((item) =>
          (item.product.id === product.id && item.custom_name === custom_name && item.custom_price === custom_price) ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { product, quantity, custom_name, custom_price }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
    });
  }, []);

  const updateItemPrice = useCallback((productId: string, newPrice: number | null) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          if (newPrice === null) {
            return { ...item, custom_price: undefined, is_discounted: false };
          }
          return { ...item, custom_price: newPrice, is_discounted: true };
        }
        return item;
      });
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const checkout = async (
    paymentMethod: PaymentMethod,
    customerId?: string,
    amountPaid?: number,
    salePaymentsInput?: { payment_method: PaymentMethod; amount: number }[]
  ): Promise<{ success: boolean; receiptNumber?: string }> => {
    if (!businessId || !currentUserId || cart.length === 0) {
      return { success: false };
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
        payment_status: amountPaid !== undefined 
          ? (amountPaid >= subtotal ? 'PAID' : (amountPaid > 0 ? 'PARTIAL' : 'UNPAID'))
          : 'PAID',
        amount_paid: amountPaid !== undefined ? amountPaid : subtotal,
        created_by: currentUserId,
        created_at: now,
      };

      const saleItems: SaleItem[] = cart.map((item) => {
        const sellingPrice = item.custom_price ?? Number(item.product.selling_price);
        const lineTotal = sellingPrice * item.quantity;
        const lineCost = Number(item.product.cost_price) * item.quantity;
        return {
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
          created_at: now,
        };
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

      const salePayments = salePaymentsInput?.map(sp => ({
        id: crypto.randomUUID(),
        business_id: businessId,
        sale_id: saleId,
        amount: sp.amount,
        payment_method: sp.payment_method,
        recorded_by: currentUserId,
        created_at: now,
      })) || [];

      // Store locally in Dexie immediately
      await db.sales.put(sale);
      await db.saleItems.bulkPut(saleItems);
      if (salePayments.length > 0) {
        await db.salePayments.bulkPut(salePayments);
      }
      await db.inventoryTransactions.bulkPut(inventoryTxs); // Keeps local UI stock in sync!

      // Update local customer balance for credit sales
      if (customerId && amountPaid !== undefined && amountPaid !== subtotal) {
        const balanceDiff = subtotal - amountPaid;
        const customer = await db.customers.get(customerId);
        if (customer) {
          await db.customers.update(customerId, {
            balance: Number(customer.balance || 0) + balanceDiff
          });
        }
      }

      if (isOnline) {
        const { error, data } = await supabase.rpc('process_offline_sale', {
          p_sale: sale,
          p_sale_items: saleItems,
          p_sale_payments: salePayments.length > 0 ? salePayments : null,
        });

        if (error || !data?.success) {
          console.error('Online checkout failed, falling back to offline queue', error);
          await db.syncQueue.add({
            action: 'CREATE',
            entity: 'sale',
            payload: { sale, saleItems, salePayments: salePayments.length > 0 ? salePayments : null },
            createdAt: Date.now(),
            status: 'pending',
          });
        }
      } else {
        // Offline: Add to sync queue for later
        await db.syncQueue.add({
        action: 'CREATE',
        entity: 'sale',
        payload: { sale, saleItems, salePayments: salePayments.length > 0 ? salePayments : null },
        createdAt: Date.now(),
        status: 'pending',
      });
      }

      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      refreshInventory(); // Trigger inventory provider to recalculate local stock
      return { success: true, receiptNumber };
    } catch (err) {
      console.error('Checkout error:', err);
      return { success: false };
    }
  };

  const value = {
    cart,
    itemCount,
    subtotal,
    totalCost,
    grossProfit,
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    clearCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
