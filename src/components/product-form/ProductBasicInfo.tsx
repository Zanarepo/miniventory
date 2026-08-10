import React from 'react';
import { Input } from '../Input';
import { CategoryDropdown } from '../CategoryDropdown';
import { BarcodeScannerInput } from '../BarcodeScannerInput';
import { Box, Zap, Hash } from 'lucide-react';

interface ProductBasicInfoProps {
  state: any;
  actions: any;
}

export const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({ state, actions }) => {
  const {
    isSerialized,
    barcode,
    setBarcode,
    productName,
    setProductName,
    categoryId,
    setCategoryId,
    sku,
    setSku,
  } = state;
  const { generateAutoSku, t } = actions;

  return (
    <>
      {!isSerialized && (
        <div className="col-span-2">
          <BarcodeScannerInput
            label="Barcode (Optional)"
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(value) => setBarcode(value)}
          />
        </div>
      )}

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
    </>
  );
};
