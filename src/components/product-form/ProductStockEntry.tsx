import React from 'react';
import { Input } from '../Input';
import { SerialScanner } from '../SerialScanner';

interface ProductStockEntryProps {
  state: any;
  actions: any;
}

export const ProductStockEntry: React.FC<ProductStockEntryProps> = ({ state, actions }) => {
  const {
    isEditing,
    isSerialized,
    hasLargePack,
    unitSelect,
    customUnit,
    largePackName,
    stockLargePack,
    setStockLargePack,
    stockBaseUnit,
    setStockBaseUnit,
    initialSerials,
    setInitialSerials,
    minimumStock,
    setMinimumStock,
    errorMessage,
    setErrorMessage,
  } = state;

  const { handleValidateSerial } = actions;

  return (
    <>
      {!isEditing && !isSerialized && hasLargePack && (
        <div className="col-span-2">
          <div
            style={{
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
        </div>
      )}

      {!isEditing && !isSerialized && !hasLargePack && (
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

      {!isEditing && isSerialized && (
        <div className="col-span-2" style={{ marginTop: '16px' }}>
          <label
            className="form-label"
            style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}
          >
            Add Initial Stock (Scan Serials)
          </label>
          <div
            style={{
              background: 'var(--bg-elevated)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <SerialScanner
              scannedSerials={initialSerials}
              setScannedSerials={setInitialSerials}
              error={errorMessage}
              setError={setErrorMessage}
              onValidate={handleValidateSerial}
            />
          </div>
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
    </>
  );
};
