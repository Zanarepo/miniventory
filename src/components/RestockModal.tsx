import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useInventory } from '../hooks/useInventory';
import type { ProductWithStock } from '../types/inventory';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { SerialScanner } from './SerialScanner';
import { useBusiness } from '../hooks/useBusiness';

export interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock;
}

export const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, product }) => {
  const { createRestockBatch, itemUnits } = useInventory();
  const { business } = useBusiness();

  const [quantity, setQuantity] = useState('1');
  const [costPrice, setCostPrice] = useState(String(product.cost_price || 0));
  const [restockType, setRestockType] = useState<'base' | 'bulk'>('base');

  const [scannedSerials, setScannedSerials] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
      setCostPrice(String(product.cost_price || 0));
      setRestockType('base');
      setScannedSerials([]);
      setError(null);
    }
  }, [isOpen, product]);

  const handleValidateSerial = async (serial: string) => {
    if (!business) return false;

    // Validate locally to ensure offline compatibility
    const existsLocally = itemUnits.some((u) => u.serial_barcode === serial);
    if (existsLocally) {
      return `Serial already exists in database.`;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    const cost = parseFloat(costPrice);
    if (isNaN(cost) || cost < 0) {
      setError('Invalid cost price.');
      return;
    }

    let qty = parseFloat(quantity);
    let finalCost = cost;
    let customRemarks: string | undefined = undefined;
    let finalSerials: string[] | undefined = undefined;

    if (product.is_serialized) {
      if (scannedSerials.length === 0) {
        setError('Please scan or import at least one serial number.');
        return;
      }
      qty = scannedSerials.length;
      finalSerials = scannedSerials;
    } else {
      if (isNaN(qty) || qty <= 0) {
        setError('Invalid quantity.');
        return;
      }
      if (restockType === 'bulk' && product.conversion_ratio && product.bulk_unit) {
        const inputQty = qty;
        qty = inputQty * product.conversion_ratio;
        finalCost = cost / product.conversion_ratio;
        customRemarks = `Restocked ${inputQty} ${product.bulk_unit} (${qty} ${product.unit} total)`;
      }
    }

    setIsSubmitting(true);
    const success = await createRestockBatch(
      product.id,
      qty,
      finalCost,
      finalSerials,
      customRemarks,
    );
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError('Failed to restock. Make sure all serials are globally unique.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Restock: ${product.product_name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {product.is_serialized ? (
          <SerialScanner
            scannedSerials={scannedSerials}
            setScannedSerials={setScannedSerials}
            error={error}
            setError={setError}
            onValidate={handleValidateSerial}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {product.bulk_unit && product.conversion_ratio ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="restockType"
                    checked={restockType === 'base'}
                    onChange={() => {
                      setRestockType('base');
                      setCostPrice(String(product.cost_price || 0));
                    }}
                  />
                  Base Unit ({product.unit})
                </label>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="restockType"
                    checked={restockType === 'bulk'}
                    onChange={() => {
                      setRestockType('bulk');
                      setCostPrice(
                        String(
                          product.bulk_cost_price || product.cost_price * product.conversion_ratio!,
                        ),
                      );
                    }}
                  />
                  Bulk Unit ({product.bulk_unit})
                </label>
              </div>
            ) : null}
            <Input
              label={
                restockType === 'bulk'
                  ? `Quantity to Add (${product.bulk_unit})`
                  : `Quantity to Add (${product.unit})`
              }
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        )}

        <Input
          label={
            restockType === 'bulk'
              ? `Cost Price per ${product.bulk_unit}`
              : `Cost Price per ${product.unit}`
          }
          type="number"
          min="0"
          step="0.01"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          required
        />

        {error && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              color: 'var(--brand-danger)',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
            }}
          >
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        <div className="form-action-row" style={{ marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={product.is_serialized && scannedSerials.length === 0}
            leftIcon={<CheckCircle size={16} />}
          >
            Confirm Restock{' '}
            {product.is_serialized && scannedSerials.length > 0 ? `(${scannedSerials.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
