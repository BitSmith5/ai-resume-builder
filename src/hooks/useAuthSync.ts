'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserActions, User } from '@/lib/store';

export const useAuthSync = () => {
  const { data: session, status } = useSession();
  const [shouldSync, setShouldSync] = useState(false);
  
  // Always call the hook, but we'll conditionally use its return value
  const userActions = useUserActions();
  const { setUser, setAuthenticated } = userActions;
  
  // Set shouldSync to true after a delay to ensure we're on client side
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldSync(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldSync || status === 'loading') {
      return;
    }

    if (session?.user && 'id' in session.user) {
      const user = session.user as User;
      setUser(user);
    } else {
      setUser(null);
    }
  }, [session, status, setUser, shouldSync]);

  useEffect(() => {
    if (!shouldSync) {
      return;
    }
    setAuthenticated(status === 'authenticated');
  }, [status, setAuthenticated, shouldSync]);

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}; 