import React from 'react';
import { Tag, Trash2 } from 'lucide-react';
import type { CartItem } from '../../contexts/CartContext';
import type { ProductCategory } from '../../types/inventory';
import type { Product } from '../../types/inventory';

interface CartTableProps {
  cart: CartItem[];
  t: (key: any) => string;
  categories: ProductCategory[];
  inputModes: Record<string, 'qty' | 'amount'>;
  setInputModes: React.Dispatch<React.SetStateAction<Record<string, 'qty' | 'amount'>>>;
  formatCurrency: (val: number) => string;
  updateQuantity: (productId: string, qty: number) => void;
  setSerialModalProduct: (product: Product | null) => void;
  currSymbol: string;
  removeSerialFromCart: (productId: string, serial: string) => void;
  setDiscountItem: (item: CartItem | null) => void;
  setDiscountPriceInput: (val: string) => void;
  removeFromCart: (productId: string) => void;
}

const cartListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const cartItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '12px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--card-bg)',
};

export const CartTable: React.FC<CartTableProps> = ({
  cart,
  t,
  categories,
  inputModes,
  setInputModes,
  formatCurrency,
  updateQuantity,
  setSerialModalProduct,
  currSymbol,
  removeSerialFromCart,
  setDiscountItem,
  setDiscountPriceInput,
  removeFromCart,
}) => {
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
        {t('cartEmpty')}
      </div>
    );
  }

  return (
    <div style={cartListStyle}>
      {cart.map((item) => {
        const cat = categories.find((c) => c.id === item.product.category_id);
        const categoryName = cat ? cat.name : 'General';
        const isDecimalQty = item.quantity % 1 !== 0;
        const mode = isDecimalQty ? 'amount' : inputModes[item.product.id] || 'qty';
        return (
          <div key={item.product.id} style={cartItemStyle}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                {categoryName}
              </span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {item.custom_name || item.product.product_name}
              </strong>
              {item.is_discounted && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '0.65rem',
                    backgroundColor: 'var(--brand-danger)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  Discount
                </span>
              )}
              <div style={{ color: 'var(--brand-primary)', fontWeight: 800, marginTop: '2px' }}>
                {formatCurrency(
                  (item.custom_price ?? Number(item.product.selling_price)) * item.quantity,
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                }}
              >
                {item.product.is_serialized ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}
                    >
                      QTY:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{item.quantity}</span>
                    <button
                      onClick={() => setSerialModalProduct(item.product)}
                      style={{
                        background: 'var(--brand-primary-light)',
                        color: 'var(--brand-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginLeft: '8px',
                      }}
                    >
                      + Add Serial
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        backgroundColor: 'var(--bg-app)',
                        padding: '2px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <button
                        disabled={isDecimalQty}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          backgroundColor: mode === 'qty' ? 'var(--brand-primary)' : 'transparent',
                          color: mode === 'qty' ? 'white' : 'var(--text-muted)',
                          border: 'none',
                          cursor: isDecimalQty ? 'not-allowed' : 'pointer',
                          opacity: isDecimalQty ? 0.5 : 1,
                        }}
                        onClick={() =>
                          setInputModes((prev) => ({ ...prev, [item.product.id]: 'qty' }))
                        }
                      >
                        QTY
                      </button>
                      <button
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          backgroundColor:
                            mode === 'amount' ? 'var(--brand-primary)' : 'transparent',
                          color: mode === 'amount' ? 'white' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          setInputModes((prev) => ({ ...prev, [item.product.id]: 'amount' }))
                        }
                      >
                        AMT
                      </button>
                    </div>
                    {mode === 'qty' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                        }}
                      >
                        <button
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-app)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span
                          style={{
                            width: '36px',
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                          }}
                        >
                          {Number(item.quantity).toFixed(2).replace(/\.00$/, '')}
                        </span>
                        <button
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-app)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '4px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '2px 8px',
                          backgroundColor: 'var(--bg-input)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {currSymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          style={{
                            width: '60px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-main)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textAlign: 'right',
                            outline: 'none',
                          }}
                          value={Number(
                            (
                              item.quantity *
                              (item.custom_price ?? Number(item.product.selling_price))
                            ).toFixed(2),
                          )}
                          onChange={(e) => {
                            const amt = parseFloat(e.target.value) || 0;
                            updateQuantity(
                              item.product.id,
                              amt / (item.custom_price ?? Number(item.product.selling_price)),
                            );
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Render Serials as Chips */}
                {((item.serials && item.serials.length > 0) ||
                  (item.overridden_serials && item.overridden_serials.length > 0)) && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      width: '100%',
                    }}
                  >
                    {item.serials?.map((serial) => (
                      <div
                        key={serial}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>SN:</span> {serial}
                        <button
                          onClick={() => removeSerialFromCart(item.product.id, serial)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {item.overridden_serials?.map((override) => (
                      <div
                        key={override.serial}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--brand-danger)',
                          color: 'var(--brand-danger)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span style={{ opacity: 0.8 }}>⚠️ Overridden SN:</span> {override.serial}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => {
                    setDiscountItem(item);
                    setDiscountPriceInput(
                      item.custom_price
                        ? item.custom_price.toString()
                        : item.product.selling_price.toString(),
                    );
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--brand-primary)',
                    color: 'var(--brand-primary)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Apply Discount"
                >
                  <Tag size={18} />
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--brand-danger)',
                    color: 'var(--brand-danger)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
