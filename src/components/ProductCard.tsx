import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { StockBadge } from './StockBadge';
import type { ProductWithStock } from '../types/inventory';
import { useBusiness } from '../hooks/useBusiness';
import { useLanguage } from '../hooks/useLanguage';
import { Sliders, Edit2, Tag, Hash, Archive } from 'lucide-react';

export interface ProductCardProps {
  product: ProductWithStock;
  onAdjustStock: (product: ProductWithStock) => void;
  onEdit: (product: ProductWithStock) => void;
  onArchive?: (product: ProductWithStock) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdjustStock,
  onEdit,
  onArchive,
}) => {
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.selling_price);

  const formattedCost = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.cost_price);

  return (
    <Card
      className="mobile-product-card"
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      footer={
        <div
          className="btn-group-responsive"
          style={{ width: '100%', borderTop: 'none', padding: 0, margin: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => onAdjustStock(product)}
            leftIcon={<Sliders size={15} />}
          >
            {t('btnAdjust')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => onEdit(product)}
            leftIcon={<Edit2 size={15} />}
          >
            {t('btnEdit')}
          </Button>
          {onArchive && (
            <Button
              variant="outline"
              size="sm"
              style={{
                flex: 1,
                borderColor: 'hsla(358, 82%, 56%, 0.3)',
                color: 'var(--brand-danger)',
              }}
              onClick={() => onArchive(product)}
              leftIcon={<Archive size={15} />}
            >
              {t('btnDelete')}
            </Button>
          )}
        </div>
      }
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '4px',
            }}
          >
            <Tag size={12} /> {product.category_name || 'General Catalog'}
          </span>
          <h4
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              wordBreak: 'break-word',
            }}
          >
            {product.product_name}
          </h4>
          {product.sku && (
            <p
              style={{
                margin: '3px 0 0',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Hash size={13} /> Code: {product.sku}
            </p>
          )}
        </div>
        <div>
          <StockBadge
            status={product.stock_status}
            quantity={product.current_stock}
            unit={product.unit}
          />
        </div>
      </div>

      {product.description && (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.45 }}>
          {product.description}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'var(--card-bg-elevated, rgba(0,0,0,0.06))',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600,
            }}
          >
            {t('colSellingPrice')}
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
            {currSymbol}
            {formattedPrice}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> /{product.unit}</span>
        </div>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'block',
              fontWeight: 600,
            }}
          >
            {t('colCostPrice')}
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {currSymbol}
            {formattedCost}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> /{product.unit}</span>
        </div>
      </div>
    </Card>
  );
};
