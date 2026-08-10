import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { ScanBarcode, Plus, Trash2, FileText, Camera, X, Scan } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export interface SerialScannerProps {
  scannedSerials: string[];
  setScannedSerials: React.Dispatch<React.SetStateAction<string[]>>;
  error?: string | null;
  setError: (err: string | null) => void;
  onValidate?: (serial: string) => Promise<boolean | string>;
}

export const SerialScanner: React.FC<SerialScannerProps> = ({
  scannedSerials,
  setScannedSerials,
  setError,
  onValidate,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'paste'>('scan');
  const [currentScan, setCurrentScan] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [useExternalScanner, setUseExternalScanner] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleAddSerial = React.useCallback(
    async (serial: string) => {
      const trimmed = serial.trim();
      if (!trimmed) return;

      // Quick synchronous check for existing items in local state
      if (scannedSerials.includes(trimmed)) {
        setError(`Item already exists: ${trimmed}`);
        setSuccessMsg(null);
        return;
      }

      if (onValidate) {
        setIsValidating(true);
        setError(null);
        const validationResult = await onValidate(trimmed);
        setIsValidating(false);

        if (validationResult !== true) {
          setError(
            typeof validationResult === 'string'
              ? validationResult
              : `Validation failed for ${trimmed}`,
          );
          setSuccessMsg(null);
          return;
        }
      }

      setScannedSerials((prev) => {
        // Check again just in case it was added while validating
        if (prev.includes(trimmed)) {
          setError(`Item already exists: ${trimmed}`);
          setSuccessMsg(null);
          return prev;
        }
        setError(null);
        setSuccessMsg(`Added: ${trimmed}`);
        setTimeout(() => setSuccessMsg(null), 2500);
        return [...prev, trimmed];
      });
    },
    [scannedSerials, onValidate, setError, setScannedSerials],
  );

  useEffect(() => {
    if (showCamera) {
      // Ensure the element exists before initializing
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false,
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            handleAddSerial(decodedText);
            // Optional: we can automatically pause or close camera on success
          },
          () => {
            // ignore scan errors, they happen continuously until a barcode is found
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
  }, [showCamera, handleAddSerial]);

  useEffect(() => {
    if (!useExternalScanner) return;
    let barcode = '';
    let timeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (barcode) {
          handleAddSerial(barcode);
          barcode = '';
        }
        return;
      }

      // We only care about single characters
      if (e.key.length === 1) {
        barcode += e.key;
        clearTimeout(timeout);
        // Barcode scanners act as very fast keyboards.
        // If > 100ms elapses between keystrokes, assume it's human typing and reset.
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

  const handleScanSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    await handleAddSerial(currentScan);
    setCurrentScan('');
  };

  const handlePasteSubmit = async () => {
    if (!pasteContent.trim()) return;

    const newSerials = pasteContent
      .split(/[\n,\t]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Filter local duplicates first
    const uniqueLocally = newSerials.filter((s) => !scannedSerials.includes(s));

    let toAdd: string[] = [];

    if (onValidate) {
      setIsValidating(true);
      setError(null);
      for (const s of uniqueLocally) {
        const validationResult = await onValidate(s);
        if (validationResult === true) {
          toAdd.push(s);
        } else {
          setError(
            typeof validationResult === 'string'
              ? validationResult
              : `Validation failed for some items.`,
          );
        }
      }
      setIsValidating(false);
    } else {
      toAdd = uniqueLocally;
    }

    if (toAdd.length > 0) {
      setScannedSerials((prev) => {
        const reallyUnique = toAdd.filter((s) => !prev.includes(s));
        return [...prev, ...reallyUnique];
      });
      setSuccessMsg(`Added ${toAdd.length} items`);
      setTimeout(() => setSuccessMsg(null), 2500);
    }

    setPasteContent('');
    setActiveTab('scan');
  };

  const removeSerial = (serial: string) => {
    setScannedSerials(scannedSerials.filter((s) => s !== serial));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom:
              activeTab === 'scan' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'scan' ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Scan Serials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom:
              activeTab === 'paste' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            color: activeTab === 'paste' ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Bulk Paste
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                You don't need to click anything. Just scan your items and they will be added
                automatically!
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
              <div id="reader" style={{ width: '100%' }}></div>
            </div>
          )}

          {!useExternalScanner && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Scanner / Manual Entry"
                  type="text"
                  value={currentScan}
                  onChange={(e) => setCurrentScan(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleScanSubmit(e);
                    }
                  }}
                  autoFocus={!showCamera && !useExternalScanner}
                  leftIcon={<ScanBarcode size={17} />}
                  placeholder="Scan or type IMEI/SN"
                  disabled={isValidating}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                <Button
                  type="button"
                  onClick={() => handleScanSubmit()}
                  variant="secondary"
                  leftIcon={<Plus size={16} />}
                  isLoading={isValidating}
                  disabled={!currentScan.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
            Paste Serials (one per line, comma or tab separated)
          </label>
          <textarea
            className="input-field"
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            style={{
              minHeight: '150px',
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontFamily: 'monospace',
            }}
            placeholder="IMEI-1001&#10;IMEI-1002&#10;IMEI-1003"
          />
          <Button
            type="button"
            onClick={handlePasteSubmit}
            variant="secondary"
            leftIcon={<FileText size={16} />}
            isLoading={isValidating}
            disabled={!pasteContent.trim()}
          >
            Process List
          </Button>
        </div>
      )}

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '8px',
          background: 'var(--bg-card)',
        }}
      >
        {scannedSerials.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ScanBarcode size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <br />
            No serials scanned yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--brand-primary)',
              }}
            >
              <span>Total Added:</span>
              <span>{scannedSerials.length} item(s)</span>
            </div>
            {scannedSerials.map((serial) => (
              <div
                key={serial}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{serial}</span>
                <button
                  type="button"
                  onClick={() => removeSerial(serial)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-danger)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
