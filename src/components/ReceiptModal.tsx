import React from 'react';
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
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale, saleItems }) => {
  const { t } = useLanguage();
  const { business, getCurrencySymbol } = useBusiness();
  const { customers } = useCustomers();
  const currSymbol = getCurrencySymbol();

  const formatCurrency = (val: number) =>
    `${currSymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });

  if (!sale) return null;

  const customer = sale.customer_id ? customers.find(c => c.id === sale.customer_id) : null;
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
        </div>

        <div style={{ margin: '20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-elevated, #f1f5f9)' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Item</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>Qty</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Price</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'left', fontWeight: '500' }}>
                    {item.custom_name || item.product_name || `Item ${idx + 1}`}
                    {item.is_discounted && (
                      <span style={{ marginLeft: '8px', fontSize: '0.65rem', backgroundColor: 'var(--brand-danger, #ef4444)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Discount
                      </span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'center' }}>
                    {Number(item.quantity).toFixed(2).replace(/\.00$/, '')}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right' }}>
                    {formatCurrency(item.selling_price)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '700' }}>
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Amount
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '1.05rem' }}>
                  {formatCurrency(sale.total_amount)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Payment Method
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#4338ca', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  {sale.payment_method}
                </td>
              </tr>
              {customer && (
                <tr>
                  <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Customer
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '0.85rem' }}>
                    {customer.name}
                  </td>
                </tr>
              )}
              {isCredit && (
                <>
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Amount Paid
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#059669', fontSize: '0.85rem' }}>
                      {formatCurrency(sale.amount_paid || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem', color: 'var(--brand-danger)' }}>
                      Balance Due (Debt)
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: 'var(--brand-danger)', fontSize: '0.95rem' }}>
                      {formatCurrency(balanceDue)}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>

        <div className="text-center mt-8 text-xs text-slate-500">
          <p>Thank you for shopping with us!</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 print:hidden">
        <Button variant="outline" onClick={onClose}>
          {t('btnCancel')}
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          🖨️ {t('printReceipt')}
        </Button>
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
