import { createContext } from 'react';

export interface NetworkContextType {
  isOnline: boolean;
  hasPendingSync: boolean;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined);
