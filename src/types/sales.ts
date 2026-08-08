export interface Sale {
  id: string;
  business_id: string;
  receipt_number: string;
  subtotal: number;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  payment_method: string;
  customer_id?: string;
  payment_status?: string;
  amount_paid?: number;
  created_by: string;
  created_at?: string;
}

export interface SaleWithItems extends Sale {
  productNames?: string;
  itemCount?: number;
  firstItemName?: string;
  hasDiscount?: boolean;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  line_total: number;
  line_profit: number;
  custom_name?: string;
  is_discounted?: boolean;
  is_voided?: boolean;
  created_at?: string;
}

export type PaymentMethod = 'CASH' | 'POS' | 'TRANSFER' | 'MOBILE_MONEY' | 'OTHER' | 'SPLIT';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'VOIDED';

export interface SalePayment {
  id: string;
  business_id: string;
  sale_id: string;
  amount: number;
  payment_method: PaymentMethod;
  recorded_by: string;
  created_at?: string;
}
