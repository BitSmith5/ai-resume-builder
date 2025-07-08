'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore, User } from '@/lib/store';

export const useAuthSync = () => {
  const { data: session, status } = useSession();
  const { setUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session?.user) {
      const user: User = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      };
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