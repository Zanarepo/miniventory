import React from 'react';
import { Modal } from './Modal';
import { Share, PlusSquare, MoreVertical, MonitorDown, Download } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  // Basic device detection
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Install BizTrack App">
      <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Download size={32} />
        </div>

        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            margin: '0 0 8px',
            color: 'var(--text-main)',
          }}
        >
          Get the App on your Device
        </h3>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Your browser requires you to install the app manually. Follow these quick steps to add
          BizTrack to your home screen for easy access.
        </p>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
          }}
        >
          {isIOS ? (
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  margin: '0 0 16px',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              >
                iPhone / iPad Instructions
              </h4>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <Share size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    1. Tap the Share button
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    It's located at the bottom of your screen or top right corner in Safari.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <PlusSquare size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    2. Tap "Add to Home Screen"
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Scroll down the list of actions until you see this option.
                  </p>
                </div>
              </div>
            </div>
          ) : isAndroid ? (
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  margin: '0 0 16px',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              >
                Android Instructions
              </h4>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <MoreVertical size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    1. Tap the Browser Menu
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Tap the three dots in the top right corner of Chrome.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <MonitorDown size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    2. Tap "Install app"
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Or you might see "Add to Home Screen" instead.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  margin: '0 0 16px',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              >
                Desktop Instructions
              </h4>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <MonitorDown size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    Method 1: Address Bar Icon
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Click the install icon (monitor with a down arrow) on the far right side of your
                    browser's address bar.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#3b82f6',
                  }}
                >
                  <MoreVertical size={20} />
                </div>
                <div>
                  <p
                    style={{
                      margin: '0 0 4px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    Method 2: Browser Menu
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Click the 3 dots (⋮) in the top right, go to{' '}
                    <strong>Cast, save, and share</strong>, and click{' '}
                    <strong>Install BizTrack</strong> (or Open in BizTrack).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '24px', padding: '12px', fontWeight: 700 }}
        >
          Got it
        </button>
      </div>
    </Modal>
  );
};
