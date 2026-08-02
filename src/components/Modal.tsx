import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    lineHeight: 1,
    padding: '4px',
    transition: 'color var(--transition-fast), transform var(--transition-fast)',
    outline: 'none',
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`modal-content ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={headerStyle}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h3>
            <button
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="Close modal dialog"
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--text-main)')
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
              }
            >
              &times;
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
