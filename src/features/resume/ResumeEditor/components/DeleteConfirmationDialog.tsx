import React from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px #e0e0e0',
          border: '1px solid #eeeeee',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1, 
          fontWeight: 600,
          background: 'linear-gradient(135deg, rgb(173, 126, 233) 0%, rgb(203, 156, 263) 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          textAlign: 'center'
        }}
      >
        Delete Resume
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography variant="body1" sx={{ my: 3, color: '#333', lineHeight: 1.6 }}>
          Are you sure you want to delete this resume? This action cannot be undone and will permanently remove all associated data including:
        </Typography>
        <Box 
          component="ul" 
          sx={{ 
            px: 4,
            py: 2,
            mb: 3,
            backgroundColor: '#fafafa',
            borderRadius: 2,
            border: '1px solid #eeeeee'
          }}
        >
          <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
            Personal information and contact details
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
            Work experience and education history
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
            Skills, projects, and achievements
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
            Profile picture and all other resume data
          </Typography>
        </Box>
        <Box 
          sx={{ 
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: 2,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="#856404" fontWeight={600}>
            ⚠️ This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            borderColor: 'rgb(173, 126, 233)',
            color: 'rgb(173, 126, 233)',
            '&:hover': {
              borderColor: 'rgb(143, 96, 203)',
              backgroundColor: '#fafafa',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          sx={{ 
            textTransform: 'none',
            backgroundColor: '#dc3545',
            '&:hover': {
              backgroundColor: '#c82333',
            },
            '&:disabled': {
              backgroundColor: '#6c757d',
            }
          }}
        >
          {loading ? 'Deleting...' : 'Delete Resume'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
