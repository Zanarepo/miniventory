import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount } = useNetwork();

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: '#d97706',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <WifiOff size={18} />
      <span>You are currently offline.</span>
      <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>
        Don't worry, you can continue working! Your changes ({pendingSyncCount} pending) will sync
        automatically when your connection returns.
      </span>
    </div>
  );
};
