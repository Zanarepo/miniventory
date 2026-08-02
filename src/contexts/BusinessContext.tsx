import { createContext } from 'react';
import type { Business } from '../types/business';

export interface BusinessContextType {
  business: Business | null;
  isLoading: boolean;
  createBusiness: (
    data: Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>,
  ) => Promise<{ error: Error | null; data: Business | null }>;
  updateBusiness: (
    data: Partial<Business>,
  ) => Promise<{ error: Error | null; data: Business | null }>;
  refreshBusiness: () => Promise<void>;
  getCurrencySymbol: () => string;
}

export const BusinessContext = createContext<BusinessContextType>({
  business: null,
  isLoading: true,
  createBusiness: async () => ({ error: new Error('BusinessContext uninitialized'), data: null }),
  updateBusiness: async () => ({ error: new Error('BusinessContext uninitialized'), data: null }),
  refreshBusiness: async () => {},
  getCurrencySymbol: () => '₦',
});
