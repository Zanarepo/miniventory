import { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useLanguage } from '../../hooks/useLanguage';
import type { ProductWithStock } from '../../types/inventory';

export const PRESET_UNITS = [
  'pcs',
  'carton',
  'bag',
  'box',
  'kg',
  'liter',
  'meter',
  'pack',
  'bundle',
];

export interface UseProductFormProps {
  productToEdit?: ProductWithStock | null;
  onSuccess?: (message?: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function useProductForm({ productToEdit, onSuccess, onClose, isOpen }: UseProductFormProps) {
  const { createProduct, updateProduct, products, createRestockBatch, itemUnits } = useInventory();
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

  // Dual-mode state
  const [isSerialized, setIsSerialized] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [initialSerials, setInitialSerials] = useState<string[]>([]);

  // Bulk unit state
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
  const [saveAction, setSaveAction] = useState<'close' | 'add'>('close');
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

          setIsSerialized(!!productToEdit.is_serialized);
          setBarcode(productToEdit.barcode || '');

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
          setIsSerialized(false);
          setBarcode('');
          setInitialSerials([]);
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

  const handleValidateSerial = async (serial: string) => {
    if (!business) return false;

    // Validate locally to ensure offline compatibility
    const existsLocally = itemUnits.some((u) => u.serial_barcode === serial);
    if (existsLocally) {
      return `Serial already exists in database.`;
    }

    return true;
  };

  const resetFormFields = () => {
    setProductName('');
    setCategoryId('');
    setSku('');
    setDescription('');
    setCostPrice('');
    setSellingPrice('');
    setUnitSelect('pcs');
    setCustomUnit('');
    setIsSerialized(false);
    setBarcode('');
    setInitialSerials([]);
    setStockBaseUnit('0');
    setStockLargePack('0');
    setMinimumStock('5');
    setHasLargePack(false);
    setLargePackName('carton');
    setPiecesPerPack('12');
    setLargePackCost('');
    setLargePackSelling('');
    setErrorMessage(null);
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
    } else if (isSerialized) {
      finalCost = parseFloat(costPrice);
      finalSelling = parseFloat(sellingPrice);
      finalStock = 0; // We'll add stock via restock batch for serials

      if (isNaN(finalCost) || finalCost < 0 || isNaN(finalSelling) || finalSelling < 0) {
        setErrorMessage('Please enter valid numerical amounts for cost and selling prices');
        return;
      }
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
      is_serialized: isSerialized,
      barcode: !isSerialized && barcode.trim() ? barcode.trim() : undefined,
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
      if (
        !isEditing &&
        isSerialized &&
        initialSerials.length > 0 &&
        typeof result !== 'boolean' &&
        result?.id
      ) {
        await createRestockBatch(result.id, initialSerials.length, finalCost, initialSerials);
      }
      logAction({
        action: isEditing ? 'update_product' : 'create_product',
        entity: 'product',
        entityId: isEditing ? productToEdit?.id : undefined,
        metadata: { product_name: productName.trim() },
      });
      if (onSuccess) onSuccess(isEditing ? 'Item updated successfully' : 'Item added successfully');

      if (saveAction === 'add' && !isEditing) {
        resetFormFields();
      } else {
        onClose();
      }
    } else {
      setErrorMessage('Failed to save item. Please try again.');
    }
  };

  return {
    state: {
      isEditing,
      productName,
      setProductName,
      categoryId,
      setCategoryId,
      sku,
      setSku,
      description,
      setDescription,
      costPrice,
      setCostPrice,
      sellingPrice,
      setSellingPrice,
      unitSelect,
      setUnitSelect,
      customUnit,
      setCustomUnit,
      isSerialized,
      setIsSerialized,
      barcode,
      setBarcode,
      initialSerials,
      setInitialSerials,
      hasLargePack,
      setHasLargePack,
      largePackName,
      setLargePackName,
      piecesPerPack,
      setPiecesPerPack,
      largePackCost,
      setLargePackCost,
      largePackSelling,
      setLargePackSelling,
      stockLargePack,
      setStockLargePack,
      stockBaseUnit,
      setStockBaseUnit,
      minimumStock,
      setMinimumStock,
      isSubmitting,
      setIsSubmitting,
      saveAction,
      setSaveAction,
      errorMessage,
      setErrorMessage,
      PRESET_UNITS,
      productToEdit,
    },
    actions: {
      generateAutoSku,
      handleValidateSerial,
      handleSubmit,
      t,
    },
  };
}
