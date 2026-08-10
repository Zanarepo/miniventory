import React, { useMemo } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { AlertCircle, SkipForward, Check } from 'lucide-react';
import type { CsvRowData, RowError } from '../../hooks/useCsvImport';

export interface InteractiveFixGridProps {
  parsedData: CsvRowData[];
  errors: RowError[];
  skippedRows: Set<string>;
  updateRow: (rowId: string, field: keyof CsvRowData, value: string) => void;
  toggleSkipRow: (rowId: string) => void;
}

export const InteractiveFixGrid: React.FC<InteractiveFixGridProps> = ({
  parsedData,
  errors,
  skippedRows,
  updateRow,
  toggleSkipRow,
}) => {
  // Group errors by rowId
  const errorsByRow = useMemo(() => {
    const map = new Map<string, RowError[]>();
    errors.forEach((e) => {
      const existing = map.get(e.rowId) || [];
      map.set(e.rowId, [...existing, e]);
    });
    return map;
  }, [errors]);

  // Only show rows that have errors (and haven't been skipped)
  const problematicRows = parsedData.filter((row) => errorsByRow.has(row._id));

  if (problematicRows.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--brand-danger)',
          fontWeight: 600,
        }}
      >
        <AlertCircle size={18} />
        <span>
          {problematicRows.filter((r) => !skippedRows.has(r._id)).length} items need your attention
          before we can complete the restock:
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '50vh',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {problematicRows.map((row, index) => {
          const rowErrors = errorsByRow.get(row._id) || [];
          const isSkipped = skippedRows.has(row._id);

          return (
            <div
              key={row._id}
              style={{
                border: `1px solid ${isSkipped ? 'var(--border-color)' : 'var(--brand-danger)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                backgroundColor: isSkipped ? 'var(--bg-card-alt)' : 'rgba(239, 68, 68, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                opacity: isSkipped ? 0.6 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Row #{index + 1}: {row.product_name || 'Unnamed Product'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSkipRow(row._id)}
                  leftIcon={isSkipped ? <Check size={14} /> : <SkipForward size={14} />}
                >
                  {isSkipped ? 'Restore Row' : 'Skip Row'}
                </Button>
              </div>

              {!isSkipped && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rowErrors.map((err) => (
                    <div
                      key={`${row._id}-${err.field}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--brand-danger)',
                          fontWeight: 600,
                        }}
                      >
                        ❌ {err.message}
                      </span>
                      <Input
                        value={row[err.field] || ''}
                        onChange={(e) => updateRow(row._id, err.field, e.target.value)}
                        placeholder={`Enter valid ${String(err.field).replace('_', ' ')}`}
                        style={{ borderColor: 'var(--brand-danger)' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
