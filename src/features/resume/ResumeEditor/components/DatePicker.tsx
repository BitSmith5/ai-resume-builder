import React, { useState } from 'react';
import { Box, Button } from '@mui/material';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  position: { x: number; y: number };
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  position 
}) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 3000,
        }}
        onClick={() => {
          onClose();
          setSelectedYear(null);
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          background: '#fff',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 3001,
          px: 1,
          minWidth: 100,
          transform: 'scaleY(0)',
          transformOrigin: 'top',
          animation: 'expandDown 0.2s ease-out forwards',
          '@keyframes expandDown': {
            '0%': {
              transform: 'scaleY(0)',
              opacity: 0,
            },
            '100%': {
              transform: 'scaleY(1)',
              opacity: 1,
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!selectedYear ? (
          // Year Selection
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            maxHeight: 200, 
            overflowY: 'auto',
            overflowX: 'hidden',
            alignItems: 'flex-start',
            pr: 0.5,
            ml: -0.5,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              margin: '0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cccccc',
              borderRadius: '2px',
              margin: '0',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#aaaaaa',
            },
          }}>
            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <Box
                key={year}
                onClick={() => setSelectedYear(year)}
                sx={{
                  py: 0.25,
                  px: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  textAlign: 'left',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              >
                {year}
              </Box>
            ))}
          </Box>
        ) : (
          // Month Selection
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            maxHeight: 200, 
            overflowY: 'auto',
            overflowX: 'hidden',
            alignItems: 'flex-start',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              margin: '0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cccccc',
              borderRadius: '2px',
              margin: '0',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#aaaaaa',
            },
          }}>
            {[
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ].map((month) => (
              <Box
                key={month}
                onClick={() => {
                  const dateString = `${month} ${selectedYear}`;
                  onSelect(dateString);
                  setSelectedYear(null);
                }}
                sx={{
                  py: 0.25,
                  px: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  textAlign: 'left',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  width: '100%',
                }}
              >
                {month}
              </Box>
            ))}
          </Box>
        )}
        
        {selectedYear && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              onClick={() => setSelectedYear(null)}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.8rem',
                color: 'rgb(173, 126, 233)',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
            >
              Back to Years
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};
