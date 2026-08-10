import { createContext } from 'react';
import type { Product } from '../types/inventory';
import type { PaymentMethod } from '../types/sales';

export interface CartItem {
  product: Product;
  quantity: number;
  custom_name?: string;
  custom_price?: number;
  is_discounted?: boolean;
  serials?: string[];
  overridden_serials?: { serial: string; reason: string; manager_pin: string }[];
}

export type ScanAction = {
  id: string;
  type: 'add' | 'remove';
  product_id: string;
  barcode_or_serial: string;
  is_serialized: boolean;
};

export interface CartContextType {
  cart: CartItem[];
  scanHistory: ScanAction[];
  itemCount: number;
  subtotal: number;
  totalCost: number;
  grossProfit: number;
  addToCart: (
    product: Product,
    quantity?: number,
    custom_name?: string,
    custom_price?: number,
    serials?: string[],
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemPrice: (productId: string, newPrice: number | null) => void;
  removeFromCart: (productId: string) => void;
  removeSerialFromCart: (productId: string, serial: string) => void;
  clearCart: () => void;
  processScan: (barcode: string) => Promise<{
    success: boolean;
    type?: 'duplicate' | 'sold' | 'not_found' | 'added';
    message?: string;
    product?: Product;
  }>;
  undoLastScan: () => void;
  overrideSerial: (
    barcode: string,
    pin: string,
    reason: string,
  ) => Promise<{ success: boolean; message?: string }>;
  checkout: (
    paymentMethod: PaymentMethod,
    customerId?: string,
    amountPaid?: number,
    salePaymentsInput?: { payment_method: PaymentMethod; amount: number }[],
  ) => Promise<{ success: boolean; receiptNumber?: string; message?: string }>;
}

export const CartContext = createContext<CartContextType | null>(null);
