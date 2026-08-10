import React from 'react';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import type { CartItem } from '../../contexts/CartContext';

interface DiscountModalProps {
  discountItem: CartItem | null;
  setDiscountItem: (val: CartItem | null) => void;
  handleSaveDiscount: (e: React.FormEvent) => void;
  formatCurrency: (val: number) => string;
  currSymbol: string;
  discountPriceInput: string;
  setDiscountPriceInput: (val: string) => void;
  updateItemPrice: (productId: string, price: number | null) => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  discountItem,
  setDiscountItem,
  handleSaveDiscount,
  formatCurrency,
  currSymbol,
  discountPriceInput,
  setDiscountPriceInput,
  updateItemPrice,
}) => {
  return (
    <Modal isOpen={!!discountItem} onClose={() => setDiscountItem(null)} title="Apply Discount">
      <form
        onSubmit={handleSaveDiscount}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Original Unit Price:{' '}
          <strong>{formatCurrency(discountItem?.product.selling_price || 0)}</strong>
        </div>
        <Input
          label={`New Unit Price (${currSymbol})`}
          type="number"
          step="0.01"
          min="0"
          required
          value={discountPriceInput}
          onChange={(e) => setDiscountPriceInput(e.target.value)}
          helperText="Enter the discounted unit price for this item."
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <Button
            type="button"
            variant="outline"
            style={{ flex: 1 }}
            onClick={() => {
              setDiscountItem(null);
              setDiscountPriceInput('');
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" style={{ flex: 1 }}>
            Apply Discount
          </Button>
        </div>
        {discountItem?.is_discounted && (
          <Button
            type="button"
            variant="outline"
            style={{
              width: '100%',
              marginTop: '8px',
              color: 'var(--brand-danger)',
              borderColor: 'var(--brand-danger)',
            }}
            onClick={() => {
              if (discountItem) {
                updateItemPrice(discountItem.product.id, null);
                setDiscountItem(null);
              }
            }}
          >
            Remove Discount
          </Button>
        )}
      </form>
    </Modal>
  );
};
