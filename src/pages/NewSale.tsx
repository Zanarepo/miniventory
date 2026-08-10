import React from 'react';
import { Toast } from '../components/Toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ShoppingCart, Plus, Tag, RotateCcw, ScanBarcode } from 'lucide-react';
import type { PaymentMethod } from '../types/sales';
import { useNewSale } from '../hooks/useNewSale';
import { CartTable } from '../components/pos/CartTable';
import { ProductLookupModal } from '../components/pos/ProductLookupModal';
import { CustomItemModal } from '../components/pos/CustomItemModal';
import { CheckoutModal } from '../components/pos/CheckoutModal';
import { DiscountModal } from '../components/pos/DiscountModal';
import { ManagerOverrideModal } from '../components/pos/ManagerOverrideModal';
import { SelectSerialModal } from '../components/pos/SelectSerialModal';
import { PosCameraScanner } from '../components/pos/PosCameraScanner';

const ClickableAmount: React.FC<{
  value: number;
  formatFull: (v: number) => string;
  formatCompact: (v: number) => string;
  style?: React.CSSProperties;
}> = ({ value, formatFull, formatCompact, style }) => {
  const [showFull, setShowFull] = React.useState(false);
  return (
    <span
      onClick={() => setShowFull(!showFull)}
      style={{ ...style, cursor: 'pointer', display: 'inline-block' }}
      title={formatFull(value)}
    >
      {showFull ? formatFull(value) : formatCompact(value)}
    </span>
  );
};

export const NewSale: React.FC = () => {
  const s = useNewSale();

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '16px 8px',
        minHeight: 'calc(100vh - 12rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
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
            {s.t('cartTitle')}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={s.undoLastScan}
              disabled={s.scanHistory.length === 0}
              leftIcon={<RotateCcw size={16} />}
            >
              Undo Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => s.setIsCameraScannerOpen(true)}
              leftIcon={<ScanBarcode size={16} />}
            >
              Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => {
                s.setCustomItemName('');
                s.setCustomItemAmount('');
                s.setIsCustomItemOpen(true);
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
                s.setSearchQuery('');
                s.setIsSelectOpen(true);
              }}
              leftIcon={<Plus size={16} />}
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* Cart List */}
        <div
          style={{
            flex: 1,
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: s.cart.length === 0 ? 'center' : 'flex-start',
          }}
        >
          {s.cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              {s.t('cartEmpty')}
            </div>
          ) : (
            <CartTable
              cart={s.cart}
              t={s.t}
              categories={s.categories}
              inputModes={s.inputModes}
              setInputModes={s.setInputModes}
              formatCurrency={s.formatCurrency}
              updateQuantity={s.updateQuantity}
              setSerialModalProduct={s.setSerialModalProduct}
              currSymbol={s.currSymbol}
              removeSerialFromCart={s.removeSerialFromCart}
              setDiscountItem={s.setDiscountItem}
              setDiscountPriceInput={s.setDiscountPriceInput}
              removeFromCart={s.removeFromCart}
            />
          )}
        </div>

        {/* Footer: Total + Checkout Buttons */}
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
              {s.t('cartTotal')}
            </span>
            <ClickableAmount
              value={s.subtotal}
              formatFull={s.formatCurrency}
              formatCompact={s.formatCompactCurrency}
              style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--brand-primary)' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%', padding: '8px' }}
              disabled={s.cart.length === 0 || s.isProcessing}
              onClick={() => s.triggerConfirm('CASH')}
            >
              💵 {s.t('payMethodCash')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ width: '100%', padding: '8px' }}
              disabled={s.cart.length === 0 || s.isProcessing}
              onClick={() => s.triggerConfirm('POS')}
            >
              💳 {s.t('payMethodPOS')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              style={{ width: '100%', padding: '8px' }}
              disabled={s.cart.length === 0 || s.isProcessing}
              onClick={() => s.triggerConfirm('TRANSFER')}
            >
              🏦 {s.t('payMethodTransfer')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '100%', padding: '8px', border: '1px dashed var(--border-color)' }}
              disabled={s.cart.length === 0 || s.isProcessing}
              onClick={() => {
                s.setIsSplitPayment(true);
                s.triggerConfirm('SPLIT');
              }}
            >
              ➗ Split Payment / Credit
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <ProductLookupModal
        isOpen={s.isSelectOpen}
        onClose={() => s.setIsSelectOpen(false)}
        searchQuery={s.searchQuery}
        setSearchQuery={s.setSearchQuery}
        filteredProducts={s.filteredProducts}
        cart={s.cart}
        handleTapAdd={s.handleTapAdd}
        formatCurrency={s.formatCurrency}
      />
      <CustomItemModal
        isOpen={s.isCustomItemOpen}
        onClose={() => s.setIsCustomItemOpen(false)}
        handleAddCustomItem={s.handleAddCustomItem}
        customItemName={s.customItemName}
        setCustomItemName={s.setCustomItemName}
        customItemAmount={s.customItemAmount}
        setCustomItemAmount={s.setCustomItemAmount}
        currSymbol={s.currSymbol}
      />
      <CheckoutModal
        isOpen={s.isConfirmOpen}
        onClose={() => s.setIsConfirmOpen(false)}
        isSplitPayment={s.isSplitPayment}
        confirmMethod={s.confirmMethod}
        getMethodLabel={(method: PaymentMethod) =>
          ({
            CASH: 'Cash',
            POS: 'POS',
            TRANSFER: 'Transfer',
            MOBILE_MONEY: 'Mobile Money',
            SPLIT: 'Split',
            OTHER: 'Other',
          })[method] ?? method
        }
        subtotal={s.subtotal}
        formatCurrency={s.formatCurrency}
        customerId={s.customerId}
        setCustomerId={s.setCustomerId}
        customers={s.customers}
        newCustomerName={s.newCustomerName}
        setNewCustomerName={s.setNewCustomerName}
        handleQuickAddCustomer={s.handleQuickAddCustomer}
        splitAmounts={s.splitAmounts}
        setSplitAmounts={s.setSplitAmounts}
        currSymbol={s.currSymbol}
        amountPaidInput={s.amountPaidInput}
        setAmountPaidInput={s.setAmountPaidInput}
        handleCheckout={s.handleCheckout}
        isProcessing={s.isProcessing}
      />
      <DiscountModal
        discountItem={s.discountItem}
        setDiscountItem={s.setDiscountItem}
        handleSaveDiscount={s.handleSaveDiscount}
        formatCurrency={s.formatCurrency}
        currSymbol={s.currSymbol}
        discountPriceInput={s.discountPriceInput}
        setDiscountPriceInput={s.setDiscountPriceInput}
        updateItemPrice={s.updateItemPrice}
      />
      <ManagerOverrideModal
        isOpen={s.overrideModal.isOpen}
        serial={s.overrideModal.serial}
        productName={s.overrideModal.productName}
        onClose={() => s.setOverrideModal({ isOpen: false, serial: null, productName: '' })}
        onSubmit={s.handleOverrideSubmit}
      />
      <SelectSerialModal
        isOpen={!!s.serialModalProduct}
        product={s.serialModalProduct}
        onClose={() => s.setSerialModalProduct(null)}
        onConfirm={(serials) => {
          if (s.serialModalProduct) {
            s.addToCart(s.serialModalProduct, serials.length, undefined, undefined, serials);
            s.setToast({ message: `${s.serialModalProduct.product_name} added`, type: 'success' });
            s.setSerialModalProduct(null);
          }
        }}
      />
      <PosCameraScanner
        isOpen={s.isCameraScannerOpen}
        onClose={() => s.setIsCameraScannerOpen(false)}
        onScan={s.handleBarcodeScanned}
      />
      {s.toast && (
        <Toast message={s.toast.message} type={s.toast.type} onClose={() => s.setToast(null)} />
      )}
    </div>
  );
};
