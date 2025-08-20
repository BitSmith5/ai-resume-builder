'use client';

import { ReactNode } from 'react';

interface AuthSyncProviderProps {
  children: ReactNode;
}

export const AuthSyncProvider: React.FC<AuthSyncProviderProps> = ({ children }) => {
  // For now, just render children without auth sync to avoid SSR issues
  // We'll implement auth sync later in a different way
  return <>{children}</>;
}; 