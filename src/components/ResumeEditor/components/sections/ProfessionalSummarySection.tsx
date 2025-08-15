import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { ResumeData } from '../../types';

interface ProfessionalSummarySectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const ProfessionalSummarySection: React.FC<ProfessionalSummarySectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Professional Summary
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Professional Summary');
          }}
          sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid #f5f5f5',
              borderRadius: '50%'
            }
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <TextField
        multiline
        maxRows={15}
        value={resumeData.content.personalInfo.summary}
        onChange={(e) =>
          setResumeData((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              personalInfo: {
                ...prev.content.personalInfo,
                summary: e.target.value,
              },
            },
          }))
        }
        onPaste={(e) => {
          e.preventDefault();
          const pastedText = e.clipboardData.getData('text');
          
          // Process pasted text to remove line breaks and normalize spacing
          let processedText = pastedText;
          
          // Replace multiple spaces with single space
          processedText = processedText.replace(/\s+/g, ' ');
          
          // Remove line breaks and replace with spaces
          processedText = processedText.replace(/\n/g, ' ');
          
          // Trim extra spaces
          processedText = processedText.trim();
          
          setResumeData((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              personalInfo: {
                ...prev.content.personalInfo,
                summary: processedText,
              },
            },
          }));
        }}
        placeholder="Write a compelling professional summary..."
        variant="standard"
        sx={{
          width: '80%',
          '& .MuiInputBase-root': {
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
            },
            '& .MuiInputBase-input': {
              padding: '5px 12px 5px 12px',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
            },
          },
        }}
        InputProps={{
          disableUnderline: true,
          style: { fontSize: '0.875rem' }
        }}
      />
    </Box>
  );
};
