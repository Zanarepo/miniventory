import { useContext } from 'react';
import { InventoryContext } from '../contexts/InventoryContext';
import type { InventoryContextType } from '../types/inventory';

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
