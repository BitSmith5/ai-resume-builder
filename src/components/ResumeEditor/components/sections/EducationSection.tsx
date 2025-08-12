import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ResumeData } from '../../types';

interface EducationSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: undefined
    };
    setResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation]
    }));
  };

  const updateEducation = (index: number, updates: Partial<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      education: (prev.education || []).map((edu, i) =>
        i === index ? { ...edu, ...updates } : edu
      )
    }));
  };

  const deleteEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Education
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Education');
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
      
      {/* Education Entries */}
      {(resumeData.education || []).map((education, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          {/* Institution and Degree */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb', mr: 1 }} />
            <TextField
              value={education.institution}
              onChange={(e) => updateEducation(index, { institution: e.target.value })}
              placeholder="Institution"
              variant="standard"
              sx={{ fontWeight: 600, mr: 2, minWidth: 200 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              value={education.degree}
              onChange={(e) => updateEducation(index, { degree: e.target.value })}
              placeholder="Degree"
              variant="standard"
              sx={{ flex: 1, mr: 2 }}
              InputProps={{ disableUnderline: true }}
            />
            <IconButton
              size="small"
              onClick={() => deleteEducation(index)}
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Field of Study */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 3 }}>
            <TextField
              value={education.field}
              onChange={(e) => updateEducation(index, { field: e.target.value })}
              placeholder="Field of Study"
              variant="standard"
              sx={{ mr: 2, minWidth: 200 }}
              InputProps={{ disableUnderline: true }}
            />
          </Box>

          {/* Dates and GPA */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 3 }}>
            <TextField
              value={education.startDate}
              onChange={(e) => updateEducation(index, { startDate: e.target.value })}
              placeholder="Start Date"
              variant="standard"
              sx={{ mr: 2, minWidth: 100 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              value={education.endDate}
              onChange={(e) => updateEducation(index, { endDate: e.target.value })}
              placeholder="End Date"
              variant="standard"
              sx={{ mr: 2, minWidth: 100 }}
              InputProps={{ disableUnderline: true }}
              disabled={education.current}
            />
            <TextField
              value={education.gpa || ''}
              onChange={(e) => updateEducation(index, { gpa: parseFloat(e.target.value) || undefined })}
              placeholder="GPA"
              variant="standard"
              sx={{ mr: 2, minWidth: 80 }}
              InputProps={{ disableUnderline: true }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={education.current}
                  onChange={(e) => updateEducation(index, { current: e.target.checked })}
                />
              }
              label="Current"
            />
          </Box>
        </Box>
      ))}

      {/* Add Education Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addEducation}
        variant="outlined"
        size="small"
        sx={{ 
          textTransform: 'none', 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          color: 'black',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            border: '1px solid #f5f5f5'
          }
        }}
      >
        Add Education
      </Button>
    </Box>
  );
};
