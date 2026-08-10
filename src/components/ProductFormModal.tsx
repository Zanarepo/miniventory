import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Box, ScanBarcode, QrCode } from 'lucide-react';
import type { ProductWithStock } from '../types/inventory';
import { useProductForm } from './product-form/useProductForm';
import { ProductBasicInfo } from './product-form/ProductBasicInfo';
import { ProductUnitPricing } from './product-form/ProductUnitPricing';
import { ProductBulkPricing } from './product-form/ProductBulkPricing';
import { ProductStockEntry } from './product-form/ProductStockEntry';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductWithStock | null;
  onSuccess?: (message?: string) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit = null,
  onSuccess,
}) => {
  const { state, actions } = useProductForm({ productToEdit, onSuccess, onClose, isOpen });

  const {
    isEditing,
    isSerialized,
    setIsSerialized,
    description,
    setDescription,
    isSubmitting,
    saveAction,
    setSaveAction,
    errorMessage,
  } = state;

  const { handleSubmit, t } = actions;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing ? `${t('modalTitleEdit')}: ${productToEdit?.product_name}` : t('modalTitleAdd')
      }
    >
      <form onSubmit={handleSubmit} className="form-grid-2">
        <div className="col-span-2" style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <button
            type="button"
            disabled={isEditing}
            onClick={() => setIsSerialized(false)}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${!isSerialized ? 'var(--brand-primary)' : 'var(--border-color)'}`,
              backgroundColor: !isSerialized ? 'var(--brand-primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: isEditing ? 'not-allowed' : 'pointer',
              opacity: isEditing && isSerialized ? 0.5 : 1,
            }}
          >
            <ScanBarcode
              size={24}
              color={!isSerialized ? 'var(--brand-primary)' : 'var(--text-muted)'}
            />
            <span
              style={{
                fontWeight: 600,
                color: !isSerialized ? 'var(--brand-primary)' : 'var(--text-main)',
              }}
            >
              Standard Item
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Track by quantity (e.g., 50 boxes)
            </span>
          </button>

          <button
            type="button"
            disabled={isEditing}
            onClick={() => setIsSerialized(true)}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isSerialized ? 'var(--brand-primary)' : 'var(--border-color)'}`,
              backgroundColor: isSerialized ? 'var(--brand-primary-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: isEditing ? 'not-allowed' : 'pointer',
              opacity: isEditing && !isSerialized ? 0.5 : 1,
            }}
          >
            <QrCode size={24} color={isSerialized ? 'var(--brand-primary)' : 'var(--text-muted)'} />
            <span
              style={{
                fontWeight: 600,
                color: isSerialized ? 'var(--brand-primary)' : 'var(--text-main)',
              }}
            >
              Serialized Item
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Track unique barcodes/IMEIs
            </span>
          </button>
        </div>

        <ProductBasicInfo state={state} actions={actions} />
        <ProductUnitPricing state={state} />
        <ProductBulkPricing state={state} />
        <ProductStockEntry state={state} actions={actions} />

        <div className="col-span-2">
          <Input
            label={t('fieldRemarks')}
            type="text"
            placeholder={t('placeholderRemarks')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {errorMessage && (
          <p className="col-span-2" style={{ color: 'var(--brand-danger)', margin: '4px 0' }}>
            {errorMessage}
          </p>
        )}

        <div
          className="col-span-2 form-action-row"
          style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('btnCancel')}
          </Button>
          {!isEditing && (
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting && saveAction === 'add'}
              onClick={() => setSaveAction('add')}
              leftIcon={<Box size={17} />}
            >
              Save & Add Another
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting && saveAction === 'close'}
            onClick={() => setSaveAction('close')}
            leftIcon={<Box size={17} />}
          >
            {isEditing ? t('btnSaveChanges') : t('btnSaveItem')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
