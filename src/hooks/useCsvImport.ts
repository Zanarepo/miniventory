import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { useInventory } from './useInventory';

export interface CsvRowData {
  _id: string;
  product_name: string;
  barcode_or_serial: string;
  quantity: string;
  cost_price: string;
  selling_price: string;
  [key: string]: any;
}

export interface RowError {
  rowId: string;
  field: keyof CsvRowData;
  code: string;
  message: string;
}

// Removed HEADER_ALIASES, using robust substring matching instead

export const useCsvImport = () => {
  const { itemUnits } = useInventory();

  const [parsedData, setParsedData] = useState<CsvRowData[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skippedRows, setSkippedRows] = useState<Set<string>>(new Set());

  // Helper to normalize header strings
  const normalizeHeader = (header: string) => {
    const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (clean.includes('cost') || clean.includes('buy')) return 'cost_price';
    if (clean.includes('sell') || (clean.includes('price') && !clean.includes('cost')))
      return 'selling_price';
    if (
      clean.includes('qty') ||
      clean.includes('count') ||
      clean.includes('amount') ||
      clean.includes('quant') ||
      clean.includes('unit')
    )
      return 'quantity';
    if (
      clean.includes('barcod') ||
      clean.includes('serial') ||
      clean.includes('sn') ||
      clean.includes('imei') ||
      clean.includes('upc') ||
      clean.includes('code')
    )
      return 'barcode_or_serial';
    if (
      clean.includes('product') ||
      clean.includes('item') ||
      clean.includes('name') ||
      clean.includes('title')
    )
      return 'product_name';

    return header;
  };

  const validateRow = useCallback(
    (row: CsvRowData): RowError[] => {
      const rowErrors: RowError[] = [];

      // 1. Product Name Validation
      if (!row.product_name?.trim()) {
        rowErrors.push({
          rowId: row._id,
          field: 'product_name',
          code: 'MISSING_NAME',
          message: 'Product name required',
        });
      }

      // 2. Barcode/Serial Uniqueness Check
      const barcode = row.barcode_or_serial?.trim();
      if (!barcode) {
        rowErrors.push({
          rowId: row._id,
          field: 'barcode_or_serial',
          code: 'MISSING_BARCODE',
          message: 'Barcode/Serial required',
        });
      } else {
        const isDuplicate = itemUnits.some((u) => u.serial_barcode === barcode);
        if (isDuplicate) {
          rowErrors.push({
            rowId: row._id,
            field: 'barcode_or_serial',
            code: 'DUPLICATE_SERIAL',
            message: 'Serial already exists',
          });
        }
      }

      // 3. Numeric Sanitization
      if (row.quantity !== undefined && row.quantity !== '') {
        const qty = parseInt(String(row.quantity), 10);
        if (isNaN(qty)) {
          rowErrors.push({
            rowId: row._id,
            field: 'quantity',
            code: 'NON_NUMERIC_QTY',
            message: 'Numbers only',
          });
        } else if (qty < 1) {
          rowErrors.push({
            rowId: row._id,
            field: 'quantity',
            code: 'INVALID_QTY',
            message: 'Quantity must be >= 1',
          });
        }
      }

      if (row.cost_price !== undefined && row.cost_price !== '') {
        const cost = parseFloat(String(row.cost_price));
        if (isNaN(cost) || cost < 0) {
          rowErrors.push({
            rowId: row._id,
            field: 'cost_price',
            code: 'INVALID_COST',
            message: 'Must be positive',
          });
        }
      }

      if (row.selling_price !== undefined && row.selling_price !== '') {
        const price = parseFloat(String(row.selling_price));
        if (isNaN(price) || price < 0) {
          rowErrors.push({
            rowId: row._id,
            field: 'selling_price',
            code: 'INVALID_PRICE',
            message: 'Must be positive',
          });
        }
      }

      return rowErrors;
    },
    [itemUnits],
  );

  const validateAll = useCallback(
    (data: CsvRowData[]) => {
      let allErrors: RowError[] = [];
      const seenSerials = new Set<string>();

      data.forEach((row) => {
        const rowErrs = validateRow(row);

        const barcode = row.barcode_or_serial?.trim();
        if (barcode) {
          if (seenSerials.has(barcode)) {
            if (!rowErrs.some((e) => e.field === 'barcode_or_serial')) {
              rowErrs.push({
                rowId: row._id,
                field: 'barcode_or_serial',
                code: 'DUPLICATE_SERIAL_FILE',
                message: 'Duplicate in file',
              });
            }
          } else {
            seenSerials.add(barcode);
          }
        }

        allErrors = [...allErrors, ...rowErrs];
      });

      setErrors(allErrors);
      return allErrors;
    },
    [validateRow],
  );

  const parseFile = (file: File) => {
    setIsProcessing(true);
    setSkippedRows(new Set());

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => normalizeHeader(header),
      complete: (results) => {
        const mappedData: CsvRowData[] = results.data.map((row: any, index) => {
          return {
            _id: `row-${Date.now()}-${index}`,
            product_name: String(row.product_name || ''),
            barcode_or_serial: String(row.barcode_or_serial || ''),
            quantity: row.quantity !== undefined ? String(row.quantity) : '1',
            cost_price: row.cost_price !== undefined ? String(row.cost_price) : '',
            selling_price: row.selling_price !== undefined ? String(row.selling_price) : '',
            _original: row,
          };
        });

        setParsedData(mappedData);
        validateAll(mappedData);
        setIsProcessing(false);
      },
      error: (err) => {
        console.error('Parse error:', err);
        setIsProcessing(false);
      },
    });
  };

  const updateRow = (rowId: string, field: keyof CsvRowData, value: string) => {
    setParsedData((prev) => {
      const newData = prev.map((row) => (row._id === rowId ? { ...row, [field]: value } : row));
      validateAll(newData);
      return newData;
    });
  };

  const toggleSkipRow = (rowId: string) => {
    setSkippedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  return {
    parseFile,
    parsedData,
    errors,
    isProcessing,
    skippedRows,
    updateRow,
    toggleSkipRow,
    validateAll,
    setParsedData,
    setErrors,
    setSkippedRows,
  };
};
