import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useBusiness } from '../hooks/useBusiness';
import { useLanguage } from '../hooks/useLanguage';
import {
  Card,
  Button,
  SearchInput,
  StockBadge,
  ProductCard,
  AdjustmentModal,
  ProductFormModal,
  InventorySummaryCard,
  Toast,
} from '../components';
import type { ProductWithStock } from '../types/inventory';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Package,
  History,
  Sliders,
  Edit2,
  Archive,
  Filter,
  AlertTriangle,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, categories, archiveProduct, isLoading } = useInventory();
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialAction = searchParams.get('action');
  const initialStatus = searchParams.get('status');
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(
    initialStatus === 'low_stock' || initialStatus === 'out_of_stock',
  );

  const [productToAdjust, setProductToAdjust] = useState<ProductWithStock | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [productToEdit, setProductToEdit] = useState<ProductWithStock | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(
    initialAction === 'new' || initialAction === 'add',
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.has('action')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }
      // Low stock filter
      if (showLowStockOnly && p.stock_status !== 'low_stock' && p.stock_status !== 'out_of_stock') {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.product_name.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q) || false;
        const descMatch = p.description?.toLowerCase().includes(q) || false;
        const catMatch = p.category_name?.toLowerCase().includes(q) || false;
        return nameMatch || skuMatch || descMatch || catMatch;
      }
      return true;
    });
  }, [products, selectedCategory, showLowStockOnly, searchQuery]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: ProductWithStock) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenAdjust = (product: ProductWithStock) => {
    setProductToAdjust(product);
    setIsAdjustModalOpen(true);
  };

  const handleArchive = async (product: ProductWithStock) => {
    if (
      window.confirm(
        `Are you sure you want to delete/archive "${product.product_name}" from your shop items?`,
      )
    ) {
      await archiveProduct(product.id);
      setStatusMessage('Item removed from active shop items successfully');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Loading your market shop items and stock balances...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {statusMessage && (
        <Toast message={statusMessage} type="success" onClose={() => setStatusMessage(null)} />
      )}

      {/* Page Title & Responsive Actions */}
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
          <h1
            style={{
              margin: 0,
              fontSize: '1.85rem',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
            }}
          >
            📦 {t('invTitle')}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('invSubtitle')}
          </p>
        </div>

        <div
          className="btn-group-responsive"
          style={{ flex: '1 1 auto', justifyContent: 'flex-end', width: 'auto' }}
        >
          <Link to="/inventory-ledger" style={{ textDecoration: 'none', display: 'flex' }}>
            <Button variant="outline" leftIcon={<History size={17} />}>
              {t('invHistoryBtn')}
            </Button>
          </Link>
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus size={18} />}>
            {t('invAddBtn')}
          </Button>
        </div>
      </div>

      {/* Metric Highlights Banner */}
      <InventorySummaryCard />

      {/* Search & Filtering Control Bar */}
      <Card style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
              <SearchInput
                placeholder={t('invSearchPlaceholder')}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '20px',
                border: showLowStockOnly ? '2px solid #d97706' : '1px solid var(--border-color)',
                backgroundColor: showLowStockOnly ? 'rgba(245, 158, 11, 0.16)' : 'transparent',
                color: showLowStockOnly ? '#d97706' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <AlertTriangle size={16} />
              <span>
                {t('invLowStockToggle')} ({showLowStockOnly ? 'Active' : 'Off'})
              </span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Filter size={14} /> {t('colCategory')}:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor:
                  selectedCategory === 'all' ? 'var(--brand-primary)' : 'rgba(0,0,0,0.06)',
                color: selectedCategory === 'all' ? '#fff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '16px',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--brand-primary)' : 'rgba(0,0,0,0.06)',
                    color: isActive ? '#fff' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Empty State vs Catalog Views */}
      {filteredProducts.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Package
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
            {products.length === 0 ? t('invEmptyState') : 'No Items Match Your Search & Filters'}
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              maxWidth: '460px',
              margin: '0 auto 24px',
              fontSize: '0.95rem',
            }}
          >
            {products.length === 0
              ? 'Add your first market shop item so you can easily record selling prices, monitor stock levels, and calculate daily profit.'
              : 'Try adjusting your search word or resetting the filter tabs to find your item.'}
          </p>
          {products.length === 0 ? (
            <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus size={18} />}>
              {t('invAddBtn')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowLowStockOnly(false);
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
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
                      <th style={{ padding: '16px' }}>{t('colItemName')}</th>
                      <th style={{ padding: '16px' }}>{t('colCategory')}</th>
                      <th style={{ padding: '16px' }}>{t('colSellingPrice')}</th>
                      <th style={{ padding: '16px' }}>{t('colCostPrice')}</th>
                      <th style={{ padding: '16px' }}>{t('colRemainingStock')}</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>{t('colActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              fontWeight: 800,
                              color: 'var(--text-main)',
                              display: 'block',
                              fontSize: '1rem',
                            }}
                          >
                            {p.product_name}
                          </span>
                          {p.sku && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              Code: {p.sku}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              backgroundColor: 'rgba(0,0,0,0.06)',
                              color: 'var(--text-main)',
                            }}
                          >
                            {p.category_name}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            fontWeight: 800,
                            color: 'var(--brand-primary)',
                          }}
                        >
                          {currSymbol}
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                            p.selling_price,
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {' '}
                            /{p.unit}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {currSymbol}
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                            p.cost_price,
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <StockBadge
                            status={p.stock_status}
                            quantity={p.current_stock}
                            unit={p.unit}
                          />
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAdjust(p)}
                              title="Update stock quantity"
                            >
                              <Sliders size={15} /> {t('btnAdjust')}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit item details"
                            >
                              <Edit2 size={15} /> {t('btnEdit')}
                            </Button>
                            <button
                              onClick={() => handleArchive(p)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '6px',
                                transition: 'color var(--transition-fast)',
                              }}
                              title={t('btnDelete')}
                              onMouseOver={(e) =>
                                ((e.currentTarget as HTMLElement).style.color =
                                  'var(--brand-danger)')
                              }
                              onMouseOut={(e) =>
                                ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
                              }
                            >
                              <Archive size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile-Only Responsive Card View */}
          <div
            className="inventory-mobile-cards"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdjustStock={handleOpenAdjust}
                onEdit={handleOpenEdit}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals for Stock Movement Adjustment and Product Registration */}
      <AdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={productToAdjust}
        onSuccess={(msg) => setStatusMessage(msg || 'Stock updated successfully')}
      />

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={(msg) => setStatusMessage(msg || 'Shop item saved successfully')}
      />
    </div>
  );
};
