import { createContext } from 'react';
import type { Product } from '../types/inventory';
import type { PaymentMethod } from '../types/sales';

export interface CartItem {
  product: Product;
  quantity: number;
  custom_name?: string;
  custom_price?: number;
  is_discounted?: boolean;
}

export interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  totalCost: number;
  grossProfit: number;
  addToCart: (
    product: Product,
    quantity?: number,
    custom_name?: string,
    custom_price?: number,
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemPrice: (productId: string, newPrice: number | null) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (
    paymentMethod: PaymentMethod,
    customerId?: string,
    amountPaid?: number,
    salePaymentsInput?: { payment_method: PaymentMethod; amount: number }[],
  ) => Promise<{ success: boolean; receiptNumber?: string }>;
}

export const CartContext = createContext<CartContextType | null>(null);
