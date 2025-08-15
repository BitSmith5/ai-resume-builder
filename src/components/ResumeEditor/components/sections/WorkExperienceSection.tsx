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
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';


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
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();

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
        <Box key={work.id} sx={{ mb: 3, p: 2, mr: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f5f5f5' }}>
          {/* Company and Position */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
            <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0', mr: 1 }} />
                          <TextField
                value={work.company}
                onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                placeholder="Company"
                variant="outlined"
                label="Company"
                size="small"
                sx={{ fontWeight: 600, mx: 1, minWidth: 200, backgroundColor: 'white' }}
              />
                          <TextField
                value={work.position}
                onChange={(e) => updateWorkExperience(work.id, { position: e.target.value })}
                placeholder="Position"
                variant="outlined"
                label="Position"
                size="small"
                sx={{ minWidth: 400, mx: 1, backgroundColor: 'white' }}
              />
            <IconButton
              size="small"
              onClick={() => deleteWorkExperience(work.id)}
              sx={{ 
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                backgroundColor: 'white',
                ml: 1,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  border: '1px solid #a0a0a0',
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Location and Dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 4.5, gap: 2 }}>
            <TextField
              value={work.location}
              onChange={(e) => updateWorkExperience(work.id, { location: e.target.value })}
              placeholder="Location"
              variant="outlined"
              label="Location"
              size="small"
              sx={{ minWidth: 150, backgroundColor: 'white' }}
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                value={work.startDate}
                placeholder="Start Date"
                variant="outlined"
                label="Start Date"
                size="small"
                sx={{ minWidth: 100, backgroundColor: 'white' }}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        openDatePicker(
                          { x: rect.left, y: rect.bottom + 5 },
                          (date) => updateWorkExperience(work.id, { startDate: date })
                        );
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <CalendarIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                value={work.endDate}
                placeholder="End Date"
                variant="outlined"
                label="End Date"
                size="small"
                sx={{ minWidth: 100, backgroundColor: 'white' }}
                disabled={work.current}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        if (!work.current) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          openDatePicker(
                            { x: rect.left, y: rect.bottom + 5 },
                            (date) => updateWorkExperience(work.id, { endDate: date })
                          );
                        }
                      }}
                      sx={{ p: 0.5 }}
                      disabled={work.current}
                    >
                      <CalendarIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
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
                    variant="outlined"
                    size="small"
                    multiline
                    maxRows={3}
                    sx={{ flex: 1, backgroundColor: 'white' }}
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
              sx={{ 
                textTransform: 'none', 
                mt: 1,
                px: 1,
                color: 'rgb(143, 96, 203)',
                '&:hover': {
                  backgroundColor: 'transparent',
                }
              }}
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

      {/* DatePicker Component */}
      <DatePicker
        isOpen={datePickerOpen}
        onClose={closeDatePicker}
        onSelect={handleDateSelect}
        position={datePickerPosition}
      />
    </Box>
  );
};
