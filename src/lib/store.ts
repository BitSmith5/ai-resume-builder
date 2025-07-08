import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ResumeDraft {
  id?: number;
  title: string;
  content: unknown;
  strengths?: Array<{
    skillName: string;
    rating: number;
  }>;
  isDirty?: boolean;
  lastModified?: Date;
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
  
  // Resume drafts state
  resumeDrafts: ResumeDraft[];
  currentDraft: ResumeDraft | null;
  
  // Notifications state
  notifications: SnackbarNotification[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  
  // Resume draft actions
  addResumeDraft: (draft: ResumeDraft) => void;
  updateResumeDraft: (id: number | string, updates: Partial<ResumeDraft>) => void;
  removeResumeDraft: (id: number | string) => void;
  setCurrentDraft: (draft: ResumeDraft | null) => void;
  clearDrafts: () => void;
  
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
  resumeDrafts: [],
  currentDraft: null,
  notifications: [],
};

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // User actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

        // Resume draft actions
        addResumeDraft: (draft) => {
          const newDraft: ResumeDraft = {
            ...draft,
            id: draft.id || Date.now(),
            isDirty: true,
            lastModified: new Date(),
          };
          set((state) => ({
            resumeDrafts: [...state.resumeDrafts, newDraft],
          }));
        },

        updateResumeDraft: (id, updates) => {
          set((state) => ({
            resumeDrafts: state.resumeDrafts.map((draft) =>
              draft.id === id
                ? {
                    ...draft,
                    ...updates,
                    isDirty: true,
                    lastModified: new Date(),
                  }
                : draft
            ),
            currentDraft:
              state.currentDraft?.id === id
                ? {
                    ...state.currentDraft,
                    ...updates,
                    isDirty: true,
                    lastModified: new Date(),
                  }
                : state.currentDraft,
          }));
        },

        removeResumeDraft: (id) => {
          set((state) => ({
            resumeDrafts: state.resumeDrafts.filter((draft) => draft.id !== id),
            currentDraft:
              state.currentDraft?.id === id ? null : state.currentDraft,
          }));
        },

        setCurrentDraft: (draft) => set({ currentDraft: draft }),
        clearDrafts: () => set({ resumeDrafts: [], currentDraft: null }),

        // Notification actions
        addNotification: (notification) => {
          const id = Date.now().toString();
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
          resumeDrafts: state.resumeDrafts,
          // Don't persist notifications or current draft
        }),
      }
    ),
    {
      name: 'ai-resume-builder-store',
    }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useResumeDrafts = () => useAppStore((state) => state.resumeDrafts);
export const useCurrentDraft = () => useAppStore((state) => state.currentDraft);
export const useNotifications = () => useAppStore((state) => state.notifications);

// Utility hooks
export const useDraftById = (id: number | string) =>
  useAppStore((state) => state.resumeDrafts.find((draft) => draft.id === id));

export const useDirtyDrafts = () =>
  useAppStore((state) => state.resumeDrafts.filter((draft) => draft.isDirty)); 