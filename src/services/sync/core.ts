import { db } from '../../lib/dexie';

export let syncPromise: Promise<number> | null = null;
export let downloadPromise: Promise<boolean> | null = null;

export const setSyncPromise = (promise: Promise<number> | null) => {
  syncPromise = promise;
};

export const setDownloadPromise = (promise: Promise<boolean> | null) => {
  downloadPromise = promise;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleFailedSync = async (id: number, error: any) => {
  const item = await db.syncQueue.get(id);
  if (!item) return;
  const newRetryCount = (item.retryCount || 0) + 1;
  const errorReason = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));

  if (
    error?.code === '23503' ||
    errorReason.toLowerCase().includes('violates foreign key constraint') ||
    errorReason.toLowerCase().includes('foreign key violation')
  ) {
    console.warn(
      `Sync item ${id} permanently failed due to FK constraint. Dropping from queue. Reason: ${errorReason}`,
    );
    await db.syncQueue.delete(id);
    return;
  }

  if (newRetryCount > 10) {
    await db.syncQueue.update(id, {
      status: 'failed',
      retryCount: newRetryCount,
      failedAt: Date.now(),
      reason: errorReason,
    });
    console.warn(`Sync item ${id} permanently failed and moved to DLQ. Reason: ${errorReason}`);
  } else {
    await db.syncQueue.update(id, { status: 'pending', retryCount: newRetryCount });
  }
};
