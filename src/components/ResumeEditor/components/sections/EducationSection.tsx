import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
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
        <Card key={index} sx={{ mb: 3, p: 2, mr: 2 }}>
          {/* Institution and Degree */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
            <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb', cursor: 'grab' }} />
            <TextField
              value={education.institution}
              onChange={(e) => updateEducation(index, { institution: e.target.value })}
              placeholder="Institution"
              variant="outlined"
              label="Institution"
              size="small"
              sx={{ fontWeight: 600, width: 400 }}
            />
            <TextField
              value={education.degree}
              onChange={(e) => updateEducation(index, { degree: e.target.value })}
              placeholder="Degree"
              variant="outlined"
              label="Degree"
              size="small"
              sx={{ width: 150 }}
            />
            <IconButton
              size="small"
              onClick={() => deleteEducation(index)}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  border: '1px solid #a0a0a0',
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Field of Study */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 4.5 }}>
            <TextField
              value={education.field}
              onChange={(e) => updateEducation(index, { field: e.target.value })}
              placeholder="Field of Study"
              variant="outlined"
              label="Field of Study"
              size="small"
              sx={{ width: 300 }}
            />
          </Box>

          {/* Dates and GPA */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5, gap: 2 }}>
            <TextField
              value={education.startDate}
              onChange={(e) => updateEducation(index, { startDate: e.target.value })}
              placeholder="Start Date"
              variant="outlined"
              label="Start Date"
              size="small"
              sx={{ width: 150 }}
            />
            <TextField
              value={education.endDate}
              onChange={(e) => updateEducation(index, { endDate: e.target.value })}
              placeholder="End Date"
              variant="outlined"
              label="End Date"
              size="small"
              sx={{ width: 150 }}
              disabled={education.current}
            />
            <TextField
              value={education.gpa || ''}
              onChange={(e) => updateEducation(index, { gpa: parseFloat(e.target.value) || undefined })}
              placeholder="GPA"
              variant="outlined"
              label="GPA"
              size="small"
              sx={{ width: 80 }}
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
        </Card>
      ))}

      {/* Add Education Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addEducation}
        variant="outlined"
        size="small"
      >
        Add Education
      </Button>
    </Box>
  );
};
