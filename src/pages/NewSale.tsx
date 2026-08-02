import React, { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useInventory } from '../hooks/useInventory';
import { useCart } from '../hooks/useCart';
import { useBusiness } from '../hooks/useBusiness';
import { useAuditLog } from '../hooks/useAuditLog';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchInput } from '../components/SearchInput';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { Trash2, Plus, ShoppingCart, Tag } from 'lucide-react';
import type { PaymentMethod } from '../types/sales';
import { db } from '../lib/dexie';
import { Input } from '../components/Input';

export const NewSale: React.FC = () => {
  const { t } = useLanguage();
  const { products, categories } = useInventory();
  const { cart, subtotal, addToCart, updateQuantity, removeFromCart, checkout } = useCart();
  const { getCurrencySymbol } = useBusiness();
  const currSymbol = getCurrencySymbol();
  const { logAction } = useAuditLog();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMethod, setConfirmMethod] = useState<PaymentMethod>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [inputModes, setInputModes] = useState<Record<string, 'qty' | 'amount'>>({});

  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemAmount, setCustomItemAmount] = useState('');

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Filter products by search query for the lookup modal
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(lowerQuery) ||
        (p.sku && p.sku.toLowerCase().includes(lowerQuery)),
    );
  }, [products, searchQuery]);

  const handleTapAdd = (product: (typeof products)[0]) => {
    if (product.current_stock <= 0) {
      setToast({ message: t('statOutOfStock'), type: 'error' });
      return;
    }

    const cartItem = cart.find((item) => item.product.id === product.id);
    const currentCartQty = cartItem ? cartItem.quantity : 0;

    if (currentCartQty + 1 > product.current_stock) {
      setToast({ message: `Only ${product.current_stock} in stock.`, type: 'error' });
      return;
    }

    addToCart(product, 1);
    setToast({ message: `${product.product_name} added`, type: 'success' });
  };

  const triggerConfirm = (method: PaymentMethod) => {
    setConfirmMethod(method);
    setIsConfirmOpen(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsConfirmOpen(false);
    setIsProcessing(true);
    const { success } = await checkout(confirmMethod);
    setIsProcessing(false);

    if (success) {
      logAction({
        action: 'record_sale',
        entity: 'sale',
        metadata: { method: confirmMethod },
      });
      setToast({ message: t('checkoutSuccess'), type: 'success' });
    } else {
      setToast({ message: t('saleFailed'), type: 'error' });
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const businessId = products[0]?.business_id; // Derive from existing products or useBusiness if available
    if (!businessId) return;

    const amount = parseFloat(customItemAmount);
    if (isNaN(amount) || amount <= 0 || !customItemName.trim()) {
      setToast({ message: 'Invalid name or amount', type: 'error' });
      return;
    }

    let systemProd = await db.products.where('sku').equals('SYSTEM_CUSTOM').first();
    if (!systemProd) {
      const newId = crypto.randomUUID();
      systemProd = {
        id: newId,
        business_id: businessId,
        product_name: 'Custom Item',
        sku: 'SYSTEM_CUSTOM',
        cost_price: 0,
        selling_price: 0,
        unit: 'unit',
        minimum_stock: 0,
        is_active: false,
      } as any;
      if (systemProd) {
        await db.products.put(systemProd);
      }
    }

    if (systemProd) {
      addToCart(systemProd as any, 1, customItemName.trim(), amount);
    }
    setIsCustomItemOpen(false);
    setToast({ message: `${customItemName.trim()} added`, type: 'success' });
  };

  // Inline CSS Styles matching Design System
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px 8px',
    minHeight: 'calc(100vh - 12rem)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const cartListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '4px 0',
  };

  const cartItemStyle: React.CSSProperties = {
    padding: '14px 16px',
    backgroundColor: 'var(--card-bg-elevated, rgba(0,0,0,0.02))',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  };

  const modalProductListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '350px',
    overflowY: 'auto',
    marginTop: '12px',
    paddingRight: '4px',
  };

  const modalProductRowStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return t('payMethodCash');
      case 'POS':
        return t('payMethodPOS');
      case 'TRANSFER':
        return t('payMethodTransfer');
      default:
        return method;
    }
  };

  return (
    <div style={containerStyle}>
      <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Custom Header rendered inside the Card */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            <ShoppingCart size={22} color="var(--brand-primary)" />
            {t('cartTitle')}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomItemName('');
                setCustomItemAmount('');
                setIsCustomItemOpen(true);
              }}
              leftIcon={<Tag size={16} />}
            >
              Custom Item
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setIsSelectOpen(true);
              }}
              leftIcon={<Plus size={16} />}
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* Full-width Cart List */}
        <div
          style={{
            flex: 1,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: cart.length === 0 ? 'center' : 'flex-start',
          }}
        >
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              {t('cartEmpty')}
            </div>
          ) : (
            <div style={cartListStyle}>
              {cart.map((item) => {
                const cat = categories.find((c) => c.id === item.product.category_id);
                const categoryName = cat ? cat.name : 'General';
                const mode = inputModes[item.product.id] || 'qty';
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
                      <div
                        style={{ color: 'var(--brand-primary)', fontWeight: 800, marginTop: '2px' }}
                      >
                        {formatCurrency((item.custom_price ?? Number(item.product.selling_price)) * item.quantity)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <button
                            style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px', backgroundColor: mode === 'qty' ? 'var(--brand-primary)' : 'transparent', color: mode === 'qty' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                            onClick={() => setInputModes(prev => ({ ...prev, [item.product.id]: 'qty' }))}
                          >
                            QTY
                          </button>
                          <button
                            style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px', backgroundColor: mode === 'amount' ? 'var(--brand-primary)' : 'transparent', color: mode === 'amount' ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                            onClick={() => setInputModes(prev => ({ ...prev, [item.product.id]: 'amount' }))}
                          >
                            AMT
                          </button>
                        </div>
                        {mode === 'qty' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <button
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span style={{ width: '36px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>
                              {Number(item.quantity).toFixed(2).replace(/\.00$/, '')}
                            </span>
                            <button
                              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', backgroundColor: 'var(--bg-input)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{currSymbol}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              style={{ width: '60px', border: 'none', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'right', outline: 'none' }}
                              value={Number((item.quantity * (item.custom_price ?? Number(item.product.selling_price))).toFixed(2))}
                              onChange={(e) => {
                                const amt = parseFloat(e.target.value) || 0;
                                updateQuantity(item.product.id, amt / (item.custom_price ?? Number(item.product.selling_price)));
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-danger)',
                          cursor: 'pointer',
                          padding: '6px',
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Billing & Checkout Buttons */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              {t('cartTotal')}
            </span>
            <span style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="sm"
                style={{ flex: '1 1 140px', padding: '8px' }}
                disabled={cart.length === 0 || isProcessing}
                onClick={() => triggerConfirm('CASH')}
              >
                💵 {t('payMethodCash')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                style={{ flex: '1 1 140px', padding: '8px' }}
                disabled={cart.length === 0 || isProcessing}
                onClick={() => triggerConfirm('POS')}
              >
                💳 {t('payMethodPOS')}
              </Button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              style={{ width: '100%', padding: '8px' }}
              disabled={cart.length === 0 || isProcessing}
              onClick={() => triggerConfirm('TRANSFER')}
            >
              🏦 {t('payMethodTransfer')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Lookup Product Modal */}
      <Modal
        isOpen={isSelectOpen}
        onClose={() => setIsSelectOpen(false)}
        title="Add Product to Cart"
      >
        <SearchInput
          placeholder="Type product name or SKU..."
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{ fontWeight: 850, color: 'var(--brand-primary)', fontSize: '1.1rem' }}
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
                    onClick={() => handleTapAdd(p)}
                    disabled={remainingStock <= 0}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </Button>
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
          <Button variant="ghost" onClick={() => setIsSelectOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Custom Item Modal */}
      <Modal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        title="Add Custom Item"
      >
        <form onSubmit={handleAddCustomItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsCustomItemOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add to Cart
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Sale Checkout"
      >
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Are you sure you want to complete this sale?
          </p>
          <div
            style={{
              padding: '12px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--card-bg-elevated, rgba(0,0,0,0.02))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <strong style={{ color: 'var(--text-main)' }}>{getMethodLabel(confirmMethod)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>
                {formatCurrency(subtotal)}
              </strong>
            </div>
          </div>
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}
        >
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleCheckout}>
            Confirm Checkout
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
