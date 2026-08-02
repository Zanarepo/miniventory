import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { CategoryDropdown } from './CategoryDropdown';
import { useInventory } from '../hooks/useInventory';
import type { ProductWithStock } from '../types/inventory';
import { useBusiness } from '../hooks/useBusiness';
import { useAuditLog } from '../hooks/useAuditLog';
import { useLanguage } from '../hooks/useLanguage';
import { Box, DollarSign, Hash, Layers, Zap } from 'lucide-react';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductWithStock | null;
  onSuccess?: (message?: string) => void;
}

const PRESET_UNITS = ['pcs', 'carton', 'bag', 'box', 'kg', 'liter', 'meter', 'pack', 'bundle'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit = null,
  onSuccess,
}) => {
  const { createProduct, updateProduct, products } = useInventory();
  const { business, getCurrencySymbol } = useBusiness();
  const { logAction } = useAuditLog();
  const { t } = useLanguage();
  const currSymbol = getCurrencySymbol();

  const isEditing = !!productToEdit;

  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [unitSelect, setUnitSelect] = useState('pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [openingStock, setOpeningStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        if (productToEdit) {
          setProductName(productToEdit.product_name || '');
          setCategoryId(productToEdit.category_id || '');
          setSku(productToEdit.sku || '');
          setDescription(productToEdit.description || '');
          setCostPrice(String(productToEdit.cost_price ?? ''));
          setSellingPrice(String(productToEdit.selling_price ?? ''));
          setMinimumStock(String(productToEdit.minimum_stock ?? '5'));

          if (PRESET_UNITS.includes(productToEdit.unit)) {
            setUnitSelect(productToEdit.unit);
            setCustomUnit('');
          } else {
            setUnitSelect('other');
            setCustomUnit(productToEdit.unit || '');
          }
        } else {
          setProductName('');
          setCategoryId('');
          setSku('');
          setDescription('');
          setCostPrice('');
          setSellingPrice('');
          setUnitSelect('pcs');
          setCustomUnit('');
          setOpeningStock('0');
          setMinimumStock('5');
        }
        setErrorMessage(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, productToEdit]);

  const generateAutoSku = () => {
    const prefix = business?.business_name
      ? business.business_name
          .slice(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, 'BZ')
      : 'PRD';
    const count = products.length + 101;
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const newSku = `${prefix}-${count}-${randomSuffix}`;
    setSku(newSku);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMessage('Product name is required');
      return;
    }

    const isDuplicate = products.some(
      (p) =>
        p.product_name.toLowerCase() === productName.trim().toLowerCase() &&
        (!isEditing || p.id !== productToEdit?.id)
    );

    if (isDuplicate) {
      setErrorMessage('A product with this name already exists. Please use a unique name.');
      return;
    }
    const finalUnit = unitSelect === 'other' ? customUnit.trim() : unitSelect;
    if (!finalUnit) {
      setErrorMessage('Please specify a unit of measure (e.g. carton, pcs, kg)');
      return;
    }
    const cost = parseFloat(costPrice);
    const selling = parseFloat(sellingPrice);
    if (isNaN(cost) || cost < 0 || isNaN(selling) || selling < 0) {
      setErrorMessage('Please enter valid numerical amounts for cost and selling prices');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result =
      isEditing && productToEdit
        ? await updateProduct(productToEdit.id, {
            product_name: productName.trim(),
            category_id: categoryId || undefined,
            sku: sku.trim() || undefined,
            description: description.trim() || undefined,
            cost_price: cost,
            selling_price: selling,
            unit: finalUnit,
            minimum_stock: parseFloat(minimumStock) || 5,
          })
        : await createProduct(
            {
              product_name: productName.trim(),
              category_id: categoryId || undefined,
              sku: sku.trim() || undefined,
              description: description.trim() || undefined,
              cost_price: cost,
              selling_price: selling,
              unit: finalUnit,
              minimum_stock: parseFloat(minimumStock) || 5,
              is_active: true,
            },
            parseFloat(openingStock) || 0,
            cost,
          );

    setIsSubmitting(false);
    if (result) {
      logAction({
        action: isEditing ? 'update_product' : 'create_product',
        entity: 'product',
        entityId: isEditing ? productToEdit?.id : undefined,
        metadata: { product_name: productName.trim() },
      });
      if (onSuccess) onSuccess(isEditing ? 'Item updated successfully' : 'Item added successfully');
      onClose();
    } else {
      setErrorMessage('Failed to save item. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing ? `${t('modalTitleEdit')}: ${productToEdit?.product_name}` : t('modalTitleAdd')
      }
    >
      <form onSubmit={handleSubmit} className="form-grid-2">
        <div className="col-span-2">
          <Input
            label={t('fieldItemName')}
            type="text"
            placeholder={t('helperItemName')}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            leftIcon={<Box size={17} />}
          />
        </div>

        <div className="col-span-1">
          <CategoryDropdown value={categoryId} onChange={setCategoryId} />
        </div>

        <div
          className="col-span-1"
          style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label
              className="form-label"
              style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}
            >
              {t('fieldSku')}
            </label>
            <button
              type="button"
              onClick={generateAutoSku}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={13} />
              <span>Auto Code</span>
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. BZ-101"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '38px',
                height: '48px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <Hash size={17} />
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <Input
            label={`${t('fieldSellingPrice')} (${currSymbol})`}
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 75000"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
            leftIcon={<DollarSign size={17} />}
            helperText={t('helperSellingPrice')}
          />
        </div>

        <div className="col-span-1">
          <Input
            label={`${t('fieldCostPrice')} (${currSymbol})`}
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 62000"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
            leftIcon={<DollarSign size={17} />}
            helperText={t('helperCostPrice')}
          />
        </div>

        <div
          className="col-span-1"
          style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}
        >
          <label
            className="form-label"
            style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}
          >
            {t('fieldUnit')} <span style={{ color: 'var(--brand-danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={unitSelect}
              onChange={(e) => setUnitSelect(e.target.value)}
              className="input-field"
              style={{
                width: '100%',
                paddingLeft: '38px',
                height: '48px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
              }}
            >
              {PRESET_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u.toUpperCase()}
                </option>
              ))}
              <option value="other">Other (Custom Unit)</option>
            </select>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <Layers size={17} />
            </div>
          </div>
        </div>

        {unitSelect === 'other' && (
          <div className="col-span-1">
            <Input
              label="Specify Custom Unit"
              type="text"
              placeholder="e.g., pallet, drum, crate, dozen"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              required
            />
          </div>
        )}

        {!isEditing && (
          <div className="col-span-1">
            <Input
              label={t('fieldOpeningStock')}
              type="number"
              step="any"
              min="0"
              placeholder="e.g., 20 or 5"
              value={openingStock}
              onChange={(e) => setOpeningStock(e.target.value)}
              helperText={t('helperOpeningStock')}
            />
          </div>
        )}

        <div className="col-span-1">
          <Input
            label={t('fieldLowStock')}
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 5"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
            helperText={t('helperLowStock')}
          />
        </div>

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

        <div className="col-span-2 form-action-row">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('btnCancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Box size={17} />}
          >
            {isEditing ? t('btnSaveChanges') : t('btnSaveItem')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
