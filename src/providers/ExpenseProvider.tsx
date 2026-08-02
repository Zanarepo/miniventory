import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import { processSyncQueue } from '../services/syncService';
import { ExpenseContext } from '../contexts/ExpenseContext';
import type { Expense, ExpenseCategory } from '../types/expenses';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { business } = useBusiness();
  const { user, profile } = useAuth();
  const { isOnline } = useNetwork();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = business?.id;
  const currentUserId = profile?.id || user?.id;

  const seedLocalDefaultCategories = async () => {
    const defaults = [
      { name: 'Stock Purchase', description: 'Purchasing stock/inventory items', is_default: true },
      {
        name: 'Transportation',
        description: 'Logistics and transportation costs',
        is_default: true,
      },
      { name: 'Fuel', description: 'Generator or vehicle fuel', is_default: true },
      { name: 'Rent', description: 'Business premises rent', is_default: true },
      {
        name: 'Salaries & Wages',
        description: 'Employee salaries or daily wages',
        is_default: true,
      },
      { name: 'Electricity', description: 'Power and electricity utility bills', is_default: true },
      {
        name: 'Internet',
        description: 'Data bundles and internet subscriptions',
        is_default: true,
      },
      {
        name: 'Marketing',
        description: 'Advertising, flyers, or promo campaigns',
        is_default: true,
      },
      { name: 'Packaging', description: 'Bags, boxes, and wrapping materials', is_default: true },
      {
        name: 'Repairs & Maintenance',
        description: 'Fixing equipment or shop structures',
        is_default: true,
      },
      { name: 'Office Supplies', description: 'Stationery, pens, paper, etc.', is_default: true },
      { name: 'Miscellaneous', description: 'Other minor general expenses', is_default: true },
    ];
    for (const d of defaults) {
      const existing = await db.expenseCategories.where('name').equals(d.name).first();
      if (!existing) {
        await db.expenseCategories.put({
          id: crypto.randomUUID(),
          business_id: null,
          ...d,
        });
      }
    }
  };

  const refreshExpenses = useCallback(async () => {
    if (!businessId) {
      setExpenses([]);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure defaults are in Dexie
      await seedLocalDefaultCategories();

      if (isOnline) {
        await processSyncQueue();

        const [catRes, expRes] = await Promise.all([
          supabase
            .from('expense_categories')
            .select('*')
            .or(`business_id.eq.${businessId},business_id.is.null`),
          supabase
            .from('expenses')
            .select('*')
            .eq('business_id', businessId)
            .is('deleted_at', null)
            .order('expense_date', { ascending: false }),
        ]);

        if (!catRes.error && !expRes.error) {
          const fetchedCats = (catRes.data || []) as ExpenseCategory[];
          const fetchedExps = (expRes.data || []) as Expense[];

          // Merge unsynced items from offline queue to keep them visible
          const unsyncedItems = await db.syncQueue.where('entity').equals('expense').toArray();
          const unsyncedExps = unsyncedItems.map((item) => item.payload as Expense);

          const unsyncedCatItems = await db.syncQueue
            .where('entity')
            .equals('expense_category')
            .toArray();
          const unsyncedCats = unsyncedCatItems.map((item) => item.payload as ExpenseCategory);

          // Merge expenses
          const mergedExps = [...fetchedExps];
          unsyncedExps.forEach((ue) => {
            if (!mergedExps.some((e) => e.id === ue.id)) {
              mergedExps.push(ue);
            }
          });
          mergedExps.sort((a, b) => b.expense_date.localeCompare(a.expense_date));

          // Merge categories
          const mergedCats = [...fetchedCats];
          unsyncedCats.forEach((uc) => {
            if (!mergedCats.some((c) => c.id === uc.id)) {
              mergedCats.push(uc);
            }
          });

          setCategories(mergedCats);
          setExpenses(mergedExps);

          await db.expenseCategories.bulkPut(mergedCats);
          await db.expenses.bulkPut(mergedExps);
          setIsLoading(false);
          return;
        }
      }

      // Offline mode
      const allLocalCats = await db.expenseCategories.toArray();
      const localCatsFiltered = allLocalCats.filter(
        (c) => c.business_id === businessId || c.is_default,
      );

      const localExps = await db.expenses
        .where('business_id')
        .equals(businessId)
        .filter((e) => !e.deleted_at)
        .reverse()
        .sortBy('expense_date');

      setCategories(localCatsFiltered);
      setExpenses(localExps);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [businessId, isOnline]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshExpenses();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshExpenses]);

  // Operational KPI calculations
  const activeExpenses = useMemo(() => expenses.filter((e) => !e.deleted_at), [expenses]);

  const todayTotal = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return activeExpenses
      .filter((e) => e.expense_date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [activeExpenses]);

  const weeklyTotal = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return activeExpenses
      .filter((e) => new Date(e.expense_date) >= sevenDaysAgo)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [activeExpenses]);

  const monthlyTotal = useMemo(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    return activeExpenses
      .filter((e) => e.expense_date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [activeExpenses]);

  const largestCategory = useMemo(() => {
    const sums: { [key: string]: number } = {};
    activeExpenses.forEach((e) => {
      if (!e.category_id) return;
      sums[e.category_id] = (sums[e.category_id] || 0) + Number(e.amount);
    });
    let maxId = '';
    let maxAmt = 0;
    Object.entries(sums).forEach(([id, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        maxId = id;
      }
    });
    const cat = categories.find((c) => c.id === maxId);
    return cat ? cat.name : 'None';
  }, [activeExpenses, categories]);

  // Operations
  const createCategory = async (
    name: string,
    description?: string,
  ): Promise<ExpenseCategory | null> => {
    if (!businessId) return null;
    const newCat: ExpenseCategory = {
      id: crypto.randomUUID(),
      business_id: businessId,
      name,
      description: description || '',
      is_default: false,
    };
    setCategories((prev) => [...prev, newCat]);
    await db.expenseCategories.put(newCat);
    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'expense_category',
      payload: newCat,
      createdAt: Date.now(),
      status: 'pending',
    });
    if (isOnline) {
      await processSyncQueue();
    }
    return newCat;
  };

  const recordExpense = async (
    amount: number,
    description: string,
    expenseDate: string,
    paymentMethod: string,
    categoryId: string | null,
    receiptFile?: File,
  ): Promise<Expense | null> => {
    if (!businessId || !currentUserId) return null;

    let receiptUrl = '';
    if (receiptFile) {
      if (isOnline) {
        try {
          const fileExt = receiptFile.name.split('.').pop();
          const filePath = `${businessId}/${crypto.randomUUID()}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from('expense-receipts')
            .upload(filePath, receiptFile);
          if (!uploadErr) {
            const { data } = supabase.storage.from('expense-receipts').getPublicUrl(filePath);
            receiptUrl = data.publicUrl;
          }
        } catch (uploadFail) {
          console.error('Storage upload failed, queuing offline:', uploadFail);
          receiptUrl = 'offline-pending';
        }
      } else {
        receiptUrl = 'offline-pending';
      }
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      business_id: businessId,
      category_id: categoryId,
      amount,
      description,
      expense_date: expenseDate,
      payment_method: paymentMethod,
      receipt_url: receiptUrl,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    await db.expenses.put(newExpense);
    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'expense',
      payload: newExpense,
      createdAt: Date.now(),
      status: 'pending',
    });
    if (isOnline) {
      await processSyncQueue();
    }
    return newExpense;
  };

  const updateExpense = async (
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'business_id'>>,
  ): Promise<boolean> => {
    const now = new Date().toISOString();
    const updatedPayload = { ...updates, id, updated_at: now };
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? ({ ...e, ...updatedPayload } as Expense) : e)),
    );
    await db.expenses.update(id, updatedPayload);
    await db.syncQueue.add({
      action: 'UPDATE',
      entity: 'expense',
      payload: updatedPayload,
      createdAt: Date.now(),
      status: 'pending',
    });
    if (isOnline) {
      await processSyncQueue();
    }
    return true;
  };

  const softDeleteExpense = async (id: string): Promise<boolean> => {
    const now = new Date().toISOString();
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await db.expenses.update(id, { deleted_at: now, updated_at: now });
    await db.syncQueue.add({
      action: 'UPDATE',
      entity: 'expense',
      payload: { id, deleted_at: now, updated_at: now },
      createdAt: Date.now(),
      status: 'pending',
    });
    if (isOnline) {
      await processSyncQueue();
    }
    return true;
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        isLoading,
        error,
        todayTotal,
        weeklyTotal,
        monthlyTotal,
        largestCategory,
        createCategory,
        recordExpense,
        updateExpense,
        softDeleteExpense,
        refreshExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
