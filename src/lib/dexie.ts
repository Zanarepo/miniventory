import Dexie, { type EntityTable } from 'dexie';
import type { Business } from '../types/business';
import type { Profile } from '../types/auth';
import type { Product, ProductCategory, InventoryTransaction } from '../types/inventory';
import type { Sale, SaleItem } from '../types/sales';
import type { Expense, ExpenseCategory } from '../types/expenses';
import type { ReportHistory } from '../types/reports';

export interface SyncQueueItem {
  id?: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity:
    | 'product'
    | 'product_category'
    | 'inventory_transaction'
    | 'sale'
    | 'expense'
    | 'expense_category'
    | 'profile'
    | 'business'
    | 'report_history'
    | 'audit_log';
  payload: unknown;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount?: number;
  failedAt?: number;
  reason?: string;
}

export interface CachedProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  updatedAt: string;
}

export interface CachedSale {
  id: string;
  date: string;
  total: number;
  customerId?: string;
  status: 'synced' | 'pending';
}

export interface CachedExpense {
  id: string;
  date: string;
  amount: number;
  category: string;
}

export interface CachedAuditLog {
  id: string;
  business_id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  user_agent: string;
  created_at: string;
  status: 'synced' | 'pending';
}

export class BizTrackDatabase extends Dexie {
  auditLogs!: EntityTable<CachedAuditLog, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  cachedProducts!: EntityTable<CachedProduct, 'id'>;
  cachedSales!: EntityTable<CachedSale, 'id'>;
  cachedExpenses!: EntityTable<CachedExpense, 'id'>;
  cachedBusinesses!: EntityTable<Business, 'id'>;
  cachedProfiles!: EntityTable<Profile, 'id'>;
  products!: EntityTable<Product, 'id'>;
  productCategories!: EntityTable<ProductCategory, 'id'>;
  inventoryTransactions!: EntityTable<InventoryTransaction, 'id'>;
  sales!: EntityTable<Sale, 'id'>;
  saleItems!: EntityTable<SaleItem, 'id'>;
  expenseCategories!: EntityTable<ExpenseCategory, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  reportHistory!: EntityTable<ReportHistory, 'id'>;

  constructor() {
    super('BizTrackDB');
    this.version(1).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
    });
    this.version(2).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
    });
    this.version(3).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
    });
    this.version(4).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
    });
    this.version(5).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
      sales: 'id, business_id, receipt_number, created_at',
      saleItems: 'id, sale_id, product_id',
    });
    this.version(6).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
      sales: 'id, business_id, receipt_number, created_at',
      saleItems: 'id, sale_id, product_id',
      expenseCategories: 'id, business_id, name',
      expenses: 'id, business_id, category_id, expense_date, deleted_at',
    });
    this.version(7).stores({
      syncQueue: '++id, action, entity, status, createdAt',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
      sales: 'id, business_id, receipt_number, created_at',
      saleItems: 'id, sale_id, product_id',
      expenseCategories: 'id, business_id, name',
      expenses: 'id, business_id, category_id, expense_date, deleted_at',
      reportHistory: 'id, businessId, reportType, exportFormat, generatedAt',
    });
    this.version(8).stores({
      syncQueue: '++id, action, entity, status, createdAt, retryCount',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
      sales: 'id, business_id, receipt_number, created_at',
      saleItems: 'id, sale_id, product_id',
      expenses: 'id, business_id, category_id, expense_date, deleted_at',
      reportHistory: 'id, businessId, reportType, exportFormat, generatedAt',
    });
    this.version(9).stores({
      syncQueue: '++id, action, entity, status, createdAt, retryCount',
      cachedProducts: 'id, name, price, stock, updatedAt',
      cachedSales: 'id, date, total, status',
      cachedExpenses: 'id, date, amount, category',
      cachedBusinesses: 'id, owner_id, business_name, updated_at',
      cachedProfiles: 'id, email, phone',
      products: 'id, business_id, category_id, product_name, sku, is_active',
      productCategories: 'id, business_id, name',
      inventoryTransactions: 'id, business_id, product_id, movement_type, created_at',
      sales: 'id, business_id, receipt_number, created_at',
      saleItems: 'id, sale_id, product_id',
      expenseCategories: 'id, business_id, name',
      expenses: 'id, business_id, category_id, expense_date, deleted_at',
      reportHistory: 'id, businessId, reportType, exportFormat, generatedAt',
      auditLogs: 'id, business_id, user_id, action, entity, created_at, status',
    });
  }
}

export const db = new BizTrackDatabase();
