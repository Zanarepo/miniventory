import React, { useEffect, useState } from 'react';
import { NetworkContext } from '../contexts/NetworkContext';
import { Toast } from '../components/Toast';
import { processSyncQueue } from '../services/syncService';
import { db } from '../lib/dexie';

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? window.navigator.onLine : true,
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'error' | 'success';
  } | null>(null);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(false);

  // Monitor pending offline queue size
  useEffect(() => {
    const checkQueue = async () => {
      try {
        const count = await db.syncQueue.where('status').equals('pending').count();
        setHasPendingSync(count > 0);
      } catch (err) {
        console.error('Error checking sync queue:', err);
      }
    };

    checkQueue();
    const interval = setInterval(checkQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setNotification({
        message: '🌐 Internet connectivity restored! Synchronizing offline edits...',
        type: 'info',
      });

      // Automatically flush offline edits when internet restores
      const synced = await processSyncQueue();
      if (synced > 0) {
        setNotification({
          message: `✅ Successfully synchronized ${synced} offline update${synced > 1 ? 's' : ''} to cloud database!`,
          type: 'success',
        });
      } else {
        setNotification({
          message: '🌐 Internet connectivity restored! Cloud connection active.',
          type: 'success',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotification({
        message: '⚠️ Internet offline! Your edits and records will save locally to device cache.',
        type: 'error',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check on mount if online
    if (typeof window !== 'undefined' && window.navigator.onLine) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, hasPendingSync }}>
      {children}
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          durationMs={5000}
        />
      )}
    </NetworkContext.Provider>
  );
};
