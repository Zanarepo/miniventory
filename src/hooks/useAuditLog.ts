import { useCallback } from 'react';
import { db, type CachedAuditLog } from '../lib/dexie';
import { processSyncQueue } from '../services/syncService';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';

export interface AuditLogPayload {
  action: string;
  entity: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export const useAuditLog = () => {
  const { user } = useAuth();
  const { business } = useBusiness();

  const logAction = useCallback(
    async (payload: AuditLogPayload) => {
      // If not authenticated or no active business, we can't log this strictly to a business.
      if (!user || !business) {
        console.warn('Audit Log: Ignored because user or business is missing', payload);
        return;
      }

      try {
        const logRecord: CachedAuditLog = {
          id: crypto.randomUUID(),
          business_id: business.id,
          user_id: user.id,
          action: payload.action,
          entity: payload.entity,
          entity_id: payload.entityId,
          metadata: payload.metadata || {},
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          created_at: new Date().toISOString(),
          status: 'pending',
        };

        // 1. Store directly into Dexie IndexedDB first for offline resilience
        await db.auditLogs.put(logRecord);

        // 2. Queue for cloud synchronization
        await db.syncQueue.add({
          action: 'CREATE',
          entity: 'audit_log',
          payload: logRecord,
          createdAt: Date.now(),
          status: 'pending',
        });

        // 3. Immediately attempt background flush if connected
        if (typeof window !== 'undefined' && window.navigator.onLine) {
          await processSyncQueue();
        }
      } catch (err) {
        console.error('Audit log exception during IndexedDB caching:', err);
      }
    },
    [user, business],
  );

  return { logAction };
};
