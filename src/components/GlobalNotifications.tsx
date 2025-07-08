'use client';

import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor, Button } from '@mui/material';
import { useNotifications, useAppStore } from '@/lib/store';

export const GlobalNotifications: React.FC = () => {
  const notifications = useNotifications();
  const removeNotification = useAppStore((state) => state.removeNotification);
  const [currentNotification, setCurrentNotification] = useState<typeof notifications[0] | null>(null);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications, currentNotification]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    
    if (currentNotification) {
      removeNotification(currentNotification.id);
      setCurrentNotification(null);
    }
  };

  const handleActionClick = () => {
    if (currentNotification?.action) {
      currentNotification.action.onClick();
    }
    handleClose();
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.severity as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
        action={
          currentNotification.action ? (
            <Button
              color="inherit"
              size="small"
              onClick={handleActionClick}
              sx={{ textTransform: 'none' }}
            >
              {currentNotification.action.label}
            </Button>
          ) : undefined
        }
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
}; 