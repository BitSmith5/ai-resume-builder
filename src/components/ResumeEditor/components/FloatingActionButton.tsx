import React from 'react';
import { Box, Button } from '@mui/material';
import { List as ListIcon } from '@mui/icons-material';

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
          background: 'rgb(173, 126, 233)',
          boxShadow: 'none',
          '&:hover': {
            background: 'rgb(193, 146, 253)',
          }
        }}
        onClick={onClick}
      >
        <ListIcon sx={{ fontSize: 28, color: 'black', fontWeight: 500 }} />
      </Button>
    </Box>
  );
};
