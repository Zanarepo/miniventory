import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import { AlertTriangle } from 'lucide-react';

interface ManagerOverrideModalProps {
  isOpen: boolean;
  serial: string | null;
  productName: string;
  onClose: () => void;
  onSubmit: (pin: string, reason: string) => void;
}

export const ManagerOverrideModal: React.FC<ManagerOverrideModalProps> = ({
  isOpen,
  serial,
  productName,
  onClose,
  onSubmit,
}) => {
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin && reason && serial) {
      onSubmit(pin, reason);
      setPin('');
      setReason('');
    }
  };

  if (!serial) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manager Override">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div
          style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--brand-danger)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Item Previously Sold</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              The system indicates that <strong>{productName}</strong> with serial{' '}
              <strong>{serial}</strong> has already been sold.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Input
            label="Manager PIN"
            type="password"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter 4-digit PIN"
            autoFocus
          />
          <Input
            label="Override Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Returned item not synced"
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{
                flex: 1,
                backgroundColor: 'var(--brand-danger)',
                borderColor: 'var(--brand-danger)',
              }}
            >
              Force Add to Cart
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
