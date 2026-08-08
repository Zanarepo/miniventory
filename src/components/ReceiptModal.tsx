import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/dexie';
import { useLanguage } from '../hooks/useLanguage';
import { useBusiness } from '../hooks/useBusiness';
import { Modal } from './Modal';
import { Button } from './Button';
import { useCustomers } from '../hooks/useCustomers';
import type { Sale, SaleItem } from '../types/sales';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  saleItems: (SaleItem & { product_name?: string })[];
  onVoidSale?: (saleId: string) => void;
  onReturnItem?: (item: SaleItem) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  saleItems,
  onVoidSale,
  onReturnItem,
}) => {
  const { t } = useLanguage();
  const { business, getCurrencySymbol } = useBusiness();
  const { customers } = useCustomers();
  const currSymbol = getCurrencySymbol();

  const cashier = useLiveQuery(
    () => (sale?.created_by ? db.cachedProfiles.get(sale.created_by) : undefined),
    [sale?.created_by],
  );

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  if (!sale) return null;

  const customer = sale.customer_id ? customers.find((c) => c.id === sale.customer_id) : null;
  const isCredit = sale.payment_status === 'PARTIAL' || sale.payment_status === 'UNPAID';
  const balanceDue = sale.total_amount - (sale.amount_paid || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('receiptTitle')}>
      {/* Printable Area */}
      <div
        id="receipt-print-area"
        className="p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-sm max-w-sm mx-auto border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">
            {business?.business_name || 'My Business'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Receipt: {sale.receipt_number}</p>
          <p className="text-xs text-slate-500">
            {formatDate(sale.created_at || new Date().toISOString())}
          </p>
          {(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')) && (
            <div className="mt-4 text-red-600 font-black text-2xl tracking-widest border-2 border-red-600 bg-red-50 dark:bg-red-900/20 inline-block px-4 py-2 rounded shadow-sm">
              *** VOIDED ***
            </div>
          )}
        </div>

        <div style={{ margin: '20px 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-elevated, #f1f5f9)' }}>
                <th
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontWeight: '600',
                  }}
                >
                  Item
                </th>
                <th
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                  }}
                >
                  Price
                </th>
                <th
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                  }}
                >
                  Total
                </th>
                {onReturnItem &&
                  !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')) && (
                    <th
                      className="print:hidden"
                      style={{ border: '1px solid #cbd5e1', padding: '10px 4px', width: '60px' }}
                    ></th>
                  )}
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, idx) => {
                const isVoided = item.is_voided;
                return (
                  <tr key={item.id || idx}>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: '500',
                        textDecoration: isVoided ? 'line-through' : 'none',
                        color: isVoided ? 'var(--text-muted)' : 'inherit',
                      }}
                    >
                      {item.custom_name || item.product_name || `Item ${idx + 1}`}
                      {isVoided && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '0.65rem',
                            backgroundColor: 'var(--brand-danger, #ef4444)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        >
                          Returned
                        </span>
                      )}
                      {item.is_discounted && !isVoided && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '0.65rem',
                            backgroundColor: 'var(--brand-danger, #ef4444)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}
                        >
                          Discount
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'center',
                        textDecoration: isVoided ? 'line-through' : 'none',
                        color: isVoided ? 'var(--text-muted)' : 'inherit',
                      }}
                    >
                      {Number(item.quantity).toFixed(2).replace(/\.00$/, '')}
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        textDecoration: isVoided ? 'line-through' : 'none',
                        color: isVoided ? 'var(--text-muted)' : 'inherit',
                      }}
                    >
                      {formatCurrency(item.selling_price)}
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: '700',
                        textDecoration: isVoided ? 'line-through' : 'none',
                        color: isVoided ? 'var(--text-muted)' : 'inherit',
                      }}
                    >
                      {formatCurrency(item.line_total)}
                    </td>
                    {onReturnItem &&
                      !(
                        sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                      ) && (
                        <td
                          className="print:hidden"
                          style={{
                            border: '1px solid #cbd5e1',
                            padding: '10px 4px',
                            textAlign: 'center',
                          }}
                        >
                          {!isVoided && (
                            <button
                              onClick={() => onReturnItem(item)}
                              title="Return Item"
                              style={{
                                background: 'none',
                                border: '1px solid var(--brand-danger)',
                                color: 'var(--brand-danger)',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                              }}
                            >
                              Return
                            </button>
                          )}
                        </td>
                      )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={
                    onReturnItem &&
                    !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                      ? 4
                      : 3
                  }
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Total Amount
                </td>
                <td
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '800',
                    color: '#059669',
                    fontSize: '1.05rem',
                  }}
                >
                  {formatCurrency(sale.total_amount)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={
                    onReturnItem &&
                    !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                      ? 4
                      : 3
                  }
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Payment Method
                </td>
                <td
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '700',
                    color: '#4338ca',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                  }}
                >
                  {sale.payment_method}
                </td>
              </tr>
              {sale.created_by && (
                <tr>
                  <td
                    colSpan={
                      onReturnItem &&
                      !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                        ? 4
                        : 3
                    }
                    style={{
                      border: '1px solid #cbd5e1',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Cashier
                  </td>
                  <td
                    style={{
                      border: '1px solid #cbd5e1',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                    }}
                  >
                    {cashier?.full_name || sale.created_by}
                  </td>
                </tr>
              )}
              {customer && (
                <tr>
                  <td
                    colSpan={
                      onReturnItem &&
                      !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                        ? 4
                        : 3
                    }
                    style={{
                      border: '1px solid #cbd5e1',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Customer
                  </td>
                  <td
                    style={{
                      border: '1px solid #cbd5e1',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                    }}
                  >
                    {customer.name}
                  </td>
                </tr>
              )}
              {isCredit && (
                <>
                  <tr>
                    <td
                      colSpan={
                        onReturnItem &&
                        !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                          ? 4
                          : 3
                      }
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Amount Paid
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#059669',
                        fontSize: '0.85rem',
                      }}
                    >
                      {formatCurrency(sale.amount_paid || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={
                        onReturnItem &&
                        !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID'))
                          ? 4
                          : 3
                      }
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        color: 'var(--brand-danger)',
                      }}
                    >
                      Balance Due (Debt)
                    </td>
                    <td
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '10px 12px',
                        textAlign: 'right',
                        fontWeight: '800',
                        color: 'var(--brand-danger)',
                        fontSize: '0.95rem',
                      }}
                    >
                      {formatCurrency(balanceDue)}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>

        <div className="text-center text-xs text-slate-500" style={{ marginTop: '32px' }}>
          <p>Thank you for shopping with us!</p>
        </div>
      </div>

      <div
        className="print:hidden"
        style={{
          marginTop: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '16px',
            width: '100%',
          }}
        >
          {onVoidSale &&
            !(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')) && (
              <Button
                variant="outline"
                style={{ borderColor: 'var(--brand-danger)', color: 'var(--brand-danger)' }}
                onClick={() => onVoidSale(sale.id)}
              >
                Void Sale
              </Button>
            )}
          <Button variant="outline" onClick={handlePrint}>
            {t('printReceipt')}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t('btnCancel')}
          </Button>
        </div>
      </div>

      {/* Print Styles injected via JS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </Modal>
  );
};
