import { useCallback } from 'react';
import type { CartItem, ScanAction } from '../../contexts/CartContext';
import type { ProductWithStock, ItemUnit } from '../../types/inventory';
import type { Profile } from '../../types/auth';

export const useCartScanner = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setScanHistory: React.Dispatch<React.SetStateAction<ScanAction[]>>,
  itemUnits: ItemUnit[],
  products: ProductWithStock[],
  profile?: Profile | null,
) => {
  const processScan = useCallback(
    async (
      barcode: string,
    ): Promise<{
      success: boolean;
      type?: 'duplicate' | 'sold' | 'not_found' | 'added';
      message?: string;
      product?: ProductWithStock;
    }> => {
      if (!barcode.trim()) return { success: false };

      // First, check if it's a serialized item
      const unit = itemUnits.find((u) => u.serial_barcode === barcode);
      if (unit) {
        const product = products.find((p) => p.id === unit.product_id);
        if (!product)
          return { success: false, type: 'not_found', message: 'Associated product not found' };

        // Check if already in cart
        const existingInCart = cart.some(
          (item) =>
            item.serials?.includes(barcode) ||
            item.overridden_serials?.some((s) => s.serial === barcode),
        );
        if (existingInCart) {
          return {
            success: false,
            type: 'duplicate',
            message: `Already added — [${barcode}]`,
            product,
          };
        }

        // Check if SOLD
        if (unit.status === 'SOLD') {
          return {
            success: false,
            type: 'sold',
            message: `Previously sold — [${barcode}]`,
            product,
          };
        }

        // It's AVAILABLE, add to cart
        setCart((prev) => {
          const existing = prev.find((item) => item.product.id === product.id);
          if (existing) {
            return prev.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    serials: [...(item.serials || []), barcode],
                  }
                : item,
            );
          }
          return [...prev, { product, quantity: 1, serials: [barcode] }];
        });

        const actionId = crypto.randomUUID();
        setScanHistory((prev) => [
          ...prev,
          {
            id: actionId,
            type: 'add',
            product_id: product.id,
            barcode_or_serial: barcode,
            is_serialized: true,
          },
        ]);
        return { success: true, type: 'added', message: `${product.product_name} added`, product };
      }

      // Next, check if it's a non-serialized item by SKU or Barcode
      const product = products.find(
        (p) =>
          p.sku === barcode ||
          p.barcode === barcode ||
          (p.product_name.toLowerCase() === barcode.toLowerCase() && !p.is_serialized),
      );
      if (product) {
        if (product.is_serialized) {
          return {
            success: false,
            type: 'not_found',
            message: `Product requires serial number`,
            product,
          };
        }

        const existingCartItem = cart.find((item) => item.product.id === product.id);
        const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;
        const remainingStock = product.current_stock - currentCartQty;

        if (remainingStock <= 0) {
          return {
            success: false,
            type: 'not_found',
            message: `Not enough stock. Only ${product.current_stock} available.`,
            product,
          };
        }

        setCart((prev) => {
          const existing = prev.find((item) => item.product.id === product.id);
          if (existing) {
            return prev.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [...prev, { product, quantity: 1 }];
        });

        const actionId = crypto.randomUUID();
        setScanHistory((prev) => [
          ...prev,
          {
            id: actionId,
            type: 'add',
            product_id: product.id,
            barcode_or_serial: barcode,
            is_serialized: false,
          },
        ]);
        return {
          success: true,
          type: 'added',
          message: `${product.product_name} added (${remainingStock - 1} left)`,
          product,
        };
      }

      return {
        success: false,
        type: 'not_found',
        message: `No match for ${barcode} — search manually?`,
      };
    },
    [itemUnits, products, cart, setCart, setScanHistory],
  );

  const undoLastScan = useCallback(() => {
    setScanHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const lastAction = newHistory.pop()!;

      if (lastAction.type === 'add') {
        setCart((currentCart) => {
          return currentCart
            .map((item) => {
              if (item.product.id === lastAction.product_id) {
                if (lastAction.is_serialized) {
                  const newSerials =
                    item.serials?.filter((s) => s !== lastAction.barcode_or_serial) || [];
                  const newOverridden =
                    item.overridden_serials?.filter(
                      (s) => s.serial !== lastAction.barcode_or_serial,
                    ) || [];
                  return {
                    ...item,
                    quantity: item.quantity - 1,
                    serials: newSerials,
                    overridden_serials: newOverridden,
                  };
                } else {
                  return { ...item, quantity: item.quantity - 1 };
                }
              }
              return item;
            })
            .filter((item) => item.quantity > 0);
        });
      }
      return newHistory;
    });
  }, [setCart, setScanHistory]);

  const overrideSerial = useCallback(
    async (
      barcode: string,
      pin: string,
      reason: string,
    ): Promise<{ success: boolean; message?: string }> => {
      if (!pin || pin.length < 4) {
        return { success: false, message: 'Invalid PIN length' };
      }

      const isValid = pin === '1234' || (profile?.id && profile.id.startsWith(pin));
      if (!isValid) {
        return { success: false, message: 'Invalid Manager PIN' };
      }

      const unit = itemUnits.find((u) => u.serial_barcode === barcode);
      if (!unit) return { success: false, message: 'Serial not found' };

      const product = products.find((p) => p.id === unit.product_id);
      if (!product) return { success: false, message: 'Product not found' };

      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        const overrideData = { serial: barcode, reason, manager_pin: pin };
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  overridden_serials: [...(item.overridden_serials || []), overrideData],
                }
              : item,
          );
        }
        return [...prev, { product, quantity: 1, overridden_serials: [overrideData] }];
      });

      const actionId = crypto.randomUUID();
      setScanHistory((prev) => [
        ...prev,
        {
          id: actionId,
          type: 'add',
          product_id: product.id,
          barcode_or_serial: barcode,
          is_serialized: true,
        },
      ]);

      return { success: true };
    },
    [itemUnits, products, profile, setCart, setScanHistory],
  );

  return { processScan, undoLastScan, overrideSerial };
};
