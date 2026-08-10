import React, { useState, useMemo } from 'react';
import { useLanguage } from './useLanguage';
import { useInventory } from './useInventory';
import { useCart } from './useCart';
import { useBusiness } from './useBusiness';
import { useAuditLog } from './useAuditLog';
import { useCustomers } from './useCustomers';
import { useScanner } from './useScanner';
import { db } from '../lib/dexie';
import type { PaymentMethod } from '../types/sales';

export function useNewSale() {
  const { t } = useLanguage();
  const { products, categories } = useInventory();
  const {
    cart,
    subtotal,
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    removeSerialFromCart,
    checkout,
    undoLastScan,
    scanHistory,
    overrideSerial,
  } = useCart();
  const { getCurrencySymbol } = useBusiness();
  const currSymbol = getCurrencySymbol();
  const { logAction } = useAuditLog();
  const { customers, addCustomer } = useCustomers();

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

  const [customerId, setCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<PaymentMethod, string>>({
    CASH: '',
    POS: '',
    TRANSFER: '',
    MOBILE_MONEY: '',
    OTHER: '',
    SPLIT: '',
  });

  const [discountItem, setDiscountItem] = useState<any>(null);
  const [discountPriceInput, setDiscountPriceInput] = useState<string>('');

  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    serial: string | null;
    productName: string;
  }>({ isOpen: false, serial: null, productName: '' });
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [serialModalProduct, setSerialModalProduct] = useState<any>(null);

  const { handleBarcodeScanned } = useScanner({
    onScanStatus: (type, message, product, barcode) => {
      if (type === 'sold' && barcode && product) {
        setOverrideModal({ isOpen: true, serial: barcode, productName: product.product_name });
      } else if (type === 'added') {
        setToast({ message, type: 'success' });
      } else if (type === 'duplicate' || type === 'not_found') {
        setToast({ message, type: 'error' });
      }
    },
  });

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatCompactCurrency = React.useCallback(
    (num: number) => {
      if (num >= 1e9) return `${currSymbol}${(num / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
      if (num >= 1e6) return `${currSymbol}${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
      if (num >= 1e3) return `${currSymbol}${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
      return `${currSymbol}${Number(num).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    },
    [currSymbol],
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const lq = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(lq) ||
        (p.sku && p.sku.toLowerCase().includes(lq)) ||
        (p.barcode && p.barcode.toLowerCase().includes(lq)),
    );
  }, [products, searchQuery]);

  const handleTapAdd = (product: (typeof products)[0], isBulk = false) => {
    if (product.current_stock <= 0) {
      setToast({ message: t('statOutOfStock'), type: 'error' });
      return;
    }
    if (product.is_serialized) {
      setSerialModalProduct(product);
      setIsSelectOpen(false);
      return;
    }
    const cartItem = cart.find((i) => i.product.id === product.id);
    const remainingStock = product.current_stock - (cartItem ? cartItem.quantity : 0);
    const requestedQty = isBulk && product.conversion_ratio ? product.conversion_ratio : 1;
    if (remainingStock <= 0 || (isBulk && remainingStock < requestedQty)) {
      setToast({
        message: `Not enough stock. Only ${product.current_stock} available.`,
        type: 'error',
      });
      return;
    }
    const customPrice =
      isBulk && product.bulk_selling_price
        ? Number(product.bulk_selling_price) / (product.conversion_ratio || 1)
        : undefined;
    addToCart(product, Math.min(requestedQty, remainingStock), undefined, customPrice);
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
    let finalAmountPaid: number | undefined;
    let finalSalePayments: any[] | undefined;
    if (isSplitPayment) {
      finalSalePayments = Object.entries(splitAmounts)
        .filter(([, amt]) => parseFloat(amt) > 0)
        .map(([method, amt]) => ({
          payment_method: method as PaymentMethod,
          amount: parseFloat(amt),
        }));
      finalAmountPaid = finalSalePayments.reduce((s, p) => s + p.amount, 0);
    } else if (amountPaidInput.trim()) {
      finalAmountPaid = parseFloat(amountPaidInput);
    }
    const { success, message } = await checkout(
      isSplitPayment ? 'SPLIT' : confirmMethod,
      customerId || undefined,
      finalAmountPaid,
      finalSalePayments,
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
      setToast({ message: message || t('saleFailed'), type: 'error' });
    }
  };

  const handleQuickAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    try {
      const newId = await addCustomer({ name: newCustomerName.trim() } as any);
      setCustomerId(newId);
      setNewCustomerName('');
      setToast({ message: 'Customer added', type: 'success' });
    } catch {
      setToast({ message: 'Failed to add customer', type: 'error' });
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const businessId = products[0]?.business_id;
    if (!businessId) return;
    const amount = parseFloat(customItemAmount);
    if (isNaN(amount) || amount <= 0 || !customItemName.trim()) {
      setToast({ message: 'Invalid name or amount', type: 'error' });
      return;
    }
    let systemProd = await db.products.where('sku').equals('SYSTEM_CUSTOM').first();
    if (!systemProd) {
      systemProd = {
        id: crypto.randomUUID(),
        business_id: businessId,
        product_name: 'Custom Item',
        sku: 'SYSTEM_CUSTOM',
        cost_price: 0,
        selling_price: 0,
        unit: 'unit',
        minimum_stock: 0,
        is_active: false,
      } as any;
      if (systemProd) await db.products.put(systemProd);
    }
    if (systemProd) addToCart(systemProd as any, 1, customItemName.trim(), amount);
    setIsCustomItemOpen(false);
    setToast({ message: `${customItemName.trim()} added`, type: 'success' });
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountItem) return;
    updateItemPrice(
      discountItem.product.id,
      discountPriceInput.trim() ? parseFloat(discountPriceInput) : null,
    );
    setDiscountItem(null);
    setDiscountPriceInput('');
  };

  const handleOverrideSubmit = async (pin: string, reason: string) => {
    if (!overrideModal.serial) return;
    const result = await overrideSerial(overrideModal.serial, pin, reason);
    if (result.success) {
      setToast({ message: 'Item overridden and added to cart', type: 'success' });
      setOverrideModal({ isOpen: false, serial: null, productName: '' });
    } else {
      setToast({ message: result.message || 'Invalid PIN', type: 'error' });
    }
  };

  return {
    t,
    cart,
    subtotal,
    products,
    categories,
    customers,
    currSymbol,
    filteredProducts,
    scanHistory,
    formatCurrency,
    formatCompactCurrency,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    removeSerialFromCart,
    undoLastScan,
    addToCart,
    searchQuery,
    setSearchQuery,
    isSelectOpen,
    setIsSelectOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    confirmMethod,
    isProcessing,
    toast,
    setToast,
    inputModes,
    setInputModes,
    isCustomItemOpen,
    setIsCustomItemOpen,
    customItemName,
    setCustomItemName,
    customItemAmount,
    setCustomItemAmount,
    handleAddCustomItem,
    customerId,
    setCustomerId,
    newCustomerName,
    setNewCustomerName,
    amountPaidInput,
    setAmountPaidInput,
    isSplitPayment,
    setIsSplitPayment,
    splitAmounts,
    setSplitAmounts,
    discountItem,
    setDiscountItem,
    discountPriceInput,
    setDiscountPriceInput,
    overrideModal,
    setOverrideModal,
    isCameraScannerOpen,
    setIsCameraScannerOpen,
    serialModalProduct,
    setSerialModalProduct,
    handleBarcodeScanned,
    handleTapAdd,
    triggerConfirm,
    handleCheckout,
    handleQuickAddCustomer,
    handleSaveDiscount,
    handleOverrideSubmit,
  };
}
