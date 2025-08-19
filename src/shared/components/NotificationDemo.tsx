'use client';

import React from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { useNotificationActions } from '@/hooks';

export const NotificationDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, showActionNotification } = useNotificationActions();

  const handleShowSuccess = () => {
    showSuccess('This is a success notification!');
  };

  const handleShowError = () => {
    showError('This is an error notification!');
  };

  const handleShowWarning = () => {
    showWarning('This is a warning notification!');
  };

  const handleShowInfo = () => {
    showInfo('This is an info notification!');
  };

  const handleShowActionNotification = () => {
    showActionNotification(
      'This notification has an action button!',
      'Undo',
      () => showSuccess('Action completed!'),
      'info',
      10000
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Notification System Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click the buttons below to test different types of notifications. 
        Notifications will appear in the bottom-right corner of the screen.
      </Typography>
      
      <Stack spacing={2}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleShowSuccess}
          fullWidth
        >
          Show Success Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleShowError}
          fullWidth
        >
          Show Error Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={handleShowWarning}
          fullWidth
        >
          Show Warning Notification
        </Button>
        
        <Button 
          variant="contained" 
          color="info" 
          onClick={handleShowInfo}
          fullWidth
        >
          Show Info Notification
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleShowActionNotification}
          fullWidth
        >
          Show Action Notification
        </Button>
      </Stack>
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Features:</strong>
          <br />• Auto-dismiss with configurable duration
          <br />• Different severity levels (success, error, warning, info)
          <br />• Action buttons for interactive notifications
          <br />• Global state management with Zustand
          <br />• Material-UI integration
        </Typography>
      </Box>
    </Paper>
  );
};
