import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { useLanguage } from '../../hooks/useLanguage';
import type { SaleWithItems } from '../../types/sales';

interface SalesHistoryTableProps {
  paginatedSales: SaleWithItems[];
  formatCurrency: (val: number) => string;
  formatDate: (val: string) => string;
  onViewReceipt: (sale: SaleWithItems) => void;
  onVoidSale: (saleId: string) => void;
}

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({
  paginatedSales,
  formatCurrency,
  formatDate,
  onViewReceipt,
  onVoidSale,
}) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="desktop-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Receipt</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Total Amount</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Payment</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Items</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale) => (
              <tr
                key={sale.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor:
                    sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'transparent',
                }}
                onClick={() => onViewReceipt(sale)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Click to view full receipt"
              >
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {formatDate(sale.created_at || '')}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {sale.receipt_number}
                  </span>
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    textDecoration:
                      sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                        ? 'line-through'
                        : 'none',
                    color:
                      sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                        ? 'var(--text-muted)'
                        : 'var(--text-main)',
                  }}
                >
                  {formatCurrency(sale.total_amount)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {sale.payment_method}
                  </span>
                  {sale.amount_paid !== undefined &&
                    sale.total_amount > sale.amount_paid &&
                    sale.payment_status !== 'VOIDED' &&
                    !sale.receipt_number.includes('[VOID') && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--brand-danger)',
                          marginTop: '4px',
                          fontWeight: 'bold',
                        }}
                      >
                        Debt: {formatCurrency(sale.total_amount - sale.amount_paid)}
                      </div>
                    )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">
                      {sale.itemCount && sale.itemCount > 1
                        ? 'Multiple Items'
                        : sale.firstItemName || 'No items'}
                    </span>
                    {sale.hasDiscount && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: 'var(--brand-danger, #ef4444)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          width: 'max-content',
                          textTransform: 'uppercase',
                        }}
                      >
                        Discount Applied
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID') ? (
                    <span style={{ color: 'var(--brand-danger)', fontWeight: 'bold' }}>VOIDED</span>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>ACTIVE</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!(
                      sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                    ) && (
                      <Button
                        size="sm"
                        variant="outline"
                        style={{
                          borderColor: 'var(--brand-danger)',
                          color: 'var(--brand-danger)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onVoidSale(sale.id);
                        }}
                      >
                        Void
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewReceipt(sale);
                      }}
                    >
                      Receipt
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedSales.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}
                >
                  {t('noRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-cards-container mt-4">
        {paginatedSales.map((sale) => (
          <Card
            key={sale.id}
            onClick={() => onViewReceipt(sale)}
            className="cursor-pointer hover:border-brand-primary transition-colors"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
            }}
            title="Click to view full receipt"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formatDate(sale.created_at || '')}
              </span>
              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {sale.receipt_number}{' '}
                {(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')) && (
                  <span style={{ color: 'red', marginLeft: 4 }}>[VOIDED]</span>
                )}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {sale.itemCount && sale.itemCount > 1
                    ? 'Multiple Items'
                    : sale.firstItemName || 'No items'}
                </span>
                {sale.hasDiscount && (
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
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '8px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    color:
                      sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                        ? 'var(--text-muted)'
                        : 'var(--brand-primary)',
                    textDecoration:
                      sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')
                        ? 'line-through'
                        : 'none',
                  }}
                >
                  {formatCurrency(sale.total_amount)}
                </span>
                {sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID') ? (
                  <span
                    style={{
                      fontSize: '1rem',
                      color: 'var(--brand-danger)',
                      fontWeight: 900,
                      marginTop: '4px',
                    }}
                  >
                    VOIDED
                  </span>
                ) : (
                  sale.amount_paid !== undefined &&
                  sale.total_amount > sale.amount_paid && (
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--brand-danger)', fontWeight: 700 }}
                    >
                      Debt: {formatCurrency(sale.total_amount - sale.amount_paid)}
                    </span>
                  )
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!(sale.payment_status === 'VOIDED' || sale.receipt_number.includes('[VOID')) && (
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderColor: 'var(--brand-danger)', color: 'var(--brand-danger)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVoidSale(sale.id);
                    }}
                  >
                    Void
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReceipt(sale);
                  }}
                >
                  Receipt
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {paginatedSales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            {t('noRecords')}
          </div>
        )}
      </div>

      <style>{`
        .desktop-table-container {
          display: block;
        }
        .mobile-cards-container {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-table-container {
            display: none;
          }
          .mobile-cards-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </>
  );
};
