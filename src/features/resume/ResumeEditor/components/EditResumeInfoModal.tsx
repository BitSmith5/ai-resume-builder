import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  IconButton 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface EditResumeInfoModalProps {
  open: boolean;
  onClose: () => void;
  resumeData: any;
  onSave: (updatedData: any) => Promise<void>;
}

export const EditResumeInfoModal: React.FC<EditResumeInfoModalProps> = ({
  open,
  onClose,
  resumeData,
  onSave
}) => {
  const [editFormData, setEditFormData] = useState({
    title: resumeData.title || '',
    jobTitle: resumeData.jobTitle || "",
  });

  if (!open) return null;

  return (
    <>
      {/* Backdrop overlay for Edit Resume Info popup */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 2000,
        }}
        onClick={onClose}
      />
      {/* Popup content */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: '0 18px 18px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 8px rgba(0,0,0,0.10)',
          zIndex: 2001,
          width: 500,
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
            Edit Resume Info
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#666' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Box sx={{ mx: 0, mb: 3, height: 1.5, backgroundColor: '#e0e0e0' }} />

        {/* Form Fields */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            * Resume Name
          </Typography>
          <TextField
            fullWidth
            value={editFormData.title}
            onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter your resume name"
            inputProps={{
              style: {
                fontSize: '14px',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                height: 40,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Target Job Title
          </Typography>
          <TextField
            fullWidth
            value={editFormData.jobTitle}
            onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
            placeholder="Enter the job title you're aiming for (e.g., Product Manager)"
            inputProps={{
              style: {
                fontSize: '14px',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                height: 40,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              flex: 1,
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              color: '#222',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                backgroundColor: '#f5f5f5',
                border: '1px solid transparent',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const updatedResumeData = {
                ...resumeData,
                title: editFormData.title,
                jobTitle: editFormData.jobTitle,
              };
              await onSave(updatedResumeData);
              onClose();
            }}
            sx={{
              flex: 1,
              borderRadius: 2,
              background: 'rgb(173, 126, 233)',
              color: '#222',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'rgb(193, 146, 253)',
              },
            }}
          >
            Update
          </Button>
        </Box>
      </Box>
    </>
  );
};
