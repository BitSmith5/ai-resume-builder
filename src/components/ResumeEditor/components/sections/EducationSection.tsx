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
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';

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
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();

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

  const handleEducationDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newEducation = Array.from((resumeData.education || []));
    const [removed] = newEducation.splice(result.source.index, 1);
    newEducation.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, education: newEducation }));
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
      <DragDropContext onDragEnd={handleEducationDragEnd}>
        <Droppable droppableId="education" type="education">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.education || []).length === 0 ? 10 : 100 }}>
              {(resumeData.education || []).map((education, educationIndex) => (
                <React.Fragment key={educationIndex}>
                  <Draggable draggableId={`education-${educationIndex}`} index={educationIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-education-index={educationIndex}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Institution and Degree */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'grab',
                              userSelect: 'none',
                              color: '#bbb',
                            }}
                          >
                            <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0' }} />
                          </Box>
                          <TextField
                            value={education.institution}
                            onChange={(e) => updateEducation(educationIndex, { institution: e.target.value })}
                            placeholder="Institution"
                            variant="outlined"
                            label="Institution"
                            size="small"
                            sx={{ minWidth: 300 }}
                          />
                          <TextField
                            value={education.degree}
                            onChange={(e) => updateEducation(educationIndex, { degree: e.target.value })}
                            placeholder="Degree"
                            variant="outlined"
                            label="Degree"
                            size="small"
                            sx={{ minWidth: 200 }}
                          />
                          <TextField
                            value={education.field}
                            onChange={(e) => updateEducation(educationIndex, { field: e.target.value })}
                            placeholder="Field of Study"
                            variant="outlined"
                            label="Field of Study"
                            size="small"
                            sx={{ minWidth: 200 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteEducation(educationIndex)}
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

                        {/* Dates and GPA */}
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 4.5, gap: 2 }}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              value={education.startDate}
                              placeholder="Start Date"
                              variant="outlined"
                              label="Start Date"
                              size="small"
                              sx={{ width: 150 }}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      openDatePicker(
                                        { x: rect.left, y: rect.bottom + 5 },
                                        (date) => updateEducation(educationIndex, { startDate: date })
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
                              value={education.endDate}
                              placeholder="End Date"
                              variant="outlined"
                              label="End Date"
                              size="small"
                              sx={{ width: 150 }}
                              disabled={education.current}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      if (!education.current) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        openDatePicker(
                                          { x: rect.left, y: rect.bottom + 5 },
                                          (date) => updateEducation(educationIndex, { endDate: date })
                                        );
                                      }
                                    }}
                                    sx={{ p: 0.5 }}
                                    disabled={education.current}
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
                                checked={education.current}
                                onChange={(e) => updateEducation(educationIndex, { current: e.target.checked })}
                              />
                            }
                            label="Current"
                          />
                          <TextField
                            value={education.gpa || ''}
                            onChange={(e) => {
                              const gpa = parseFloat(e.target.value);
                              updateEducation(educationIndex, { gpa: isNaN(gpa) ? undefined : gpa });
                            }}
                            placeholder="GPA (optional)"
                            variant="outlined"
                            label="GPA"
                            size="small"
                            sx={{ width: 100 }}
                            type="number"
                            inputProps={{ step: 0.01, min: 0, max: 4.0 }}
                          />
                        </Box>
                      </Card>
                    )}
                  </Draggable>
                  {provided.placeholder}
                </React.Fragment>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Education Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addEducation}
        variant="outlined"
        size="small"
      >
        Add Education
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
