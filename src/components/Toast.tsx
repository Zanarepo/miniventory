import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  durationMs = 4000,
}) => {
  useEffect(() => {
    if (durationMs && onClose) {
      const timer = setTimeout(() => onClose(), durationMs);
      return () => clearTimeout(timer);
    }
  }, [durationMs, onClose]);

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    minWidth: '280px',
    maxWidth: '420px',
    padding: '16px 22px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor:
      type === 'error' ? 'var(--brand-danger, #e11d48)' : 'var(--brand-primary, #059669)',
    boxShadow: '0 10px 25px hsla(158, 85%, 32%, 0.35), var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2000,
    color: '#ffffff',
    border: 'none',
  };

  return (
    <div className="animate-fade-in" style={toastStyle} role="alert">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.01em' }}>
          {message}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            marginLeft: '16px',
            fontSize: '1.4rem',
            lineHeight: 1,
            fontWeight: 'bold',
            transition: 'color var(--transition-fast)',
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = '#ffffff')}
          onMouseOut={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.85)')
          }
        >
          &times;
        </button>
      )}
    </div>
  );
};
