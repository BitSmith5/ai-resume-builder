'use client';

import { ReactNode } from 'react';
import { useAuthSync } from '@/hooks/useAuthSync';

interface AuthSyncProviderProps {
  children: ReactNode;
}

export const AuthSyncProvider: React.FC<AuthSyncProviderProps> = ({ children }) => {
  // This component just calls the hook to sync auth state
  // The hook handles all the synchronization logic
  useAuthSync();
  
  return <>{children}</>;
}; 