import { useContext } from 'react';
import { NetworkContext, type NetworkContextType } from '../contexts/NetworkContext';

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider wrapper');
  }
  return context;
};
