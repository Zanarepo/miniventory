import { createContext } from 'react';
import type { Expense, ExpenseCategory } from '../types/expenses';

export interface ExpenseContextType {
  expenses: Expense[];
  categories: ExpenseCategory[];
  isLoading: boolean;
  error: string | null;
  todayTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  largestCategory: string;
  createCategory: (name: string, description?: string) => Promise<ExpenseCategory | null>;
  recordExpense: (
    amount: number,
    description: string,
    expenseDate: string,
    paymentMethod: string,
    categoryId: string | null,
    receiptFile?: File,
  ) => Promise<Expense | null>;
  updateExpense: (
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'business_id'>>,
  ) => Promise<boolean>;
  softDeleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
}

export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
