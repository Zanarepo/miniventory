import { useState, useMemo, useEffect } from 'react';
import type { CartItem, ScanAction } from '../../contexts/CartContext';

export const CART_STORAGE_KEY = 'miniventory_cart_draft';
export const SCAN_HISTORY_KEY = 'miniventory_scan_history';

export const useCartState = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [scanHistory, setScanHistory] = useState<ScanAction[]>(() => {
    try {
      const saved = localStorage.getItem(SCAN_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(scanHistory));
  }, [scanHistory]);

  const itemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc + (item.custom_price ?? Number(item.product.selling_price)) * item.quantity,
        0,
      ),
    [cart],
  );

  const totalCost = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.product.cost_price) * item.quantity, 0),
    [cart],
  );

  const grossProfit = useMemo(() => subtotal - totalCost, [subtotal, totalCost]);

  return {
    cart,
    setCart,
    scanHistory,
    setScanHistory,
    itemCount,
    subtotal,
    totalCost,
    grossProfit,
  };
};
