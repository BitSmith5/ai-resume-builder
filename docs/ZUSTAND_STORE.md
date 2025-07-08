# Zustand Global Store Documentation

This document explains how to use the Zustand global store for managing user information, resume drafts, and global notifications in the AI Resume Builder application.

## Overview

The Zustand store provides a centralized state management solution with the following features:

- **User Management**: Store and sync current user information with NextAuth
- **Resume Drafts**: Manage local resume drafts with dirty state tracking
- **Global Notifications**: MUI Snackbar-based notification system
- **Persistence**: Automatic persistence of user data and drafts
- **TypeScript Support**: Full type safety throughout the application

## Store Structure

### Core Store File: `src/lib/store.ts`

The main store contains:

```typescript
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Resume drafts state
  resumeDrafts: ResumeDraft[];
  currentDraft: ResumeDraft | null;
  
  // Notifications state
  notifications: SnackbarNotification[];
  
  // Actions for each state slice
  setUser: (user: User | null) => void;
  addResumeDraft: (draft: ResumeDraft) => void;
  addNotification: (notification: Omit<SnackbarNotification, 'id'>) => void;
  // ... more actions
}
```

## Usage Examples

### 1. User Management

```typescript
import { useUser, useIsAuthenticated, useAppStore } from '@/lib/store';

function MyComponent() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { setUser } = useAppStore();

  // Access user data
  console.log(user?.name, user?.email);

  // Update user (usually handled by auth sync)
  setUser(newUserData);
}
```

### 2. Resume Drafts

```typescript
import { useResumeDrafts, useCurrentDraft, useAppStore } from '@/lib/store';

function ResumeEditor() {
  const drafts = useResumeDrafts();
  const currentDraft = useCurrentDraft();
  const { addResumeDraft, updateResumeDraft, setCurrentDraft } = useAppStore();

  // Create new draft
  const createDraft = () => {
    addResumeDraft({
      title: 'New Resume',
      content: { sections: [] },
      strengths: []
    });
  };

  // Update existing draft
  const updateDraft = (id: number, updates: Partial<ResumeDraft>) => {
    updateResumeDraft(id, updates);
  };

  // Select current draft
  const selectDraft = (draft: ResumeDraft) => {
    setCurrentDraft(draft);
  };
}
```

### 3. Global Notifications

```typescript
import { useNotificationActions } from '@/hooks/useNotifications';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationActions();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data');
    }
  };

  const handleDelete = () => {
    showActionNotification(
      'Are you sure you want to delete this item?',
      'Undo',
      () => restoreItem(),
      'warning',
      10000
    );
  };
}
```

## Available Hooks

### Store Selectors

- `useUser()` - Get current user
- `useIsAuthenticated()` - Check authentication status
- `useResumeDrafts()` - Get all resume drafts
- `useCurrentDraft()` - Get currently selected draft
- `useNotifications()` - Get all notifications

### Utility Hooks

- `useDraftById(id)` - Get specific draft by ID
- `useDirtyDrafts()` - Get only modified drafts
- `useNotificationActions()` - Get notification helper functions

### Auth Sync Hook

- `useAuthSync()` - Sync NextAuth session with store (used internally)

## Components

### GlobalNotifications

Located at `src/components/GlobalNotifications.tsx`

This component automatically renders notifications from the store using MUI Snackbar. It's included in the main Providers component.

### AuthSyncProvider

Located at `src/components/AuthSyncProvider.tsx`

This component syncs NextAuth session data with the Zustand store automatically.

## Setup

The store is automatically set up when you use the `Providers` component in your app:

```typescript
// In your root layout
import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## Persistence

The store automatically persists the following data to localStorage:

- User information
- Authentication status
- Resume drafts

Notifications and current draft selection are not persisted as they are session-specific.

## TypeScript Types

All types are exported from `src/lib/store.ts`:

```typescript
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ResumeDraft {
  id?: number;
  title: string;
  content: any;
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
```

## Best Practices

1. **Use Selectors**: Always use the provided selector hooks instead of accessing the full store state
2. **Batch Updates**: When updating multiple fields, use a single `updateResumeDraft` call
3. **Notification Duration**: Use longer durations for errors (8s) and shorter for success (6s)
4. **Dirty State**: The store automatically tracks which drafts have been modified
5. **Type Safety**: Always use the provided TypeScript interfaces

## Demo Component

See `src/components/StoreDemo.tsx` for a complete example of how to use all store features.

## Migration from Other State Management

If you're migrating from other state management solutions:

1. Replace `useState` for global state with store selectors
2. Replace context providers with store actions
3. Replace manual notification systems with `useNotificationActions`
4. Update components to use the new hooks

## Troubleshooting

### Common Issues

1. **Store not updating**: Make sure you're using the correct selector hooks
2. **Notifications not showing**: Ensure `GlobalNotifications` is included in your Providers
3. **Auth not syncing**: Check that `AuthSyncProvider` is properly set up
4. **Persistence issues**: Verify localStorage is available and not blocked

### Debug Mode

The store includes Redux DevTools integration. Install the Redux DevTools browser extension to debug store state changes. 