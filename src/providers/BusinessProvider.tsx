import React, { useEffect, useState, useCallback } from 'react';
import { BusinessContext } from '../contexts/BusinessContext';
import type { Business, BusinessRole, BusinessMember } from '../types/business';
import { useAuth } from '../hooks/useAuth';
import { useNetwork } from '../hooks/useNetwork';
import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import { processSyncQueue } from '../services/sync';
import { SUPPORTED_CURRENCIES } from '../constants/businessCategories';

interface BusinessProviderProps {
  children: React.ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const [business, setBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentRole, setCurrentRole] = useState<BusinessRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [prevUserId, setPrevUserId] = useState<string | undefined>(user?.id);

  const loadLocalBusinesses = useCallback(async (userId: string) => {
    // We only have the locally cached businesses
    // Note: since dexie cachedBusinesses doesn't strictly track membership in local queries
    // unless we query businessMembers, we do a join locally.
    const mems = await db.businessMembers.where('user_id').equals(userId).toArray();
    let bizData: Business[];

    if (mems.length > 0) {
      const bizIds = mems.map((m) => m.business_id);
      bizData = await db.cachedBusinesses.where('id').anyOf(bizIds).toArray();
    } else {
      // Fallback for pre-RBAC legacy cached data
      bizData = await db.cachedBusinesses.where('owner_id').equals(userId).toArray();
    }

    setBusinesses(bizData);
    if (bizData.length > 0) {
      const savedBizId = localStorage.getItem('miniventory_active_business_id');
      let activeBiz = bizData.find((b) => b.id === savedBizId);
      if (!activeBiz) activeBiz = bizData[0];
      setBusiness(activeBiz);
      const activeMem = mems.find((m) => m.business_id === activeBiz?.id);
      setCurrentRole(activeMem ? activeMem.role : 'owner');
    } else {
      setBusiness(null);
      setCurrentRole(null);
    }
  }, []);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setIsLoading(true);
  }

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
        await processSyncQueue();

        const { data: members } = await supabase
          .from('business_members')
          .select('*')
          .eq('user_id', user.id);

        const mems = (members as BusinessMember[]) || [];

        // Rely on PostgreSQL Row Level Security (RLS) to automatically filter
        // businesses to only those the user owns or is a member of.
        const { data, error } = await supabase.from('businesses').select('*');

        if (!error && data && data.length > 0) {
          const bizData = data as Business[];

          setBusinesses(bizData);
          await db.cachedBusinesses.bulkPut(bizData);
          await db.businessMembers.bulkPut(mems);

          // Get last active business from localStorage, or default to first
          const savedBizId = localStorage.getItem('miniventory_active_business_id');
          let activeBiz = bizData.find((b) => b.id === savedBizId);
          if (!activeBiz) activeBiz = bizData[0];

          setBusiness(activeBiz);
          const activeMem = mems.find((m) => m.business_id === activeBiz?.id);
          setCurrentRole(activeMem ? activeMem.role : 'owner'); // default fallback
        } else {
          // If they have no businesses, check if they have a pending invite saved locally
          const pendingInviteBusinessId = localStorage.getItem(
            'miniventory_pending_invite_business_id',
          );
          if (pendingInviteBusinessId) {
            // Attempt to accept it
            const { data: rpcData, error: rpcError } = await supabase.rpc('accept_email_invite', {
              p_business_id: pendingInviteBusinessId,
            });

            // Clear it regardless so we don't loop endlessly if it fails
            localStorage.removeItem('miniventory_pending_invite_business_id');

            if (!rpcError && rpcData?.success) {
              // Reload page to pick up newly joined businesses and reset context
              window.location.reload();
              return;
            }
          }

          // Fallback to local
          loadLocalBusinesses(user.id);
        }
      } else {
        loadLocalBusinesses(user.id);
      }
    } catch (err) {
      console.error('Error retrieving business profile:', err);
      loadLocalBusinesses(user.id);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline, loadLocalBusinesses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusiness();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBusiness]);

  useEffect(() => {
    if (!user || !business) return;

    // Listen for role changes for the current user in the active business
    const roleSubscription = supabase
      .channel('public:business_members')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_members',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.business_id === business.id) {
            setCurrentRole(payload.new.role);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roleSubscription);
    };
  }, [user, business]);

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

  const switchBusiness = async (businessId: string) => {
    const selected = businesses.find((b) => b.id === businessId);
    if (selected) {
      localStorage.setItem('miniventory_active_business_id', businessId);
      setBusiness(selected);
      // Fetch role locally
      if (user) {
        const mem = await db.businessMembers
          .where({ business_id: businessId, user_id: user.id })
          .first();
        setCurrentRole(mem ? mem.role : 'owner');
      }
    }
  };

  const value = {
    business,
    businesses,
    currentRole,
    isLoading,
    createBusiness,
    updateBusiness,
    refreshBusiness: fetchBusiness,
    switchBusiness,
    getCurrencySymbol,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};
