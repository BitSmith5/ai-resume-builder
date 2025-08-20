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
        onClick={onClick}
        aria-label="Edit resume layout and section order"
        aria-describedby="layout-button-description"
        aria-haspopup="dialog"
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
      >
        <ListIcon sx={{ fontSize: 28, color: 'black', fontWeight: 500 }} />
      </Button>
      
      {/* Hidden description for screen readers */}
      <div id="layout-button-description" className="sr-only">
        Opens a dialog to edit the resume layout, reorder sections, and add new sections to your resume.
      </div>
    </Box>
  );
};
