import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type { Profile } from '../../../types/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleProfileSync = async (item: any): Promise<boolean> => {
  if (item.action === 'UPDATE') {
    const payload = item.payload as Partial<Profile> & { id: string };
    const { error } = await supabase.from('profiles').update(payload).eq('id', payload.id);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
