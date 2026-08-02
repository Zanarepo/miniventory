export interface FinancialSummary {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  cashPosition: number;
  inventoryValue: number;
}

export interface BusinessHealth {
  score: number;
  rating: 'Excellent' | 'Healthy' | 'Stable' | 'At Risk' | 'Critical';
  evaluatedAt: string;
}

export type PeriodSelection =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_YEAR'
  | 'CUSTOM';
