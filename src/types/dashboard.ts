import type { BusinessHealth } from './financials';

export interface DashboardKPIs {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  cashPosition: number;
  inventoryValue: number;
  activeProducts: number;
  comparisonPeriod: string;

  // Extended fields for comparison and UI enrichment
  todaySalesChangePerc: number;
  todayExpensesChangePerc: number;
  todayProfitChangePerc: number;
  cashIn: number;
  cashOut: number;
  isSalesUp: boolean;
  isExpensesUp: boolean;
  isProfitUp: boolean;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface ExpenseTrend {
  date: string;
  amount: number;
  category?: string;
}

export interface ProfitTrend {
  date: string;
  profit: number;
}

export interface InventorySummary {
  products: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface RecentTransaction {
  id: string;
  type: 'sale' | 'expense' | 'inventory';
  description: string;
  amount?: number;
  occurredAt: string;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  revenueTrend: RevenueTrend[];
  expenseTrend: ExpenseTrend[];
  profitTrend: ProfitTrend[];
  inventory: InventorySummary;
  topProducts: TopProduct[];
  recentTransactions: RecentTransaction[];
  businessHealth: BusinessHealth;
}
