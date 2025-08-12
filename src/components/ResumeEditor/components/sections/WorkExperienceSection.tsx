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

interface WorkExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const addWorkExperience = () => {
    const newWork = {
      id: `work-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bulletPoints: []
    };
    setResumeData(prev => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), newWork]
    }));
  };

  const updateWorkExperience = (workId: string, updates: Partial<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{ id: string; description: string }>;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? { ...work, ...updates } : work
      )
    }));
  };

  const deleteWorkExperience = (workId: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter(work => work.id !== workId)
    }));
  };

  const addBulletPoint = (workId: string, description: string = "") => {
    const newBulletId = Math.random().toString();
    const newBullet = { id: newBulletId, description: description };
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? { ...work, bulletPoints: [...work.bulletPoints, newBullet] } : work
      )
    }));
  };

  const updateBulletPoint = (workId: string, bulletId: string, description: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? {
          ...work,
          bulletPoints: work.bulletPoints.map(bullet =>
            bullet.id === bulletId ? { ...bullet, description } : bullet
          )
        } : work
      )
    }));
  };

  const deleteBulletPoint = (workId: string, bulletId: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? {
          ...work,
          bulletPoints: work.bulletPoints.filter(bullet => bullet.id !== bulletId)
        } : work
      )
    }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Professional Experience
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Work Experience');
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
      
      {/* Work Experience Entries */}
      {(resumeData.workExperience || []).map((work) => (
        <Box key={work.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          {/* Company and Position */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb', mr: 1 }} />
            <TextField
              value={work.company}
              onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
              placeholder="Company"
              variant="standard"
              sx={{ fontWeight: 600, mr: 2, minWidth: 200 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              value={work.position}
              onChange={(e) => updateWorkExperience(work.id, { position: e.target.value })}
              placeholder="Position"
              variant="standard"
              sx={{ flex: 1, mr: 2 }}
              InputProps={{ disableUnderline: true }}
            />
            <IconButton
              size="small"
              onClick={() => deleteWorkExperience(work.id)}
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

          {/* Location and Dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, ml: 3 }}>
            <TextField
              value={work.location}
              onChange={(e) => updateWorkExperience(work.id, { location: e.target.value })}
              placeholder="Location"
              variant="standard"
              sx={{ mr: 2, minWidth: 150 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              value={work.startDate}
              onChange={(e) => updateWorkExperience(work.id, { startDate: e.target.value })}
              placeholder="Start Date"
              variant="standard"
              sx={{ mr: 2, minWidth: 100 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              value={work.endDate}
              onChange={(e) => updateWorkExperience(work.id, { endDate: e.target.value })}
              placeholder="End Date"
              variant="standard"
              sx={{ mr: 2, minWidth: 100 }}
              InputProps={{ disableUnderline: true }}
              disabled={work.current}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={work.current}
                  onChange={(e) => updateWorkExperience(work.id, { current: e.target.checked })}
                />
              }
              label="Current"
            />
          </Box>

          {/* Bullet Points */}
          <Box sx={{ ml: 3 }}>
            {work.bulletPoints.map((bullet) => (
              <Box key={bullet.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ mr: 1, color: 'black', fontSize: '0.875rem' }}>•</Typography>
                <TextField
                  value={bullet.description}
                  onChange={(e) => updateBulletPoint(work.id, bullet.id, e.target.value)}
                  placeholder="Bullet point description..."
                  variant="standard"
                  sx={{ flex: 1 }}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton
                  size="small"
                  onClick={() => deleteBulletPoint(work.id, bullet.id)}
                  sx={{ p: 0.5, ml: 1 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
            
            {/* Add Bullet Point Button */}
            <Button
              startIcon={<AddIcon />}
              onClick={() => addBulletPoint(work.id)}
              variant="text"
              size="small"
              sx={{ textTransform: 'none', mt: 1 }}
            >
              Add Bullet Point
            </Button>
          </Box>
        </Box>
      ))}

      {/* Add Work Experience Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addWorkExperience}
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
        Add Work Experience
      </Button>
    </Box>
  );
};
