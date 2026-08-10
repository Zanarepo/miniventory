import { useEffect, useState, useCallback } from 'react';
import { useCart } from './useCart';

interface UseScannerProps {
  onScanStatus?: (
    type: 'duplicate' | 'sold' | 'not_found' | 'added',
    message: string,
    product?: any,
    barcode?: string,
  ) => void;
}

export const useScanner = ({ onScanStatus }: UseScannerProps = {}) => {
  const { processScan } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const result = await processScan(barcode);
        if (onScanStatus) {
          onScanStatus(
            result.type || (result.success ? 'added' : 'not_found'),
            result.message || '',
            result.product,
            barcode,
          );
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [processScan, isProcessing, onScanStatus],
  );

  useEffect(() => {
    let barcodeBuffer = '';
    let timeoutId: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer) {
          handleBarcodeScanned(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        // Normal character
        barcodeBuffer += e.key;
        if (timeoutId) clearTimeout(timeoutId);
        // Scanners type fast. Reset buffer if slow typing (>100ms between strokes).
        timeoutId = setTimeout(() => {
          barcodeBuffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleBarcodeScanned]);

  return { handleBarcodeScanned };
};
