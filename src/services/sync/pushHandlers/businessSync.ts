import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type { Business } from '../../../types/business';
import type { Customer } from '../../../types/customers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleBusinessSync = async (item: any): Promise<boolean> => {
  if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<Business> & { id: string };
    const { error } = await supabase.from('businesses').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'CREATE') {
    const payload = item.payload as Business;
    const tempId = payload.id;
    const cleanPayload: Partial<Business> = { ...payload };
    delete cleanPayload.id;
    const { data, error } = await supabase
      .from('businesses')
      .insert([cleanPayload as Business])
      .select()
      .single();
    if (!error && data) {
      await db.cachedBusinesses.delete(tempId);
      await db.cachedBusinesses.put(data as Business);
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleCustomerSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as Customer;
    const { error } = await supabase.from('customers').insert([payload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  } else if (item.action === 'UPDATE') {
    const payload = item.payload as Customer;
    const { error } = await supabase.from('customers').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
