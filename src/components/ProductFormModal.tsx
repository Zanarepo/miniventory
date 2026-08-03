import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { CategoryDropdown } from './CategoryDropdown';
import { CustomSelect } from './CustomSelect';
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
  const { business } = useBusiness();
  const { logAction } = useAuditLog();
  const { t } = useLanguage();

  const isEditing = !!productToEdit;

  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [unitSelect, setUnitSelect] = useState('pcs');
  const [customUnit, setCustomUnit] = useState('');

  // Conversational Bulk unit state
  const [hasLargePack, setHasLargePack] = useState(false);
  const [largePackName, setLargePackName] = useState('carton');
  const [piecesPerPack, setPiecesPerPack] = useState('12');
  const [largePackCost, setLargePackCost] = useState('');
  const [largePackSelling, setLargePackSelling] = useState('');

  // Stock state
  const [stockLargePack, setStockLargePack] = useState('0');
  const [stockBaseUnit, setStockBaseUnit] = useState('0');

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

          if (productToEdit.bulk_unit) {
            setHasLargePack(true);
            setLargePackName(productToEdit.bulk_unit);
            setPiecesPerPack(String(productToEdit.conversion_ratio ?? '12'));
            setLargePackCost(String(productToEdit.bulk_cost_price ?? ''));
            setLargePackSelling(String(productToEdit.bulk_selling_price ?? ''));
          } else {
            setHasLargePack(false);
            setLargePackName('carton');
            setPiecesPerPack('12');
            setLargePackCost('');
            setLargePackSelling('');
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
          setStockBaseUnit('0');
          setStockLargePack('0');
          setMinimumStock('5');
          setHasLargePack(false);
          setLargePackName('carton');
          setPiecesPerPack('12');
          setLargePackCost('');
          setLargePackSelling('');
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
        (!isEditing || p.id !== productToEdit?.id),
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
    let finalCost: number;
    let finalSelling: number;
    let finalStock: number;

    let bCost = 0,
      bSelling = 0,
      bRatio = 0;

    if (hasLargePack) {
      bCost = parseFloat(largePackCost);
      bSelling = parseFloat(largePackSelling);
      bRatio = parseFloat(piecesPerPack);
      finalSelling = parseFloat(sellingPrice); // This is the piece selling price

      if (!largePackName.trim()) {
        setErrorMessage('Large pack name is required');
        return;
      }
      if (isNaN(bRatio) || bRatio <= 1) {
        setErrorMessage('Quantity inside the large pack must be greater than 1');
        return;
      }
      if (
        isNaN(bCost) ||
        bCost < 0 ||
        isNaN(bSelling) ||
        bSelling < 0 ||
        isNaN(finalSelling) ||
        finalSelling < 0
      ) {
        setErrorMessage('Please enter valid numerical amounts for prices');
        return;
      }

      finalCost = bCost / bRatio;

      const sLarge = parseFloat(stockLargePack) || 0;
      const sBase = parseFloat(stockBaseUnit) || 0;
      finalStock = sLarge * bRatio + sBase;
    } else {
      finalCost = parseFloat(costPrice);
      finalSelling = parseFloat(sellingPrice);
      finalStock = parseFloat(stockBaseUnit) || 0;

      if (isNaN(finalCost) || finalCost < 0 || isNaN(finalSelling) || finalSelling < 0) {
        setErrorMessage('Please enter valid numerical amounts for cost and selling prices');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const productPayload = {
      product_name: productName.trim(),
      category_id: categoryId || undefined,
      sku: sku.trim() || undefined,
      description: description.trim() || undefined,
      cost_price: finalCost,
      selling_price: finalSelling,
      unit: finalUnit,
      minimum_stock: parseFloat(minimumStock) || 5,
      ...(hasLargePack
        ? {
            bulk_unit: largePackName.trim(),
            conversion_ratio: bRatio,
            bulk_cost_price: bCost,
            bulk_selling_price: bSelling,
          }
        : {
            bulk_unit: undefined,
            conversion_ratio: undefined,
            bulk_cost_price: undefined,
            bulk_selling_price: undefined,
          }),
    };

    const result =
      isEditing && productToEdit
        ? await updateProduct(productToEdit.id, productPayload)
        : await createProduct(
            {
              ...productPayload,
              is_active: true,
            },
            finalStock,
            finalCost,
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

        <div
          className="col-span-2"
          style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}
        >
          <label
            className="form-label"
            style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}
          >
            How do you count this item? <span style={{ color: 'var(--brand-danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <CustomSelect
              value={unitSelect}
              onChange={(val) => setUnitSelect(val)}
              leftIcon={<Layers size={17} />}
              className="input-field"
              options={[
                ...PRESET_UNITS.map((u) => ({ value: u, label: u.toUpperCase() })),
                { value: 'other', label: 'Other (Custom Unit)' },
              ]}
              style={{ width: '100%', height: '48px' }}
            />
          </div>
        </div>

        {unitSelect === 'other' && (
          <div className="col-span-2">
            <Input
              label="What is this custom unit?"
              type="text"
              placeholder="e.g., pallet, drum, crate"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              required
            />
          </div>
        )}

        <div className="col-span-2">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '12px 0',
              padding: '16px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <input
              type="checkbox"
              id="has-large-pack"
              checked={hasLargePack}
              onChange={(e) => setHasLargePack(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label
              htmlFor="has-large-pack"
              style={{
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                fontSize: '0.95rem',
              }}
            >
              Do you also sell this in a larger pack (like a Carton or Bag)?
            </label>
          </div>
        </div>

        {hasLargePack ? (
          <div
            className="col-span-2"
            style={{
              padding: '16px',
              backgroundColor: 'var(--card-bg-elevated, rgba(0,0,0,0.02))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div className="form-grid-2">
              <div className="col-span-1">
                <Input
                  label="What is the larger pack called?"
                  type="text"
                  placeholder="e.g., Carton, Bag"
                  value={largePackName}
                  onChange={(e) => setLargePackName(e.target.value)}
                  required={hasLargePack}
                />
              </div>
              <div className="col-span-1">
                <Input
                  label={`How many [${unitSelect === 'other' ? customUnit || 'Pieces' : unitSelect}] are inside 1 [${largePackName || 'Carton'}]?`}
                  type="number"
                  step="any"
                  min="1.01"
                  placeholder="e.g., 12"
                  value={piecesPerPack}
                  onChange={(e) => setPiecesPerPack(e.target.value)}
                  required={hasLargePack}
                />
              </div>

              <div className="col-span-1">
                <Input
                  label={`Cost Price to buy 1 [${largePackName || 'Carton'}]`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 60000"
                  value={largePackCost}
                  onChange={(e) => setLargePackCost(e.target.value)}
                  required={hasLargePack}
                  leftIcon={<DollarSign size={17} />}
                />
              </div>
              <div className="col-span-1">
                <Input
                  label={`Selling Price for 1 [${largePackName || 'Carton'}]`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 70000"
                  value={largePackSelling}
                  onChange={(e) => setLargePackSelling(e.target.value)}
                  required={hasLargePack}
                  leftIcon={<DollarSign size={17} />}
                />
              </div>
              <div className="col-span-1">
                <Input
                  label={`Selling Price for 1 [${unitSelect === 'other' ? customUnit || 'Piece' : unitSelect}]`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 6000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required={hasLargePack}
                  leftIcon={<DollarSign size={17} />}
                />
              </div>
            </div>

            {!isEditing && (
              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '16px',
                  borderTop: '1px dashed var(--border-color)',
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  How much stock do you have right now?
                </label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Input
                    label={`Number of [${largePackName || 'Cartons'}]`}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g., 5"
                    value={stockLargePack}
                    onChange={(e) => setStockLargePack(e.target.value)}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>AND</span>
                  <Input
                    label={`Number of [${unitSelect === 'other' ? customUnit || 'Pieces' : unitSelect}]`}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g., 3"
                    value={stockBaseUnit}
                    onChange={(e) => setStockBaseUnit(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="col-span-2"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}
          >
            <div className="form-grid-2">
              <div className="col-span-1">
                <Input
                  label={`Cost Price of 1 [${unitSelect === 'other' ? customUnit || 'Piece' : unitSelect}]`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 62000"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  required={!hasLargePack}
                  leftIcon={<DollarSign size={17} />}
                />
              </div>
              <div className="col-span-1">
                <Input
                  label={`Selling Price of 1 [${unitSelect === 'other' ? customUnit || 'Piece' : unitSelect}]`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 75000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required={!hasLargePack}
                  leftIcon={<DollarSign size={17} />}
                />
              </div>
            </div>

            {!isEditing && (
              <div className="col-span-1">
                <Input
                  label={`How many [${unitSelect === 'other' ? customUnit || 'Pieces' : unitSelect}] do you have in stock right now?`}
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g., 20"
                  value={stockBaseUnit}
                  onChange={(e) => setStockBaseUnit(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="col-span-2">
          <Input
            label="Low Stock Warning Level (When should we remind you?)"
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 5"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value)}
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
