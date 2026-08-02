import { useContext } from 'react';
import { ExpenseContext } from '../contexts/ExpenseContext';

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
