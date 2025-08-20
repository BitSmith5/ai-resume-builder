import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface SnackbarNotification {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Store State Interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Notifications state
  notifications: SnackbarNotification[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<SnackbarNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Utility actions
  resetStore: () => void;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  notifications: [],
};

// Counter for generating unique IDs
let idCounter = 1;

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // User actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

        // Notification actions
        addNotification: (notification) => {
          const id = `notification-${idCounter++}`;
          const newNotification: SnackbarNotification = {
            id,
            duration: 6000, // Default 6 seconds
            ...notification,
          };
          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },

        clearNotifications: () => set({ notifications: [] }),

        // Utility actions
        resetStore: () => set(initialState),
      }),
      {
        name: 'ai-resume-builder-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          // Don't persist notifications
        }),
      }
    ),
    {
      name: 'ai-resume-builder-store',
    }
  )
);

// Selectors for better performance
export const useNotifications = () => useAppStore((state) => state.notifications);

// User-related selectors
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);

// Combined user state selector
export const useUserState = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));

// Action selectors
export const useUserActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
}));

export const useNotificationActions = () => useAppStore((state) => ({
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));