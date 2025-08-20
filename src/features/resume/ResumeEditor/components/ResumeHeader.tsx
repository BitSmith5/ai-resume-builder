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
        component="header"
        role="banner"
        aria-label="Resume editor header"
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
            aria-label="Close resume editor and return to dashboard"
            aria-describedby="close-button-description"
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
            role="status"
            aria-label="Resume status indicator"
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
              aria-hidden="true"
            >
              <StarIcon sx={{ fontSize: 14, color: 'black' }} />
            </Box>
            <Typography
              variant="body2"
              id="resume-title"
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
        <Box 
          component="nav" 
          role="navigation" 
          aria-label="Resume actions"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Button
            variant="text"
            size="small"
            startIcon={<EditIcon />}
            onClick={onEditResumeInfo}
            aria-label="Edit resume information and settings"
            aria-describedby="edit-resume-description"
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
            aria-label={exportLoading ? 'Exporting resume, please wait' : 'Export resume as PDF'}
            aria-describedby="export-button-description"
            aria-live="polite"
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
            aria-label={loading ? 'Deleting resume' : 'Delete resume permanently'}
            aria-describedby="delete-button-description"
            aria-live="polite"
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

      {/* Hidden descriptions for screen readers */}
      <div id="close-button-description" className="sr-only">
        Closes the resume editor and returns to the dashboard. All changes are automatically saved.
      </div>
      <div id="edit-resume-description" className="sr-only">
        Opens a dialog to edit resume title, job title, and other basic information.
      </div>
      <div id="export-button-description" className="sr-only">
        Exports the current resume as a PDF document that can be downloaded or printed.
      </div>
      <div id="delete-button-description" className="sr-only">
        Permanently deletes this resume. This action cannot be undone.
      </div>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        aria-label="Error notification"
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
          aria-label="Export error"
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
