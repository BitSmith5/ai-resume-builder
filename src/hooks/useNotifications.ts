'use client';

import { useAppStore } from '@/lib/store';

export const useNotificationActions = () => {
  const addNotification = useAppStore((state) => state.addNotification);

  const showSuccess = (message: string, duration?: number) => {
    addNotification({
      message,
      severity: 'success',
      duration,
    });
  };

  const showError = (message: string, duration?: number) => {
    addNotification({
      message,
      severity: 'error',
      duration: duration || 8000, // Longer duration for errors
    });
  };

  const showWarning = (message: string, duration?: number) => {
    addNotification({
      message,
      severity: 'warning',
      duration,
    });
  };

  const showInfo = (message: string, duration?: number) => {
    addNotification({
      message,
      severity: 'info',
      duration,
    });
  };

  const showActionNotification = (
    message: string,
    actionLabel: string,
    actionHandler: () => void,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    addNotification({
      message,
      severity,
      duration,
      action: {
        label: actionLabel,
        onClick: actionHandler,
      },
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showActionNotification,
    addNotification, // Raw function for custom notifications
  };
}; 