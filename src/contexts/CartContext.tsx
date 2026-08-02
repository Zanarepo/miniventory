import { createContext } from 'react';
import type { Product } from '../types/inventory';
import type { PaymentMethod } from '../types/sales';

export interface CartItem {
  product: Product;
  quantity: number;
  custom_name?: string;
  custom_price?: number;
}

export interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  totalCost: number;
  grossProfit: number;
  addToCart: (product: Product, quantity?: number, custom_name?: string, custom_price?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: PaymentMethod) => Promise<{ success: boolean; receiptNumber?: string }>;
}

export const CartContext = createContext<CartContextType | null>(null);
