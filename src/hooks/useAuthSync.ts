'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserActions, User } from '@/lib/store';

export const useAuthSync = () => {
  const { data: session, status } = useSession();
  
  // Use the action selector to get only the user-related actions
  const { setUser, setAuthenticated } = useUserActions();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session?.user && 'id' in session.user) {
      const user = session.user as User;
      setUser(user);
    } else {
      setUser(null);
    }
  }, [session, status, setUser]);

  useEffect(() => {
    setAuthenticated(status === 'authenticated');
  }, [status, setAuthenticated]);

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}; 