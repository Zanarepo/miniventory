import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { StockBadge } from './StockBadge';
import type { ProductWithStock, StockMovementType } from '../types/inventory';
import { useInventory } from '../hooks/useInventory';
import { useLanguage } from '../hooks/useLanguage';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';

export interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  onSuccess?: (message?: string) => void;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const { recordStockAdjustment } = useInventory();
  const { getCurrencySymbol } = useBusiness();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const [movementType, setMovementType] = useState<StockMovementType>('Stock Adjustment Increase');
  const [quantity, setQuantity] = useState<string>('');
  const [unitCost, setUnitCost] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMessage('Please enter a quantity greater than zero');
      return;
    }

    if (!remarks.trim()) {
      setErrorMessage('Please enter an explanatory note or reason in remarks');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const parsedCost = unitCost ? parseFloat(unitCost) : product.cost_price;
    const result = await recordStockAdjustment(
      product.id,
      movementType,
      parsedQty,
      parsedCost,
      remarks.trim(),
    );
    setIsSubmitting(false);

    if (result) {
      setQuantity('');
      setUnitCost('');
      setRemarks('');
      if (onSuccess) onSuccess('Stock change saved successfully');
      onClose();
    } else {
      setErrorMessage('Failed to update stock. Please check your connection and try again.');
    }
  };

  const movementOptions: {
    label: string;
    type: StockMovementType;
    icon: React.ReactNode;
    desc: string;
    color: string;
  }[] = [
    {
      label: t('reasonStockIn'),
      type: 'Stock Adjustment Increase',
      icon: <TrendingUp size={16} />,
      desc: 'New goods arrived, or found more items in shop',
      color: 'var(--brand-primary)',
    },
    {
      label: t('reasonStockOut'),
      type: 'Stock Adjustment Decrease',
      icon: <TrendingDown size={16} />,
      desc: 'Removed items for personal use or gift',
      color: '#d97706',
    },
    {
      label: t('reasonDamaged'),
      type: 'Damaged Stock',
      icon: <AlertCircle size={16} />,
      desc: 'Items got spoiled, expired, broken or lost',
      color: 'var(--brand-danger)',
    },
    {
      label: t('reasonReturn'),
      type: 'Returned Stock',
      icon: <RefreshCw size={16} />,
      desc: 'Customer brought an item back in good condition',
      color: 'var(--brand-primary)',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('modalTitleAdjust')}: ${product.product_name}`}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('colRemainingStock')}:
          </span>
          <StockBadge
            status={product.stock_status}
            quantity={product.current_stock}
            unit={product.unit}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            className="form-label"
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '8px',
              color: 'var(--text-main)',
            }}
          >
            {t('fieldReason')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {movementOptions.map((opt) => {
              const isSelected = movementType === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setMovementType(opt.type)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? opt.color : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-input)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      color: isSelected ? opt.color : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {opt.icon}
                  </span>
                  <span style={{ color: isSelected ? opt.color : 'var(--text-main)' }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {movementType && (
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                margin: '6px 0 0 2px',
                fontStyle: 'italic',
              }}
            >
              ℹ️ {movementOptions.find((o) => o.type === movementType)?.desc}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <Input
            label={`${t('fieldAdjustQty')} (${product.unit})`}
            type="number"
            step="any"
            min="0.01"
            placeholder="e.g., 5 or 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            leftIcon={<Sliders size={16} />}
          />

          <Input
            label={t('fieldAdjustCost')}
            type="number"
            step="any"
            placeholder={`Default: ${currSymbol}${product.cost_price}`}
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            leftIcon={<DollarSign size={16} />}
          />
        </div>

        <Input
          label={t('fieldAdjustRemarks')}
          type="text"
          placeholder={t('placeholderAdjustRemarks')}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
        />

        {errorMessage && (
          <p style={{ color: 'var(--brand-danger)', fontSize: '0.88rem', margin: '8px 0' }}>
            {errorMessage}
          </p>
        )}

        <div className="btn-group-responsive" style={{ marginTop: '20px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('btnCancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Sliders size={16} />}
          >
            {t('btnSaveAdjustment')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
