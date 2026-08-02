import React, { useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext } from '../contexts/AuthContext';
import type { Profile } from '../types/auth';
import { supabase } from '../lib/supabase';
import { formatAuthIdentifier } from '../utils/authFormatter';
import { db } from '../lib/dexie';
import { processSyncQueue } from '../services/syncService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string, currentEmail: string) => {
    try {
      const isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;
      if (isOnline) {
        // Process any pending offline profile updates before fetching from cloud
        await processSyncQueue();

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          const prof = data as Profile;
          setProfile(prof);
          await db.cachedProfiles.put(prof);
        } else {
          const cached = await db.cachedProfiles.where('id').equals(userId).first();
          if (cached) {
            setProfile(cached);
          } else {
            const fallback = { id: userId, email: currentEmail || '' };
            setProfile(fallback);
          }
        }
      } else {
        // Load directly from Dexie IndexedDB cache when offline
        const cached = await db.cachedProfiles.where('id').equals(userId).first();
        setProfile(cached || { id: userId, email: currentEmail || '' });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      const cached = await db.cachedProfiles.where('id').equals(userId).first();
      setProfile(cached || { id: userId, email: currentEmail || '' });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id, currentSession.user.email ?? '');
        }
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, changedSession) => {
      if (mounted) {
        setSession(changedSession);
        setUser(changedSession?.user ?? null);
        if (changedSession?.user) {
          fetchProfile(changedSession.user.id, changedSession.user.email ?? '');
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (identifier: string, passwordOrPin?: string) => {
    const formattedEmail = formatAuthIdentifier(identifier);
    if (passwordOrPin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formattedEmail,
        password: passwordOrPin,
      });
      return { error: error as Error | null, user: data?.user };
    } else {
      const { data, error } = await supabase.auth.signInWithOtp({ email: formattedEmail });
      return { error: error as Error | null, user: data?.user };
    }
  };

  const signUp = async (
    identifier: string,
    passwordOrPin?: string,
    metadata?: {
      full_name?: string;
      phone?: string;
      security_question?: string;
      security_answer?: string;
      requested_role?: string;
    },
  ) => {
    const formattedEmail = formatAuthIdentifier(identifier);
    const defaultPassword = passwordOrPin || `BizTrack!${Math.random().toString(36).slice(-8)}A1`;

    const { error } = await supabase.auth.signUp({
      email: formattedEmail,
      password: defaultPassword,
      options: {
        data: metadata || {},
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(formatAuthIdentifier(email));
    return { error: error as Error | null };
  };

  const fetchSecurityQuestion = async (identifier: string) => {
    try {
      const formattedEmail = formatAuthIdentifier(identifier);
      const { data, error } = await supabase.rpc('get_security_question', {
        p_identifier: formattedEmail,
      });
      if (error) return { question: null, error: error as Error };
      return { question: (data as string) || null, error: null };
    } catch (err) {
      return { question: null, error: err as Error };
    }
  };

  const resetPinWithSecurityAnswer = async (identifier: string, answer: string, newPin: string) => {
    try {
      const formattedEmail = formatAuthIdentifier(identifier);
      const { data, error } = await supabase.rpc('reset_pin_with_security_answer', {
        p_identifier: formattedEmail,
        p_answer: answer,
        p_new_password: newPin,
      });
      if (error) return { success: false, error: error as Error };
      return { success: Boolean(data), error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  };

  const updateProfile = async (
    data: Partial<Profile>,
  ): Promise<{ error: Error | null; data: Profile | null }> => {
    if (!profile || !user) {
      return { error: new Error('No active profile to update'), data: null };
    }

    const updatedProf: Profile = { ...profile, ...data, updated_at: new Date().toISOString() };
    setProfile(updatedProf);
    await db.cachedProfiles.put(updatedProf);

    const isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;

    try {
      if (isOnline) {
        const { error } = await supabase.from('profiles').update(data).eq('id', profile.id);
        if (error) return { error: error as Error, data: null };
        return { error: null, data: updatedProf };
      } else {
        // Queue offline update for cloud sync when internet returns
        await db.syncQueue.add({
          action: 'UPDATE',
          entity: 'profile',
          payload: { id: profile.id, ...data },
          createdAt: Date.now(),
          status: 'pending',
        });
        return { error: null, data: updatedProf };
      }
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    fetchSecurityQuestion,
    resetPinWithSecurityAnswer,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
