import React from 'react';
import { CartContext } from '../contexts/CartContext';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { useInventory } from '../hooks/useInventory';

import { useCartState } from './cart/useCartState';
import { useCartActions } from './cart/useCartActions';
import { useCartScanner } from './cart/useCartScanner';
import { useCartCheckout } from './cart/useCartCheckout';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useBusiness();
  const { profile, user } = useAuth();
  const { isOnline } = useNetwork();
  const { refreshInventory, products, itemUnits } = useInventory();

  const businessId = business?.id;
  const currentUserId = profile?.id || user?.id;

  // 1. State & Computations
  const {
    cart,
    setCart,
    scanHistory,
    setScanHistory,
    itemCount,
    subtotal,
    totalCost,
    grossProfit,
  } = useCartState();

  // 2. Actions
  const {
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    removeSerialFromCart,
    clearCart,
  } = useCartActions(setCart, setScanHistory);

  // 3. Scanner Logic
  const { processScan, undoLastScan, overrideSerial } = useCartScanner(
    cart,
    setCart,
    setScanHistory,
    itemUnits,
    products,
    profile,
  );

  // 4. Checkout Logic
  const { checkout } = useCartCheckout(
    cart,
    setCart,
    subtotal,
    totalCost,
    grossProfit,
    businessId,
    currentUserId,
    itemUnits,
    isOnline,
    refreshInventory,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        scanHistory,
        itemCount,
        subtotal,
        totalCost,
        grossProfit,
        addToCart,
        updateQuantity,
        updateItemPrice,
        removeFromCart,
        removeSerialFromCart,
        clearCart,
        processScan,
        undoLastScan,
        overrideSerial,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
