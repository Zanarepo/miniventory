import { createContext } from 'react';
import type { FinancialSummary, BusinessHealth, PeriodSelection } from '../types/financials';

export interface FinancialContextType {
  summary: FinancialSummary;
  health: BusinessHealth;
  period: PeriodSelection;
  startDate: string;
  endDate: string;
  isLoading: boolean;
  setPeriod: (p: PeriodSelection) => void;
  setDateRange: (start: string, end: string) => void;
  refreshFinancials: () => Promise<void>;
}

export const FinancialContext = createContext<FinancialContextType | undefined>(undefined);
