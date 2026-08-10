import React, { useState, useRef } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { InteractiveFixGrid } from './InteractiveFixGrid';
import { useCsvImport } from '../../hooks/useCsvImport';
import { useInventory } from '../../hooks/useInventory';
import { UploadCloud, CheckCircle, Download } from 'lucide-react';

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { parseFile, parsedData, errors, skippedRows, updateRow, toggleSkipRow, validateAll } =
    useCsvImport();

  const { products, categories, createProduct, createRestockBatch } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitStats, setCommitStats] = useState({ processed: 0, skipped: 0, productsCreated: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
      setStep('review');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Product Name,Barcode or Serial,Quantity,Cost Price,Selling Price\niPhone 10,SN-9001122,1,450,600\nUSB-C Cable,8901234567,50,2.5,5.0\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'miniventory_bulk_restock_template.csv';
    link.click();
  };

  const handleCommit = async () => {
    // Re-validate to ensure everything is perfect
    const currentErrors = validateAll(parsedData);
    const unskippedErrors = currentErrors.filter((e) => !skippedRows.has(e.rowId));

    if (unskippedErrors.length > 0) {
      alert('Please fix all remaining errors or skip those rows before submitting.');
      return;
    }

    setIsCommitting(true);
    let createdCount = 0;
    const validRows = parsedData.filter((r) => !skippedRows.has(r._id));

    // Group by product name
    const grouped = new Map<
      string,
      {
        is_serialized: boolean;
        cost_price: number;
        selling_price: number;
        quantity: number;
        serials: string[];
      }
    >();

    for (const row of validRows) {
      const name = row.product_name.trim();
      const cost = parseFloat(row.cost_price) || 0;
      const price = parseFloat(row.selling_price) || 0;
      const barcode = row.barcode_or_serial?.trim();
      const qty = parseInt(row.quantity, 10) || 1;

      const isSerialized = barcode && qty === 1;

      if (!grouped.has(name)) {
        grouped.set(name, {
          is_serialized: !!isSerialized,
          cost_price: cost,
          selling_price: price,
          quantity: 0,
          serials: [],
        });
      }

      const group = grouped.get(name)!;
      // If we see any serial, we force the group to be serialized
      if (isSerialized) {
        group.is_serialized = true;
        group.serials.push(barcode);
      } else {
        group.quantity += qty;
        // Keep the latest cost/price
        if (cost > 0) group.cost_price = cost;
        if (price > 0) group.selling_price = price;
      }
    }

    // Process each group
    for (const [name, data] of grouped.entries()) {
      let product = products.find((p) => p.product_name.toLowerCase() === name.toLowerCase());

      if (!product) {
        // Create Product
        let categoryId = categories[0]?.id;
        if (!categoryId) {
          // If no categories exist, we should ideally create one, but for now we pass undefined
          // and let the backend/schema handle it if optional, or fail gracefully.
          // In Miniventory, category_id might be required.
          // As a fallback, we will just use the first available or a placeholder if needed.
        }

        const newProd = await createProduct(
          {
            product_name: name,
            category_id: categoryId || 'general',
            unit: 'pcs',
            is_serialized: data.is_serialized,
            is_active: true,
            cost_price: data.cost_price,
            selling_price: data.selling_price,
            minimum_stock: 5,
          },
          0,
        );

        if (newProd) {
          product = newProd as any;
          createdCount++;
        }
      }

      if (product) {
        if (data.is_serialized && data.serials.length > 0) {
          await createRestockBatch(
            product.id,
            data.serials.length,
            data.cost_price,
            data.serials,
            'CSV Bulk Import',
          );
        } else if (!data.is_serialized && data.quantity > 0) {
          await createRestockBatch(
            product.id,
            data.quantity,
            data.cost_price,
            undefined,
            'CSV Bulk Import',
          );
        }
      }
    }

    setCommitStats({
      processed: validRows.length,
      skipped: skippedRows.size,
      productsCreated: createdCount,
    });
    setIsCommitting(false);
    setStep('success');
    if (onSuccess) onSuccess(`Successfully imported ${validRows.length} rows.`);
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else {
      const confirm = window.confirm('Are you sure you want to cancel the import?');
      if (confirm) onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="CSV Bulk Restock">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
        {step === 'upload' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: '24px',
            }}
          >
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                textAlign: 'center',
                width: '100%',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card-alt)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud
                size={48}
                color="var(--brand-primary)"
                style={{ marginBottom: '16px' }}
              />
              <h3 style={{ margin: '0 0 8px 0' }}>Click to upload CSV</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Supports .csv files</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              leftIcon={<Download size={16} />}
            >
              Download Sample CSV Template
            </Button>
          </div>
        )}

        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Review Data</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {parsedData.length} rows found. {skippedRows.size} skipped.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Upload Different File
              </Button>
            </div>

            <InteractiveFixGrid
              parsedData={parsedData}
              errors={errors}
              skippedRows={skippedRows}
              updateRow={updateRow}
              toggleSkipRow={toggleSkipRow}
            />

            {errors.filter((e) => !skippedRows.has(e.rowId)).length === 0 && (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <CheckCircle size={32} color="#10b981" style={{ marginBottom: '8px' }} />
                <h3 style={{ margin: 0, color: '#10b981' }}>All Data Valid!</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
                  Ready to commit inventory changes.
                </p>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCommit}
                isLoading={isCommitting}
                disabled={
                  errors.filter((e) => !skippedRows.has(e.rowId)).length > 0 ||
                  parsedData.filter((r) => !skippedRows.has(r._id)).length === 0
                }
              >
                Commit Changes
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: '16px',
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            <CheckCircle size={64} color="var(--brand-primary)" />
            <h2 style={{ margin: 0 }}>Import Complete!</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Successfully processed <strong>{commitStats.processed}</strong> rows.
              <br />
              Created <strong>{commitStats.productsCreated}</strong> new products.
              <br />
              Skipped <strong>{commitStats.skipped}</strong> rows.
            </p>
            <Button variant="primary" onClick={onClose} style={{ marginTop: '16px' }}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
