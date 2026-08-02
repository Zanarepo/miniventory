import React, { useState, useEffect } from 'react';
import { db } from '../lib/dexie';
import { useNetwork } from '../context/NetworkContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

export const SyncCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isOnline, triggerSync, isSyncing } = useNetwork();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [failedItems, setFailedItems] = useState<any[]>([]);

  const loadFailedItems = async () => {
    const items = await db.syncQueue.where('status').equals('failed').toArray();
    setFailedItems(items);
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadFailedItems();
    }
  }, [isOpen]);

  const handleRetryAll = async () => {
    // Reset all failed items to pending and reset retry count
    for (const item of failedItems) {
      if (item.id) {
        await db.syncQueue.update(item.id, {
          status: 'pending',
          retryCount: 0,
          failedAt: undefined,
          reason: undefined,
        });
      }
    }
    await loadFailedItems();
    if (isOnline) {
      triggerSync();
    }
  };

  const handleDiscard = async (id: number) => {
    await db.syncQueue.delete(id);
    await loadFailedItems();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Synchronization Center">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Status Header */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {isOnline ? (
            <CheckCircle2 color="#10b981" size={24} />
          ) : (
            <AlertCircle color="var(--text-muted)" size={24} />
          )}
          <div>
            <h3
              style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}
            >
              {isOnline ? 'System Online' : 'System Offline'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {isOnline ? 'Connected to the cloud.' : 'Working in offline mode.'}
            </p>
          </div>
          {isOnline && (
            <div style={{ marginLeft: 'auto' }}>
              <Button
                onClick={triggerSync}
                isLoading={isSyncing}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw size={16} />}
              >
                Force Sync
              </Button>
            </div>
          )}
        </div>

        {/* Failed Items (Dead Letter Queue) */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                margin: 0,
              }}
            >
              Sync Issues
            </h3>
            {failedItems.length > 0 && (
              <Button onClick={handleRetryAll} size="sm" variant="primary" disabled={!isOnline}>
                Retry All
              </Button>
            )}
          </div>

          {failedItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                No synchronization issues found.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {failedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                        }}
                      >
                        {item.action}
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--text-main)',
                        }}
                      >
                        {item.entity}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        margin: 0,
                        marginBottom: '8px',
                      }}
                    >
                      Failed at:{' '}
                      {item.failedAt ? new Date(item.failedAt).toLocaleString() : 'Unknown'}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#ef4444',
                        margin: 0,
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        padding: '8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.reason || 'Unknown error'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDiscard(item.id!)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                    }}
                    title="Discard change permanently"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
