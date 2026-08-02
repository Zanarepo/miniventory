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
  | 'Sales Deduction';

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
  minimum_stock: number;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  refreshInventory: () => Promise<void>;
}
