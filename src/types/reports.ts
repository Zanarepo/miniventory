export type ReportPeriodType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'quarter'
  | 'year'
  | 'custom';

export type ReportType =
  'sales' | 'expenses' | 'inventory' | 'profit' | 'performance' | 'financial_summary';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'print';

export interface ReportFilter {
  startDate: string;
  endDate: string;
  reportType: ReportType | string;
  periodLabel?: string;
  periodType?: ReportPeriodType;
}

export interface ReportHistory {
  id: string;
  businessId: string;
  reportType: string;
  reportName: string;
  exportFormat: 'pdf' | 'xlsx' | 'csv' | 'print';
  generatedBy?: string;
  generatedAt: string;
  parameters?: unknown;
}

export interface BusinessPerformanceReport {
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  inventoryValue: number;
  healthScore: number;
  topSellingProduct: string;
  topExpenseCategory: string;
  mostProfitableProduct: string;
  businessTrends: string;
  reportingPeriod: string;
}

export interface SalesReportItem {
  receiptNo: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  itemsCount: number;
  productsSummary: string;
}

export interface SalesReportData {
  businessName: string;
  reportingPeriod: string;
  transactionCount: number;
  totalRevenue: number;
  estimatedGrossProfit: number;
  paymentMethodsBreakdown: { [method: string]: number };
  topSellingProducts: Array<{ name: string; qty: number; revenue: number }>;
  salesByDay: Array<{ date: string; revenue: number; transactions: number }>;
  transactions: SalesReportItem[];
}

export interface ExpenseReportItem {
  id: string;
  date: string;
  categoryName: string;
  description: string;
  amount: number;
  paymentMethod?: string;
}

export interface ExpenseReportData {
  businessName: string;
  reportingPeriod: string;
  totalExpenses: number;
  largestExpenseAmount: number;
  largestExpenseDescription: string;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  expenses: ExpenseReportItem[];
}

export interface InventoryReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface InventoryReportData {
  businessName: string;
  totalStockItems: number;
  totalUnits: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  items: InventoryReportItem[];
}

export interface ProfitReportData {
  businessName: string;
  reportingPeriod: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  healthScore: number;
  healthStatus: 'Healthy' | 'Moderate' | 'Low' | 'Critical';
  summaryMessage: string;
}

export interface FinancialSummaryData {
  businessName: string;
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  inventoryValue: number;
  cashPosition: number;
  healthRating: string;
  generatedAt: string;
}
