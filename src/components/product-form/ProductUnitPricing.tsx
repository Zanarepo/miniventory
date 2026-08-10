import React from 'react';
import { Input } from '../Input';
import { CustomSelect } from '../CustomSelect';
import { Layers } from 'lucide-react';

interface ProductUnitPricingProps {
  state: any;
}

export const ProductUnitPricing: React.FC<ProductUnitPricingProps> = ({ state }) => {
  const { isSerialized, unitSelect, setUnitSelect, customUnit, setCustomUnit, PRESET_UNITS } =
    state;

  return (
    <>
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
        {isSerialized ? (
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Since this is a serialized item, we track it per-unit using unique codes (like IMEI or
              Barcode).
            </p>
            <div style={{ position: 'relative' }}>
              <CustomSelect
                value={unitSelect}
                onChange={(val) => setUnitSelect(val)}
                leftIcon={<Layers size={17} />}
                className="input-field"
                options={[
                  { value: 'pcs', label: 'PCS' },
                  { value: 'unit', label: 'UNIT' },
                  { value: 'device', label: 'DEVICE' },
                  { value: 'other', label: 'Other (Custom Unit)' },
                ]}
                style={{ width: '100%', height: '48px' }}
              />
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <CustomSelect
              value={unitSelect}
              onChange={(val) => setUnitSelect(val)}
              leftIcon={<Layers size={17} />}
              className="input-field"
              options={[
                ...PRESET_UNITS.map((u: string) => ({ value: u, label: u.toUpperCase() })),
                { value: 'other', label: 'Other (Custom Unit)' },
              ]}
              style={{ width: '100%', height: '48px' }}
            />
          </div>
        )}
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
    </>
  );
};
