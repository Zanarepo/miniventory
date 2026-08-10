import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type { Expense, ExpenseCategory } from '../../../types/expenses';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleExpenseCategorySync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as ExpenseCategory;
    const { error } = await supabase.from('expense_categories').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleExpenseSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as Expense;
    const { error } = await supabase.from('expenses').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<Expense> & { id: string };
    const { error } = await supabase.from('expenses').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
