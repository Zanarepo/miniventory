export interface ProductCategory {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export type StockMovementType =
  | 'Opening Stock'
  | 'Stock Adjustment Increase'
  | 'Stock Adjustment Decrease'
  | 'Damaged Stock'
  | 'Returned Stock'
  | 'Sales Deduction'
  | 'Void Restock';

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  product_name: string;
  sku?: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  unit: string;
  bulk_unit?: string;
  conversion_ratio?: number;
  bulk_cost_price?: number;
  bulk_selling_price?: number;
  minimum_stock: number;
  image_url?: string;
  is_active: boolean;
  is_serialized?: boolean;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: string;
  business_id: string;
  name: string;
  is_default: boolean;
  created_at?: string;
}

export interface ProductLocation {
  product_id: string;
  location_id: string;
  reorder_threshold: number;
  quantity: number;
}

export interface RestockBatch {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  cost_price: number;
  created_by?: string;
  status: 'ACTIVE' | 'VOID';
  void_reason?: string;
  created_at?: string;
}

export interface ItemUnit {
  id: string;
  business_id: string;
  product_id: string;
  serial_barcode: string;
  status: 'AVAILABLE' | 'SOLD' | 'VOID' | 'PENDING_RESTOCK';
  restock_batch_id?: string;
  cost_price: number;
  created_at?: string;
}

export interface PendingRestock {
  id: string;
  business_id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  serials: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_by: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface InventoryTransaction {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number; // Signed numeric quantity (+ for increase, - for decrease)
  unit_cost?: number;
  remarks?: string;
  created_by?: string;
  created_at?: string;
}

export interface InventorySummary {
  product_id: string;
  current_stock: number;
}

export interface ProductWithStock extends Product {
  current_stock: number;
  category_name?: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  valuation: number; // current_stock * cost_price
}

export interface InventoryContextType {
  products: ProductWithStock[];
  categories: ProductCategory[];
  transactions: InventoryTransaction[];
  locations: Location[];
  restockBatches: RestockBatch[];
  itemUnits: ItemUnit[];
  isLoading: boolean;
  error: string | null;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  createCategory: (name: string, description?: string) => Promise<ProductCategory | null>;
  createProduct: (
    productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>,
    openingStock: number,
    unitCost?: number,
  ) => Promise<Product | null>;
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'business_id'>>,
  ) => Promise<boolean>;
  archiveProduct: (id: string) => Promise<boolean>;
  recordStockAdjustment: (
    productId: string,
    movementType: StockMovementType,
    quantity: number,
    unitCost: number | undefined,
    remarks: string,
  ) => Promise<boolean>;
  createRestockBatch: (
    productId: string,
    quantity: number,
    costPrice: number,
    serials?: string[],
    customRemarks?: string,
  ) => Promise<boolean>;
  voidRestockBatch: (batchId: string, reason: string) => Promise<boolean>;
  voidItemUnit: (unit: ItemUnit, reason: string) => Promise<boolean>;
  refreshInventory: () => Promise<void>;
}
