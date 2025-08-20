import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface ResumeHeaderProps {
  resumeTitle: string;
  jobTitle?: string;
  loading: boolean;
  onClose: () => void;
  onEditResumeInfo: () => void;
  onExport: () => Promise<void>;
  onDelete: () => void;
  onSaveBeforeClose?: () => Promise<void>;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
  resumeTitle, loading, onClose, onEditResumeInfo, onExport, onDelete,
}) => {
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await onExport();
    } catch {
      setError('Failed to export resume');
    } finally {
      setExportLoading(false);
    }
  };

  const handleClose = async () => {
    // With optimistic updates, changes are already saved
    // Just close immediately - no need to wait for save
    onClose();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
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
            onClick={handleClose}
            disabled={loading}
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
                background: 'linear-gradient(90deg, rgb(173, 126, 233) 0%, rgb(203, 156, 263) 100%)',
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
            startIcon={exportLoading ? null : <DownloadIcon />}
            onClick={handleExport}
            disabled={exportLoading || loading}
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
              },
              '&:disabled': {
                backgroundColor: '#f5f5f5',
                color: '#999',
              }
            }}
          >
            {exportLoading ? 'Saving...' : 'Export'}
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

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
