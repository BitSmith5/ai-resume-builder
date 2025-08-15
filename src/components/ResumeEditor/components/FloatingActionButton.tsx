import React from 'react';
import { Box, Button } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';
import { COLORS } from '../../../lib/colorSystem';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 100,
        right: 50,
        zIndex: 1300,
      }}
    >
      <Button
        variant="contained"
        sx={{ 
          borderRadius: "50%", 
          width: 60, 
          height: 60, 
          minWidth: 60,
          minHeight: 60,
          maxWidth: 60,
          maxHeight: 60,
          padding: 0,
          background: COLORS.primary,
          boxShadow: 'none',
          '&:hover': {
            background: COLORS.hover,
          }
        }}
        onClick={onClick}
      >
        <ListIcon sx={{ fontSize: 28, color: 'black', fontWeight: 500 }} />
      </Button>
    </Box>
  );
};
