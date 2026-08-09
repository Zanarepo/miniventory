import { createContext } from 'react';
import type { Business, BusinessRole } from '../types/business';

export interface BusinessContextType {
  business: Business | null;
  businesses: Business[]; // All businesses the user is a member of
  currentRole: BusinessRole | null;
  isLoading: boolean;
  createBusiness: (
    data: Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>,
  ) => Promise<{ error: Error | null; data: Business | null }>;
  updateBusiness: (
    data: Partial<Business>,
  ) => Promise<{ error: Error | null; data: Business | null }>;
  refreshBusiness: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  getCurrencySymbol: () => string;
}

export const BusinessContext = createContext<BusinessContextType>({
  business: null,
  businesses: [],
  currentRole: null,
  isLoading: true,
  createBusiness: async () => ({ error: new Error('BusinessContext uninitialized'), data: null }),
  updateBusiness: async () => ({ error: new Error('BusinessContext uninitialized'), data: null }),
  refreshBusiness: async () => {},
  switchBusiness: async () => {},
  getCurrencySymbol: () => '₦',
});
