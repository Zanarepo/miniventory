import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { ScanBarcode, Camera, X, Scan } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export interface BarcodeScannerInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const BarcodeScannerInput: React.FC<BarcodeScannerInputProps> = ({
  value,
  onChange,
  label = 'Barcode',
  placeholder = 'Scan or type barcode',
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [useExternalScanner, setUseExternalScanner] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleScanSuccess = (barcode: string) => {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    onChange(trimmed);

    setSuccessMsg(`Scanned: ${trimmed}`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  useEffect(() => {
    if (showCamera) {
      scannerRef.current = new Html5QrcodeScanner(
        'single-reader',
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false,
      );

      scannerRef.current.render(
        (decodedText) => {
          handleScanSuccess(decodedText);
          setShowCamera(false);
        },
        () => {
          // ignore scan errors, they happen continuously until a barcode is found
        },
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [showCamera]);

  useEffect(() => {
    if (!useExternalScanner) return;
    let barcode = '';
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (barcode) {
          handleScanSuccess(barcode);
          barcode = '';
        }
        return;
      }

      if (e.key.length === 1) {
        barcode += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          barcode = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [useExternalScanner]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={useExternalScanner}
            onChange={(e) => {
              setUseExternalScanner(e.target.checked);
              if (e.target.checked) setShowCamera(false);
            }}
            style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
          />
          External Scanner
        </label>

        <button
          type="button"
          onClick={() => {
            setShowCamera(!showCamera);
            if (useExternalScanner) setUseExternalScanner(false);
          }}
          title={showCamera ? 'Close Camera' : 'Use Phone Camera'}
          style={{
            background: showCamera ? 'var(--brand-danger)' : 'var(--bg-card-alt)',
            color: showCamera ? 'white' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {showCamera ? <X size={18} /> : <Camera size={18} />}
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--brand-success)',
            padding: '8px 12px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <ScanBarcode size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {useExternalScanner && (
        <div
          style={{
            padding: '16px',
            background: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--brand-primary)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <Scan size={20} className="animate-pulse" />
            <span style={{ fontWeight: 600 }}>External Scanner Mode Active</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Scan an item to populate the barcode field.
          </p>
        </div>
      )}

      {showCamera && (
        <div
          style={{
            border: '2px solid var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div id="single-reader" style={{ width: '100%' }}></div>
        </div>
      )}

      {!useExternalScanner && !showCamera && (
        <Input
          label={label}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          leftIcon={<ScanBarcode size={17} />}
          placeholder={placeholder}
        />
      )}

      {(useExternalScanner || showCamera) && (
        <div style={{ marginTop: '8px' }}>
          <Input
            label={`${label} (Current Value)`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            leftIcon={<ScanBarcode size={17} />}
            readOnly={useExternalScanner}
          />
        </div>
      )}
    </div>
  );
};
