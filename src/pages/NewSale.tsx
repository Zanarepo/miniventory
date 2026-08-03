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
import { CustomSelect } from '../components/CustomSelect';
import { Trash2, Plus, ShoppingCart, Tag, UserCheck } from 'lucide-react';
import type { PaymentMethod } from '../types/sales';
import { db } from '../lib/dexie';
import { Input } from '../components/Input';
import { useCustomers } from '../hooks/useCustomers';

export const NewSale: React.FC = () => {
  const { t } = useLanguage();
  const { products, categories } = useInventory();
  const { cart, subtotal, addToCart, updateQuantity, updateItemPrice, removeFromCart, checkout } = useCart();
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

  // Payment Tracking & Customers
  const { customers, addCustomer } = useCustomers();
  const [customerId, setCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [isSplitPayment, setIsSplitPayment] = useState(false);

  // Discount Modal State
  const [discountItem, setDiscountItem] = useState<any>(null);
  const [discountPriceInput, setDiscountPriceInput] = useState<string>('');
  const [splitAmounts, setSplitAmounts] = useState<Record<PaymentMethod, string>>({
    CASH: '',
    POS: '',
    TRANSFER: '',
    MOBILE_MONEY: '',
    OTHER: '',
    SPLIT: ''
  });

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

  const handleTapAdd = (product: (typeof products)[0], isBulk: boolean = false) => {
    if (product.current_stock <= 0) {
      setToast({ message: t('statOutOfStock'), type: 'error' });
      return;
    }

    const cartItem = cart.find((item) => item.product.id === product.id);
    const currentCartQty = cartItem ? cartItem.quantity : 0;
    const remainingStock = product.current_stock - currentCartQty;

    const requestedQty = isBulk && product.conversion_ratio ? product.conversion_ratio : 1;

    if (remainingStock <= 0 || (isBulk && remainingStock < requestedQty)) {
      setToast({ message: `Not enough stock. Only ${product.current_stock} available.`, type: 'error' });
      return;
    }

    // If remaining stock is less than 1, add exactly what's left, otherwise add requestedQty
    const qtyToAdd = Math.min(requestedQty, remainingStock);

    // Pass custom price if it's a bulk purchase to apply the bulk discount
    const customPrice = isBulk && product.bulk_selling_price 
      ? Number(product.bulk_selling_price) / (product.conversion_ratio || 1) 
      : undefined;

    addToCart(product, qtyToAdd, undefined, customPrice);
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

    let finalAmountPaid: number | undefined = undefined;
    let finalSalePayments: any[] | undefined = undefined;

    if (isSplitPayment) {
      finalSalePayments = Object.entries(splitAmounts)
        .filter(([_, amt]) => parseFloat(amt) > 0)
        .map(([method, amt]) => ({
          payment_method: method as PaymentMethod,
          amount: parseFloat(amt)
        }));
      finalAmountPaid = finalSalePayments.reduce((sum, sp) => sum + sp.amount, 0);
    } else {
      if (amountPaidInput.trim()) {
        finalAmountPaid = parseFloat(amountPaidInput);
      }
    }

    const { success } = await checkout(
      isSplitPayment ? 'SPLIT' : confirmMethod, 
      customerId || undefined, 
      finalAmountPaid, 
      finalSalePayments
    );
    setIsProcessing(false);

    if (success) {
      logAction({
        action: 'record_sale',
        entity: 'sale',
        metadata: { method: isSplitPayment ? 'SPLIT' : confirmMethod, finalAmountPaid },
      });
      setToast({ message: t('checkoutSuccess'), type: 'success' });
      setAmountPaidInput('');
      setCustomerId('');
      setNewCustomerName('');
      setIsSplitPayment(false);
      setSplitAmounts({ CASH: '', POS: '', TRANSFER: '', MOBILE_MONEY: '', OTHER: '', SPLIT: '' });
    } else {
      setToast({ message: t('saleFailed'), type: 'error' });
    }
  };

  const handleQuickAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    try {
      const newId = await addCustomer({ name: newCustomerName.trim() } as any);
      setCustomerId(newId);
      setNewCustomerName('');
      setToast({ message: 'Customer added', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to add customer', type: 'error' });
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

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountItem) return;
    
    if (!discountPriceInput.trim()) {
      updateItemPrice(discountItem.product.id, null);
    } else {
      updateItemPrice(discountItem.product.id, parseFloat(discountPriceInput));
    }
    
    setDiscountItem(null);
    setDiscountPriceInput('');
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
            flexWrap: 'wrap',
            gap: '12px',
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ whiteSpace: 'nowrap' }}
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
              style={{ whiteSpace: 'nowrap' }}
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
                const isDecimalQty = item.quantity % 1 !== 0;
                const mode = isDecimalQty ? 'amount' : (inputModes[item.product.id] || 'qty');
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
                        <span style={{ marginLeft: '8px', fontSize: '0.65rem', backgroundColor: 'var(--brand-danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Discount
                        </span>
                      )}
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
                            disabled={isDecimalQty}
                            style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px', backgroundColor: mode === 'qty' ? 'var(--brand-primary)' : 'transparent', color: mode === 'qty' ? 'white' : 'var(--text-muted)', border: 'none', cursor: isDecimalQty ? 'not-allowed' : 'pointer', opacity: isDecimalQty ? 0.5 : 1 }}
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setDiscountItem(item);
                            setDiscountPriceInput(item.custom_price ? item.custom_price.toString() : item.product.selling_price.toString());
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
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%', padding: '8px', border: '1px dashed var(--border-color)' }}
              disabled={cart.length === 0 || isProcessing}
              onClick={() => {
                setIsSplitPayment(true);
                triggerConfirm('SPLIT');
              }}
            >
              ➗ Split Payment / Credit Sale
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.bulk_unit ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1 {p.bulk_unit}</span>
                        <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
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
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1 {p.unit}</span>
                        <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
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
              <strong style={{ color: 'var(--text-main)' }}>{isSplitPayment ? 'SPLIT PAYMENT / CREDIT' : getMethodLabel(confirmMethod)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>
                {formatCurrency(subtotal)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Link Customer (Optional for full payment, Required for credit)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CustomSelect
                value={customerId}
                onChange={(val) => setCustomerId(val)}
                leftIcon={<UserCheck size={17} />}
                options={[
                  { value: '', label: '-- Select an Existing Customer --' },
                  ...(customers || []).map(c => ({
                    value: c.id,
                    label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`
                  }))
                ]}
                style={{ flex: 1, height: '45px' }}
              />
            </div>
            
            {!customerId && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <Input
                  type="text"
                  placeholder="Or type a new customer's name..."
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleQuickAddCustomer}
                  disabled={!newCustomerName.trim()}
                  style={{ padding: '0 12px' }}
                >
                  <Plus size={18} /> Add
                </Button>
              </div>
            )}
          </div>

          {isSplitPayment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Enter Split Amounts</strong>
              {['CASH', 'POS', 'TRANSFER', 'MOBILE_MONEY'].map((method) => (
                <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{method}</span>
                  <Input 
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={splitAmounts[method as PaymentMethod] || ''}
                    onChange={(e) => setSplitAmounts(prev => ({ ...prev, [method]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Entered:</span>
                <strong style={{ color: Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) < subtotal ? 'var(--brand-danger)' : 'var(--brand-primary)' }}>
                  {formatCurrency(Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0))}
                </strong>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '8px' }}>
              <Input
                label={`Amount Paid by Customer (${currSymbol})`}
                type="number"
                min="0"
                step="any"
                placeholder={String(subtotal)}
                value={amountPaidInput}
                onChange={(e) => setAmountPaidInput(e.target.value)}
                helperText="Leave empty if fully paid. Enter lesser amount for credit sales."
              />
            </div>
          )}
          
          {(!customerId && (isSplitPayment ? Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) < subtotal : (amountPaidInput.trim() ? parseFloat(amountPaidInput) < subtotal : false))) && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
              <p style={{ margin: 0 }}>To record a credit sale or partial payment, you must select or add a customer above.</p>
            </div>
          )}
          
          {isSplitPayment && Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) > subtotal && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--brand-danger)', fontSize: '0.85rem' }}>
              <p style={{ margin: 0 }}>Total split amounts cannot exceed the sale subtotal.</p>
            </div>
          )}
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}
        >
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleCheckout}
            disabled={
              isProcessing || 
              (!customerId && (isSplitPayment ? Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) < subtotal : (amountPaidInput.trim() ? parseFloat(amountPaidInput) < subtotal : false))) ||
              (isSplitPayment && Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) > subtotal)
            }
          >
            Confirm Checkout
          </Button>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal
        isOpen={!!discountItem}
        onClose={() => setDiscountItem(null)}
        title="Apply Discount"
      >
        <form onSubmit={handleSaveDiscount} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Original Unit Price: <strong>{formatCurrency(discountItem?.product.selling_price || 0)}</strong>
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
              style={{ width: '100%', marginTop: '8px', color: 'var(--brand-danger)', borderColor: 'var(--brand-danger)' }}
              onClick={() => {
                updateItemPrice(discountItem.product.id, null);
                setDiscountItem(null);
              }}
            >
              Remove Discount
            </Button>
          )}
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
