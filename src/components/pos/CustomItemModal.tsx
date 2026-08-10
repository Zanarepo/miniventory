import React from 'react';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleAddCustomItem: (e: React.FormEvent) => void;
  customItemName: string;
  setCustomItemName: (val: string) => void;
  customItemAmount: string;
  setCustomItemAmount: (val: string) => void;
  currSymbol: string;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  handleAddCustomItem,
  customItemName,
  setCustomItemName,
  customItemAmount,
  setCustomItemAmount,
  currSymbol,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Item">
      <form
        onSubmit={handleAddCustomItem}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}
      >
        <Input
          label="Item Name"
          placeholder="e.g. Mixed Meat, Special Order"
          value={customItemName}
          onChange={(e) => setCustomItemName(e.target.value)}
          required
          autoFocus
        />
        <Input
          label={`Total Amount (${currSymbol})`}
          type="number"
          min="0"
          step="any"
          placeholder="e.g. 1500"
          value={customItemAmount}
          onChange={(e) => setCustomItemAmount(e.target.value)}
          required
        />
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}
        >
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add to Cart
          </Button>
        </div>
      </form>
    </Modal>
  );
};
