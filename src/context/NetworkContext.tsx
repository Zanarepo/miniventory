/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { processSyncQueue, syncFromServer } from '../services/syncService';
import { db } from '../lib/dexie';
import { useLiveQuery } from 'dexie-react-hooks';

interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  failedSyncCount: number;
  triggerSync: () => Promise<void>;
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(
    localStorage.getItem('activeBusinessId') || null,
  );

  // Use dexie-react-hooks for real-time offline queue counts
  const pendingSyncCount = useLiveQuery(
    () => db.syncQueue.where('status').equals('pending').count(),
    [],
    0,
  );
  const failedSyncCount = useLiveQuery(
    () => db.syncQueue.where('status').equals('failed').count(),
    [],
    0,
  );

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      // 1. Upload local pending changes
      await processSyncQueue();

      // 2. Download server updates for the active business
      if (activeBusinessId) {
        await syncFromServer(activeBusinessId);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [activeBusinessId, isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-sync interval (every 60s when online)
    const interval = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingSyncCount,
        failedSyncCount,
        triggerSync,
        activeBusinessId,
        setActiveBusinessId,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
