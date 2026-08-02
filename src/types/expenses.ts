export interface ExpenseCategory {
  id: string;
  business_id: string | null; // NULL for global default categories
  name: string;
  description?: string;
  is_default: boolean;
  created_at?: string;
}

export interface Expense {
  id: string;
  business_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  expense_date: string; // ISO date string (YYYY-MM-DD)
  payment_method: string; // CASH, POS, TRANSFER, MOBILE_MONEY, OTHER
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
