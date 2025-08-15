import React from 'react';
import { Alert } from '@mui/material';

interface AlertMessagesProps {
  error?: string | null;
  success?: string | null;
}

export const AlertMessages: React.FC<AlertMessagesProps> = ({ error, success }) => {
  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
    </>
  );
};
