import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/dexie';
import type { Customer, InsertCustomer } from '../types/customers';
import { useBusiness } from './useBusiness';

export function useCustomers() {
  const { business } = useBusiness();
  const businessId = business?.id;

  const customers = useLiveQuery(
    () => {
      if (!businessId) return [];
      return db.customers
        .where('business_id')
        .equals(businessId)
        .sortBy('name');
    },
    [businessId],
    []
  );

  const addCustomer = async (customer: InsertCustomer) => {
    if (!businessId) throw new Error('No active business');

    const newCustomer = {
      ...customer,
      id: crypto.randomUUID(),
      business_id: businessId,
      balance: 0,
      created_at: new Date().toISOString(),
    };

    await db.customers.put(newCustomer);
    
    await db.syncQueue.add({
      action: 'CREATE',
      entity: 'customer',
      payload: newCustomer,
      createdAt: Date.now(),
      status: 'pending',
    });

    return newCustomer.id;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    await db.customers.update(id, updates);

    await db.syncQueue.add({
      action: 'UPDATE',
      entity: 'customer',
      payload: { id, ...updates },
      createdAt: Date.now(),
      status: 'pending',
    });
  };

  return {
    customers,
    addCustomer,
    updateCustomer,
  };
}
