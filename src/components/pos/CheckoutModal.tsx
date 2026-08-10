import React from 'react';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { Button } from '../Button';
import { CustomSelect } from '../CustomSelect';
import { UserCheck, Plus } from 'lucide-react';
import type { PaymentMethod } from '../../types/sales';
import type { Customer } from '../../types/customers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSplitPayment: boolean;
  confirmMethod: PaymentMethod;
  getMethodLabel: (method: PaymentMethod) => string;
  subtotal: number;
  formatCurrency: (val: number) => string;
  customerId: string;
  setCustomerId: (val: string) => void;
  customers: Customer[] | undefined;
  newCustomerName: string;
  setNewCustomerName: (val: string) => void;
  handleQuickAddCustomer: () => void;
  splitAmounts: Record<PaymentMethod, string>;
  setSplitAmounts: React.Dispatch<React.SetStateAction<Record<PaymentMethod, string>>>;
  currSymbol: string;
  amountPaidInput: string;
  setAmountPaidInput: (val: string) => void;
  handleCheckout: () => void;
  isProcessing: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  isSplitPayment,
  confirmMethod,
  getMethodLabel,
  subtotal,
  formatCurrency,
  customerId,
  setCustomerId,
  customers,
  newCustomerName,
  setNewCustomerName,
  handleQuickAddCustomer,
  splitAmounts,
  setSplitAmounts,
  currSymbol,
  amountPaidInput,
  setAmountPaidInput,
  handleCheckout,
  isProcessing,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Sale Checkout">
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
            <strong style={{ color: 'var(--text-main)' }}>
              {isSplitPayment ? 'SPLIT PAYMENT / CREDIT' : getMethodLabel(confirmMethod)}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <strong style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>
              {formatCurrency(subtotal)}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Link Customer (Optional for full payment, Required for credit)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <CustomSelect
              value={customerId}
              onChange={(val) => setCustomerId(val)}
              leftIcon={<UserCheck size={17} />}
              options={[
                { value: '', label: '-- Select an Existing Customer --' },
                ...(customers || []).map((c) => ({
                  value: c.id,
                  label: `${c.name} ${c.phone ? `(${c.phone})` : ''}`,
                })),
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '8px',
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-elevated)',
            }}
          >
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Enter Split Amounts
            </strong>
            {['CASH', 'POS', 'TRANSFER', 'MOBILE_MONEY'].map((method) => (
              <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '80px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {method}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={splitAmounts[method as PaymentMethod] || ''}
                  onChange={(e) =>
                    setSplitAmounts((prev) => ({ ...prev, [method]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div
              style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px dashed var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Entered:
              </span>
              <strong
                style={{
                  color:
                    Object.entries(splitAmounts).reduce(
                      (acc, [_, val]) => acc + (parseFloat(val) || 0),
                      0,
                    ) < subtotal
                      ? 'var(--brand-danger)'
                      : 'var(--brand-primary)',
                }}
              >
                {formatCurrency(
                  Object.entries(splitAmounts).reduce(
                    (acc, [_, val]) => acc + (parseFloat(val) || 0),
                    0,
                  ),
                )}
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

        {!customerId &&
          (isSplitPayment
            ? Object.entries(splitAmounts).reduce(
                (acc, [_, val]) => acc + (parseFloat(val) || 0),
                0,
              ) < subtotal
            : amountPaidInput.trim()
              ? parseFloat(amountPaidInput) < subtotal
              : false) && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255,165,0,0.1)',
                border: '1px solid rgba(255,165,0,0.3)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            >
              <p style={{ margin: 0 }}>
                To record a credit sale or partial payment, you must select or add a customer above.
              </p>
            </div>
          )}

        {isSplitPayment &&
          Object.entries(splitAmounts).reduce((acc, [_, val]) => acc + (parseFloat(val) || 0), 0) >
            subtotal && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--brand-danger)',
                fontSize: '0.85rem',
              }}
            >
              <p style={{ margin: 0 }}>Total split amounts cannot exceed the sale subtotal.</p>
            </div>
          )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleCheckout}
          disabled={
            isProcessing ||
            (!customerId &&
              (isSplitPayment
                ? Object.entries(splitAmounts).reduce(
                    (acc, [_, val]) => acc + (parseFloat(val) || 0),
                    0,
                  ) < subtotal
                : amountPaidInput.trim()
                  ? parseFloat(amountPaidInput) < subtotal
                  : false)) ||
            (isSplitPayment &&
              Object.entries(splitAmounts).reduce(
                (acc, [_, val]) => acc + (parseFloat(val) || 0),
                0,
              ) > subtotal)
          }
        >
          Confirm Checkout
        </Button>
      </div>
    </Modal>
  );
};
