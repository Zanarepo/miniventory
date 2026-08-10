import { useCallback } from 'react';
import type { CartItem, ScanAction } from '../../contexts/CartContext';
import type { Product } from '../../types/inventory';
import { CART_STORAGE_KEY, SCAN_HISTORY_KEY } from './useCartState';

export const useCartActions = (
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setScanHistory: React.Dispatch<React.SetStateAction<ScanAction[]>>,
) => {
  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      custom_name?: string,
      custom_price?: number,
      serials?: string[],
    ) => {
      setCart((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            item.custom_name === custom_name &&
            item.custom_price === custom_price,
        );
        if (existing) {
          if (product.is_serialized) {
            const newSerials = Array.from(
              new Set([...(existing.serials || []), ...(serials || [])]),
            );
            return prev.map((item) =>
              item.product.id === product.id
                ? { ...item, serials: newSerials, quantity: newSerials.length }
                : item,
            );
          } else {
            return prev.map((item) =>
              item.product.id === product.id &&
              item.custom_name === custom_name &&
              item.custom_price === custom_price
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
        }

        if (product.is_serialized) {
          return [
            ...prev,
            {
              product,
              quantity: (serials || []).length,
              custom_name,
              custom_price,
              serials: serials || [],
            },
          ];
        }
        return [...prev, { product, quantity, custom_name, custom_price }];
      });
    },
    [setCart],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart((prev) => {
        const item = prev.find((i) => i.product.id === productId);
        if (item?.product.is_serialized) return prev; // Cannot manually adjust quantity of serialized items

        if (quantity <= 0) {
          return prev.filter((item) => item.product.id !== productId);
        }
        return prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
      });
    },
    [setCart],
  );

  const removeSerialFromCart = useCallback(
    (productId: string, serial: string) => {
      setCart((prev) => {
        const item = prev.find((i) => i.product.id === productId);
        if (!item || !item.product.is_serialized || !item.serials) return prev;

        const newSerials = item.serials.filter((s) => s !== serial);
        if (newSerials.length === 0) {
          return prev.filter((i) => i.product.id !== productId);
        }
        return prev.map((i) =>
          i.product.id === productId
            ? { ...i, serials: newSerials, quantity: newSerials.length }
            : i,
        );
      });
    },
    [setCart],
  );

  const updateItemPrice = useCallback(
    (productId: string, newPrice: number | null) => {
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
    },
    [setCart],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    },
    [setCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setScanHistory([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(SCAN_HISTORY_KEY);
  }, [setCart, setScanHistory]);

  return {
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    removeSerialFromCart,
    clearCart,
  };
};
