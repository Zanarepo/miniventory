import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal } from '../Modal';

interface PosCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const PosCameraScanner: React.FC<PosCameraScannerProps> = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'pos-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false,
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            // Optional: we can close the scanner after a successful scan,
            // or leave it open to scan multiple items.
            // Let's leave it open so they can scan rapidly.
          },
          () => {
            // ignore scan errors
          },
        );
      }, 100);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isOpen, onScan]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Camera Scanner">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '16px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          Point your camera at a product barcode or serial number to add it to the cart
          automatically.
        </p>
        <div id="pos-reader" style={{ width: '100%', maxWidth: '400px' }} />
      </div>
    </Modal>
  );
};
