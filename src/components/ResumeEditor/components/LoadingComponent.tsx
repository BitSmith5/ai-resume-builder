import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingComponent: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      flexDirection="column"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Loading resume editor...
      </Typography>
    </Box>
  );
};
