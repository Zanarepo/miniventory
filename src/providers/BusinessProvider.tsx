import React, { useEffect, useState, useCallback } from 'react';
import { BusinessContext } from '../contexts/BusinessContext';
import type { Business } from '../types/business';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import { processSyncQueue } from '../services/syncService';
import { SUPPORTED_CURRENCIES } from '../constants/businessCategories';

interface BusinessProviderProps {
  children: React.ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBusiness = useCallback(async () => {
    await Promise.resolve(); // Async microtask boundary prevents synchronous cascading setState warnings
    if (!user) {
      setBusiness(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (isOnline) {
        // CRITICAL: Push any pending offline edits to Supabase BEFORE querying cloud data!
        // This ensures local changes are never overwritten upon network restoration.
        await processSyncQueue();

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (!error && data) {
          const bizData = data as Business;
          setBusiness(bizData);
          await db.cachedBusinesses.put(bizData);
        } else if (!data) {
          const localBiz = await db.cachedBusinesses.where('owner_id').equals(user.id).first();
          setBusiness(localBiz || null);
        }
      } else {
        // Offline reading from Dexie cache
        const localBiz = await db.cachedBusinesses.where('owner_id').equals(user.id).first();
        setBusiness(localBiz || null);
      }
    } catch (err) {
      console.error('Error retrieving business profile:', err);
      const localBiz = await db.cachedBusinesses.where('owner_id').equals(user.id).first();
      setBusiness(localBiz || null);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusiness();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBusiness]);

  const createBusiness = async (
    data: Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>,
  ): Promise<{ error: Error | null; data: Business | null }> => {
    if (!user) {
      return { error: new Error('User not authenticated'), data: null };
    }

    const payload: Omit<Business, 'id' | 'created_at' | 'updated_at'> = {
      ...data,
      owner_id: user.id,
    };

    try {
      if (isOnline) {
        const { data: createdData, error } = await supabase
          .from('businesses')
          .insert([payload])
          .select()
          .single();

        if (error) {
          return { error: error as Error, data: null };
        }

        const newBiz = createdData as Business;
        setBusiness(newBiz);
        await db.cachedBusinesses.put(newBiz);
        return { error: null, data: newBiz };
      } else {
        const tempId = `offline-${Date.now()}`;
        const newBiz: Business = { ...payload, id: tempId, created_at: new Date().toISOString() };
        setBusiness(newBiz);
        await db.cachedBusinesses.put(newBiz);
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'business',
          payload: newBiz,
          createdAt: Date.now(),
          status: 'pending',
        });
        return { error: null, data: newBiz };
      }
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const updateBusiness = async (
    data: Partial<Business>,
  ): Promise<{ error: Error | null; data: Business | null }> => {
    if (!business || !user) {
      return { error: new Error('No active business to update'), data: null };
    }

    const updatedBiz: Business = { ...business, ...data, updated_at: new Date().toISOString() };
    setBusiness(updatedBiz);
    await db.cachedBusinesses.put(updatedBiz);

    try {
      if (isOnline && !business.id.startsWith('offline-')) {
        const { error } = await supabase.from('businesses').update(data).eq('id', business.id);
        if (error) return { error: error as Error, data: null };
        return { error: null, data: updatedBiz };
      } else {
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'business',
          payload: { id: business.id, ...data },
          createdAt: Date.now(),
          status: 'pending',
        });
        return { error: null, data: updatedBiz };
      }
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const getCurrencySymbol = useCallback((): string => {
    if (!business?.currency) return '₦';
    const match = SUPPORTED_CURRENCIES.find((c) => c.code === business.currency);
    return match ? match.symbol : business.currency;
  }, [business]);

  const value = {
    business,
    isLoading,
    createBusiness,
    updateBusiness,
    refreshBusiness: fetchBusiness,
    getCurrencySymbol,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};
