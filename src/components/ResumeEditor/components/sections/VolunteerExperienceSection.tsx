import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Card,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';

interface VolunteerExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const VolunteerExperienceSection: React.FC<VolunteerExperienceSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();
  const [newBulletId, setNewBulletId] = useState<string | null>(null);
  const bulletRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Focus on new bullet point when it's added
  useEffect(() => {
    if (newBulletId && bulletRefs.current[newBulletId]) {
      // Find the input element within the div and focus it
      const inputElement = bulletRefs.current[newBulletId]?.querySelector('input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
      setNewBulletId(null);
    }
  }, [newBulletId]);

  // Initialize volunteer experience if not exists
  useEffect(() => {
    if (!resumeData.volunteerExperience) {
      setResumeData(prev => ({
        ...prev,
        volunteerExperience: []
      }));
    }
  }, [setResumeData, resumeData.volunteerExperience]);

  const addVolunteerExperience = () => {
    const newVolunteer = {
      id: `volunteer-${Date.now()}`,
      organization: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bulletPoints: [],
      hoursPerWeek: "",
    };
    
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: [...(prev.volunteerExperience || []), newVolunteer]
    }));
  };

  const updateVolunteerExperience = (volunteerId: string, updates: Partial<{
    organization: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{ id: string; description: string }>;
    hoursPerWeek: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || []).map(volunteer =>
        volunteer.id === volunteerId ? { ...volunteer, ...updates } : volunteer
      )
    }));
  };

  const deleteVolunteerExperience = (volunteerId: string) => {
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || []).filter(volunteer => volunteer.id !== volunteerId)
    }));
  };

  const addVolunteerBulletPoint = (volunteerId: string, description: string = "") => {
    const newBulletId = Math.random().toString();
    const newBullet = { id: newBulletId, description: description };
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || []).map(volunteer =>
        volunteer.id === volunteerId ? { ...volunteer, bulletPoints: [...volunteer.bulletPoints, newBullet] } : volunteer
      )
    }));
    
    // Set the new bullet ID to trigger focus in useEffect
    setNewBulletId(newBulletId);
  };

  const updateVolunteerBulletPoint = (volunteerId: string, bulletId: string, description: string) => {
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || []).map(volunteer =>
        volunteer.id === volunteerId ? {
          ...volunteer,
          bulletPoints: volunteer.bulletPoints.map(bullet =>
            bullet.id === bulletId ? { ...bullet, description } : bullet
          )
        } : volunteer
      )
    }));
  };

  const deleteVolunteerBulletPoint = (volunteerId: string, bulletId: string) => {
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || []).map(volunteer =>
        volunteer.id === volunteerId ? {
          ...volunteer,
          bulletPoints: volunteer.bulletPoints.filter(bullet => bullet.id !== bulletId)
        } : volunteer
      )
    }));
  };

  const handleVolunteerDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(resumeData.volunteerExperience || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setResumeData(prev => ({
      ...prev,
      volunteerExperience: items
    }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Volunteer Experience
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Volunteer Experience');
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

      <DragDropContext onDragEnd={handleVolunteerDragEnd}>
        <Droppable droppableId="volunteerExperience" type="volunteer">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps} 
              style={{ minHeight: (resumeData.volunteerExperience || []).length === 0 ? 10 : 100 }}
            >
              {(resumeData.volunteerExperience || []).map((volunteer, volunteerIndex) => (
                <React.Fragment key={`volunteer-fragment-${volunteer.id}`}>
                  <Draggable draggableId={volunteer.id} index={volunteerIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >

                        {/* Organization and Position */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, gap: 2 }}>
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
                            <DragIndicatorIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <TextField
                            value={volunteer.organization || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { organization: e.target.value })}
                            placeholder="Organization"
                            variant="outlined"
                            label="Organization"
                            size="small"
                            sx={{ fontWeight: 600, minWidth: 200 }}
                          />
                          <TextField
                            value={volunteer.position || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { position: e.target.value })}
                            placeholder="Position"
                            variant="outlined"
                            label="Position"
                            size="small"
                            sx={{ minWidth: 400 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteVolunteerExperience(volunteer.id)}
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

                        {/* Location, Dates, and Hours */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 4.5, gap: 2 }}>
                          <TextField
                            value={volunteer.location || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { location: e.target.value })}
                            placeholder="Location"
                            variant="outlined"
                            label="Location"
                            size="small"
                            sx={{ minWidth: 150 }}
                          />
                          <TextField
                            value={volunteer.hoursPerWeek || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { hoursPerWeek: e.target.value })}
                            placeholder="Hours per week"
                            variant="outlined"
                            label="Hours/Week"
                            size="small"
                            sx={{ width: 120 }}
                          />
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              value={volunteer.startDate}
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
                                        (date) => updateVolunteerExperience(volunteer.id, { startDate: date })
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
                              value={volunteer.endDate}
                              placeholder="End Date"
                              variant="outlined"
                              label="End Date"
                              size="small"
                              sx={{ width: 150 }}
                              disabled={volunteer.current}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      if (!volunteer.current) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        openDatePicker(
                                          { x: rect.left, y: rect.bottom + 5 },
                                          (date) => updateVolunteerExperience(volunteer.id, { endDate: date })
                                        );
                                      }
                                    }}
                                    sx={{ p: 0.5 }}
                                    disabled={volunteer.current}
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
                                checked={volunteer.current}
                                onChange={(e) => updateVolunteerExperience(volunteer.id, { current: e.target.checked })}
                              />
                            }
                            label="Current"
                          />
                        </Box>

                        {/* Volunteer Bullet Points */}
                        <Box sx={{ ml: 3 }}>
                          {volunteer.bulletPoints.map((bullet) => (
                            <Box key={bullet.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ mr: 1, color: 'black', fontSize: '0.875rem' }}>•</Typography>
                              <TextField
                                inputRef={(el) => {
                                  bulletRefs.current[bullet.id] = el;
                                }}
                                value={bullet.description}
                                onChange={(e) => updateVolunteerBulletPoint(volunteer.id, bullet.id, e.target.value)}
                                placeholder="Bullet point description..."
                                variant="outlined"
                                size="small"
                                multiline
                                maxRows={3}
                                sx={{ flex: 1 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteVolunteerBulletPoint(volunteer.id, bullet.id)}
                                sx={{ p: 0.5, ml: 1 }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          ))}

                          {/* Add Bullet Point Button */}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addVolunteerBulletPoint(volunteer.id)}
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
                      </Card>
                    )}
                  </Draggable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Volunteer Experience button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addVolunteerExperience}
          variant="outlined"
          size="small"
        >
          Volunteer Experience
        </Button>
      </Box>

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
