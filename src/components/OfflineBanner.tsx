import React, { useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { WifiOff, X } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount } = useNetwork();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOnline) {
      timeoutId = setTimeout(() => setIsDismissed(false), 0);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  if (isDismissed) {
    return (
      <div
        onClick={() => setIsDismissed(false)}
        title={`Offline: ${pendingSyncCount} pending changes`}
        className="animate-pulse"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#d97706',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <WifiOff size={22} />
      </div>
    );
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
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <WifiOff size={18} />
        <span>You are currently offline.</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>
          Don't worry, you can continue working! Your changes ({pendingSyncCount} pending) will sync
          automatically when your connection returns.
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#d97706',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
};
