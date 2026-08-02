import React, { useState, useMemo } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useBusiness } from '../hooks/useBusiness';
import { useLanguage } from '../hooks/useLanguage';
import { Card, Button, SearchInput } from '../components';
import type { StockMovementType } from '../types/inventory';
import { Link } from 'react-router-dom';
import {
  History,
  Package,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';

export const InventoryHistory: React.FC = () => {
  const { transactions, products, isLoading } = useInventory();
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const productMap = useMemo(() => {
    const map = new Map<string, { name: string; unit: string; sku?: string }>();
    products.forEach((p) => map.set(p.id, { name: p.product_name, unit: p.unit, sku: p.sku }));
    return map;
  }, [products]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.movement_type !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const prod = productMap.get(tx.product_id);
        const nameMatch = prod?.name.toLowerCase().includes(q) || false;
        const typeMatch = tx.movement_type.toLowerCase().includes(q);
        const remarkMatch = tx.remarks?.toLowerCase().includes(q) || false;
        return nameMatch || typeMatch || remarkMatch;
      }
      return true;
    });
  }, [transactions, filterType, searchQuery, productMap]);

  const getMovementIconAndBadge = (type: StockMovementType) => {
    switch (type) {
      case 'Opening Stock':
      case 'Stock Adjustment Increase':
      case 'Returned Stock':
        return {
          icon: <TrendingUp size={15} color="var(--brand-primary)" />,
          color: 'var(--brand-primary)',
          bg: 'rgba(46, 125, 50, 0.12)',
        };
      case 'Stock Adjustment Decrease':
        return {
          icon: <TrendingDown size={15} color="#d97706" />,
          color: '#d97706',
          bg: 'rgba(245, 158, 11, 0.16)',
        };
      case 'Damaged Stock':
      case 'Sales Deduction':
        return {
          icon: <AlertCircle size={15} color="var(--brand-danger)" />,
          color: 'var(--brand-danger)',
          bg: 'rgba(211, 47, 47, 0.15)',
        };
      default:
        return {
          icon: <RefreshCw size={15} color="var(--text-main)" />,
          color: 'var(--text-main)',
          bg: 'rgba(0,0,0,0.06)',
        };
    }
  };

  const movementFilters: { label: string; value: string }[] = [
    { label: t('filterAllMovements'), value: 'all' },
    { label: 'Opening Stock', value: 'Opening Stock' },
    { label: 'Stock Added (+)', value: 'Stock Adjustment Increase' },
    { label: 'Stock Removed (-)', value: 'Stock Adjustment Decrease' },
    { label: 'Damaged Items', value: 'Damaged Stock' },
    { label: 'Customer Returns', value: 'Returned Stock' },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Loading your shop item stock changes and history...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header & Back Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link
              to="/inventory"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
              }}
            >
              <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Back to Shop Items
            </Link>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.85rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
            }}
          >
            📜 {t('historyTitle')}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('historySubtitle')}
          </p>
        </div>

        <div className="btn-group-responsive" style={{ flex: '0 0 auto', width: 'auto' }}>
          <Link to="/inventory" style={{ textDecoration: 'none', display: 'flex', width: '100%' }}>
            <Button variant="outline" leftIcon={<Package size={17} />}>
              View Shop Items
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Control Bar */}
      <Card style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SearchInput
            placeholder={t('historySearchPlaceholder')}
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              FILTER BY:
            </span>
            {movementFilters.map((mf) => {
              const isSelected = filterType === mf.value;
              return (
                <button
                  key={mf.value}
                  onClick={() => setFilterType(mf.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--brand-primary)' : 'rgba(0,0,0,0.06)',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mf.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Ledger Records Table / Cards */}
      {filteredTransactions.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '50px 20px' }}>
          <History
            size={52}
            color="var(--text-muted)"
            style={{ margin: '0 auto 16px', opacity: 0.5 }}
          />
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 8px',
            }}
          >
            No Stock History Recorded Yet
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '440px',
              margin: '0 auto 20px',
              fontSize: '0.95rem',
            }}
          >
            When you add items to your shop or change your stock quantity, every update will appear
            here automatically.
          </p>
          <Link to="/inventory" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <Button variant="primary" leftIcon={<Package size={17} />}>
              Go to Shop Items
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Desktop Ledger Table */}
          <div className="inventory-desktop-table">
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '2px solid var(--border-color)',
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <th style={{ padding: '16px' }}>{t('colDate')}</th>
                      <th style={{ padding: '16px' }}>{t('colItemName')}</th>
                      <th style={{ padding: '16px' }}>{t('colType')}</th>
                      <th style={{ padding: '16px' }}>{t('colQtyChange')}</th>
                      <th style={{ padding: '16px' }}>{t('colCostPrice')}</th>
                      <th style={{ padding: '16px' }}>{t('colRemarks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => {
                      const prod = productMap.get(tx.product_id);
                      const badge = getMovementIconAndBadge(tx.movement_type);
                      const isPositive = Number(tx.quantity) >= 0;
                      return (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background-color var(--transition-fast)',
                          }}
                          className="table-row-hover"
                        >
                          <td
                            style={{
                              padding: '16px',
                              fontSize: '0.85rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'var(--text-main)',
                                fontWeight: 600,
                              }}
                            >
                              <Calendar size={14} />{' '}
                              {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                            <span>
                              {tx.created_at
                                ? new Date(tx.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                color: 'var(--text-main)',
                                display: 'block',
                              }}
                            >
                              {prod?.name || 'Archived Item'}
                            </span>
                            {prod?.sku && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                SKU: {prod.sku}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                backgroundColor: badge.bg,
                                color: badge.color,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {badge.icon} {tx.movement_type}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: '16px',
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              color: isPositive ? 'var(--brand-primary)' : 'var(--brand-danger)',
                            }}
                          >
                            {isPositive ? `+${tx.quantity}` : tx.quantity}{' '}
                            <span
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                              }}
                            >
                              {prod?.unit}
                            </span>
                          </td>
                          <td
                            style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)' }}
                          >
                            {tx.unit_cost !== undefined
                              ? `${currSymbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(tx.unit_cost)}`
                              : '—'}
                          </td>
                          <td
                            style={{
                              padding: '16px',
                              color: 'var(--text-muted)',
                              fontSize: '0.88rem',
                              maxWidth: '280px',
                            }}
                          >
                            {tx.remarks || 'No remarks provided'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile-Only Ledger Stacked Cards */}
          <div
            className="inventory-mobile-cards"
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {filteredTransactions.map((tx) => {
              const prod = productMap.get(tx.product_id);
              const badge = getMovementIconAndBadge(tx.movement_type);
              const isPositive = Number(tx.quantity) >= 0;
              return (
                <Card
                  key={tx.id}
                  style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                      </span>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                        }}
                      >
                        {prod?.name || 'Archived Product'}
                      </h4>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {badge.icon} {tx.movement_type.replace('Stock Adjustment ', '')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: 'var(--card-bg-elevated, rgba(0,0,0,0.04))',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          fontWeight: 600,
                        }}
                      >
                        QUANTITY CHANGE
                      </span>
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: isPositive ? 'var(--brand-primary)' : 'var(--brand-danger)',
                        }}
                      >
                        {isPositive ? `+${tx.quantity}` : tx.quantity}{' '}
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                          }}
                        >
                          {prod?.unit}
                        </span>
                      </span>
                    </div>
                    {tx.unit_cost !== undefined && (
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            display: 'block',
                            fontWeight: 600,
                          }}
                        >
                          UNIT COST
                        </span>
                        <span
                          style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}
                        >
                          {currSymbol}
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                            tx.unit_cost,
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px dashed var(--border-color)',
                      paddingTop: '8px',
                    }}
                  >
                    <strong>Explanation:</strong> {tx.remarks || 'No remarks provided'}
                  </p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
