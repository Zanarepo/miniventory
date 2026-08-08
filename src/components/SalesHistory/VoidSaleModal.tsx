import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import { CustomSelect } from '../CustomSelect';

interface VoidSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  voidReasonSelect: string;
  setVoidReasonSelect: (val: string) => void;
  customVoidReason: string;
  setCustomVoidReason: (val: string) => void;
}

export const VoidSaleModal: React.FC<VoidSaleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  voidReasonSelect,
  setVoidReasonSelect,
  customVoidReason,
  setCustomVoidReason,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Void Sale">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Are you sure you want to void this sale? This will return items to inventory and deduct
          any unpaid amount from the customer balance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reason for Voiding</label>
          <CustomSelect
            value={voidReasonSelect}
            onChange={setVoidReasonSelect}
            options={[
              { value: 'Customer cancelled', label: 'Customer cancelled' },
              { value: 'Entered wrong amount/items', label: 'Entered wrong amount/items' },
              { value: 'Duplicate entry', label: 'Duplicate entry' },
              { value: 'Other', label: 'Other (Specify)' },
            ]}
          />
        </div>

        {voidReasonSelect === 'Other' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Custom Reason</label>
            <Input
              placeholder="Type custom reason here..."
              autoFocus
              value={customVoidReason}
              onChange={(e) => setCustomVoidReason(e.target.value)}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: 'var(--brand-danger)', borderColor: 'var(--brand-danger)' }}
            onClick={onConfirm}
          >
            Confirm Void
          </Button>
        </div>
      </div>
    </Modal>
  );
};
