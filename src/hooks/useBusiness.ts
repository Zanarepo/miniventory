import { useContext } from 'react';
import { BusinessContext, type BusinessContextType } from '../contexts/BusinessContext';

/**
 * Custom React hook to access the active entrepreneur's business identity and settings.
 */
export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be called within a BusinessProvider component');
  }
  return context;
};
