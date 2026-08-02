export interface Sale {
  id: string;
  business_id: string;
  receipt_number: string;
  subtotal: number;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  payment_method: string;
  created_by: string;
  created_at?: string;
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
  created_at?: string;
}

export type PaymentMethod = 'CASH' | 'POS' | 'TRANSFER' | 'MOBILE_MONEY' | 'OTHER';
