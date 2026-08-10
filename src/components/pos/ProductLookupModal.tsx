import React from 'react';
import { Modal } from '../Modal';
import { SearchInput } from '../SearchInput';
import { Button } from '../Button';
import { Plus } from 'lucide-react';
import type { ProductWithStock } from '../../types/inventory';
import type { CartItem } from '../../contexts/CartContext';

interface ProductLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredProducts: ProductWithStock[];
  cart: CartItem[];
  handleTapAdd: (product: ProductWithStock, isBulk?: boolean) => void;
  formatCurrency: (val: number) => string;
}

const modalProductListStyle: React.CSSProperties = {
  maxHeight: '400px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '16px',
};

const modalProductRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: 'var(--surface-color)',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  gap: '12px',
};

export const ProductLookupModal: React.FC<ProductLookupModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredProducts,
  cart,
  handleTapAdd,
  formatCurrency,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Product to Cart">
      <SearchInput
        placeholder="Type product name, SKU, or barcode..."
        value={searchQuery}
        onChange={(val) => setSearchQuery(val)}
      />

      <div style={modalProductListStyle}>
        {filteredProducts.map((p) => {
          // Find current quantity in cart to display remaining stock
          const cartItem = cart.find((item) => item.product.id === p.id);
          const qtyInCart = cartItem ? cartItem.quantity : 0;
          const remainingStock = p.current_stock - qtyInCart;

          return (
            <div key={p.id} style={modalProductRowStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                  {p.product_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Available Stock:{' '}
                  {remainingStock > 0 ? `${remainingStock} ${p.unit}` : 'Out of stock'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {p.bulk_unit ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        1 {p.bulk_unit}
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--brand-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {formatCurrency(Number(p.bulk_selling_price))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ height: '30px', padding: '0 8px', fontSize: '0.8rem' }}
                        onClick={() => handleTapAdd(p, true)}
                        disabled={remainingStock < (p.conversion_ratio || 1)}
                      >
                        + Bulk
                      </Button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        1 {p.unit}
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--brand-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {formatCurrency(Number(p.selling_price))}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ height: '30px', padding: '0 8px', fontSize: '0.8rem' }}
                        onClick={() => handleTapAdd(p, false)}
                        disabled={remainingStock <= 0}
                      >
                        + Unit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      style={{
                        fontWeight: 850,
                        color: 'var(--brand-primary)',
                        fontSize: '1.1rem',
                      }}
                    >
                      {formatCurrency(Number(p.selling_price))}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => handleTapAdd(p, false)}
                      disabled={remainingStock <= 0}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No products found
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
