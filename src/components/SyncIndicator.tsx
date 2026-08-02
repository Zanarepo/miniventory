import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';

export const SyncIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingSyncCount, failedSyncCount, triggerSync } = useNetwork();

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  };

  if (!isOnline) {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          color: 'var(--text-muted)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
        }}
        title="Offline mode. Changes are saved locally."
      >
        <CloudOff size={16} />
        <span>Offline ({pendingSyncCount} pending)</span>
      </div>
    );
  }

  if (failedSyncCount > 0) {
    return (
      <button
        onClick={triggerSync}
        style={{
          ...baseStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderColor: 'rgba(239, 68, 68, 0.2)',
        }}
        title="Some synchronizations failed. Click to retry or view details."
      >
        <AlertCircle size={16} />
        <span>{failedSyncCount} Failed</span>
      </button>
    );
  }

  if (isSyncing) {
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          borderColor: 'rgba(245, 158, 11, 0.2)',
        }}
        title="Synchronizing with server..."
      >
        <RefreshCw size={16} style={{ animation: 'spin 2s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingSyncCount > 0) {
    return (
      <button
        onClick={triggerSync}
        style={{
          ...baseStyle,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          borderColor: 'rgba(245, 158, 11, 0.2)',
        }}
        title="Click to sync pending changes"
      >
        <Cloud size={16} />
        <span>{pendingSyncCount} to sync</span>
      </button>
    );
  }

  return (
    <div
      onClick={triggerSync}
      style={{
        ...baseStyle,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        borderColor: 'rgba(16, 185, 129, 0.2)',
      }}
      title="All changes synced. Click to pull latest."
    >
      <Cloud size={16} />
      <span>Synced</span>
    </div>
  );
};
