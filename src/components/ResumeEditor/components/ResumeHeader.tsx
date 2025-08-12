import React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { COLORS } from '../../../lib/colorSystem';

interface ResumeHeaderProps {
  resumeTitle: string;
  jobTitle?: string;
  loading: boolean;
  onClose: () => void;
  onEditResumeInfo: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
  resumeTitle,
  jobTitle,
  loading,
  onClose,
  onEditResumeInfo,
  onExport,
  onDelete,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
      }}
    >
      {/* Left: Close, PRIMARY badge, Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton 
          size="small" 
          sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e0e0e0',
            borderRadius: 2,
            px: 0.2,
            py: 0.1,
            minHeight: 28,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 1.5,
              background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
              mr: 1,
            }}
          >
            <StarIcon sx={{ fontSize: 14, color: 'black' }} />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#1a1a1a',
              fontWeight: 600,
              fontSize: '0.875rem',
              pr: 1,
            }}
          >
            {resumeTitle || 'Resume Title'}
          </Typography>
        </Box>
      </Box>
      
      {/* Right: Action buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEditResumeInfo}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            backgroundColor: 'white',
            border: 'none',
            color: 'black',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#fafafa',
            }
          }}
        >
          Edit Resume Info
        </Button>
        
        <Button
          variant="text"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            backgroundColor: 'white',
            border: 'none',
            color: 'black',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#fafafa',
            }
          }}
        >
          Export
        </Button>
        
        <Button
          variant="text"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          disabled={loading}
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            backgroundColor: 'white',
            border: 'none',
            color: loading ? '#ccc' : '#d32f2f',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: loading ? '#fafafa' : '#ffebee',
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </Box>
    </Box>
  );
};
