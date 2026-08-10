import React, { useState, useMemo } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { SearchInput } from '../SearchInput';
import { useInventory } from '../../hooks/useInventory';
import type { Product } from '../../types/inventory';
import { Check } from 'lucide-react';

interface SelectSerialModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (serials: string[]) => void;
}

export const SelectSerialModal: React.FC<SelectSerialModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const { itemUnits } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());

  // Reset state when modal opens for a new product
  React.useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedSerials(new Set());
    }
  }, [isOpen, product]);

  const availableUnits = useMemo(() => {
    if (!product) return [];
    return itemUnits.filter(
      (unit) => unit.product_id === product.id && unit.status === 'AVAILABLE',
    );
  }, [itemUnits, product]);

  const filteredUnits = useMemo(() => {
    if (!search) return availableUnits;
    return availableUnits.filter((unit) =>
      unit.serial_barcode?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [availableUnits, search]);

  const toggleSerial = (serial: string) => {
    setSelectedSerials((prev) => {
      const next = new Set(prev);
      if (next.has(serial)) {
        next.delete(serial);
      } else {
        next.add(serial);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedSerials.size > 0) {
      onConfirm(Array.from(selectedSerials));
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select IMEI / Serial`} className="max-w-md">
      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <strong>{product.product_name}</strong> is a unique item. Please select the specific units
          you are selling.
        </p>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search available IMEIs..."
          style={{ width: '100%', marginBottom: '16px' }}
        />

        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            background: 'var(--bg-card)',
          }}
        >
          {filteredUnits.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {availableUnits.length === 0
                ? 'No available units in stock.'
                : 'No units match your search.'}
            </div>
          ) : (
            filteredUnits.map((unit) => {
              const serial = unit.serial_barcode || 'Unknown';
              const isSelected = selectedSerials.has(serial);
              return (
                <div
                  key={unit.id}
                  onClick={() => toggleSerial(serial)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--brand-primary-light)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{serial}</div>
                  </div>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid var(--border-color)',
                      background: isSelected ? 'var(--brand-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={selectedSerials.size === 0}>
          Add {selectedSerials.size > 0 ? `(${selectedSerials.size})` : ''} to Cart
        </Button>
      </div>
    </Modal>
  );
};
