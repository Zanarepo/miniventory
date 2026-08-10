import React from 'react';
import { Input } from '../Input';
import { DollarSign } from 'lucide-react';

interface ProductBulkPricingProps {
  state: any;
}

export const ProductBulkPricing: React.FC<ProductBulkPricingProps> = ({ state }) => {
  const {
    isSerialized,
    unitSelect,
    customUnit,
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
    sellingPrice,
    setSellingPrice,
    costPrice,
    setCostPrice,
  } = state;

  return (
    <>
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

      {!isSerialized && hasLargePack ? (
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
        </div>
      )}
    </>
  );
};
