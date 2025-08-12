import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  DragIndicator as DragIndicatorIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove as arrayMoveSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeData } from '../../types';

interface VolunteerExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
  setDatePickerOpen: (open: boolean) => void;
  setDatePickerPosition: (position: { x: number; y: number }) => void;
  datePickerCallbackRef: React.MutableRefObject<((date: string) => void) | null>;
}

export const VolunteerExperienceSection: React.FC<VolunteerExperienceSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
  setDatePickerOpen,
  setDatePickerPosition,
  datePickerCallbackRef,
}) => {
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);

  // Initialize volunteer experience if not exists
  const volunteerExperience = resumeData.volunteerExperience || [
    {
      id: `volunteer-${Date.now()}`,
      organization: "Local Food Bank",
      position: "Volunteer Coordinator",
      location: "Community Center",
      startDate: "Jan 2023",
      endDate: "Dec 2023",
      current: false,
      bulletPoints: [
        {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: "Organized food drives and coordinated volunteer schedules"
        }
      ],
      hoursPerWeek: "5-10",
    }
  ];

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
      volunteerExperience: [...(prev.volunteerExperience || volunteerExperience), newVolunteer]
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
      volunteerExperience: (prev.volunteerExperience || volunteerExperience).map(volunteer =>
        volunteer.id === volunteerId ? { ...volunteer, ...updates } : volunteer
      )
    }));
  };

  const deleteVolunteerExperience = (volunteerId: string) => {
    setResumeData(prev => ({
      ...prev,
      volunteerExperience: (prev.volunteerExperience || volunteerExperience).filter(volunteer => volunteer.id !== volunteerId)
    }));
  };

  const addVolunteerBulletPoint = (volunteerId: string, description: string = "") => {
    const newBulletPoint = {
      id: `bullet-${Date.now()}-${Math.random()}`,
      description: description
    };
    const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
    if (!volunteer) return;

    const newBulletPoints = [...(volunteer.bulletPoints || []), newBulletPoint];
    updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
    setEditingBulletId(newBulletPoint.id);
  };

  const updateVolunteerBulletPoint = (volunteerId: string, bulletId: string, description: string) => {
    const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
    if (!volunteer) return;

    const newBulletPoints = (volunteer.bulletPoints || []).map(bullet =>
      bullet.id === bulletId ? { ...bullet, description } : bullet
    );
    updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
  };

  const deleteVolunteerBulletPoint = (volunteerId: string, bulletId: string) => {
    const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
    if (!volunteer) return;

    const newBulletPoints = (volunteer.bulletPoints || []).filter(bullet => bullet.id !== bulletId);
    updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
  };

  const SortableVolunteerBulletPoint = ({ bullet, volunteerId, onUpdate }: {
    bullet: { id: string; description: string };
    volunteerId: string;
    onUpdate: (volunteerId: string, bulletId: string, description: string) => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bullet.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const isEditing = editingBulletId === bullet.id;
    const isPlaceholder = bullet.description === "Bullet point...";

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '80%',
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{
            mr: 0.25,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            cursor: 'grab'
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb' }} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            flex: 1,
            cursor: isEditing ? 'text' : 'default',
            backgroundColor: isEditing ? '#f5f5f5' : 'transparent',
            borderRadius: isEditing ? 2 : 0,
            '&:hover': {
              backgroundColor: isEditing ? '#f5f5f5' : '#f5f5f5',
              borderRadius: 2,
              '& .delete-button': {
                opacity: 1,
              },
            },
          }}
        >
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={bullet.description}
                  placeholder="Enter bullet point description..."
                  onChange={(e) => onUpdate(volunteerId, bullet.id, e.target.value)}
                  onBlur={() => {
                    if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                      setEditingBulletId(null);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                        setEditingBulletId(null);
                      }
                    }
                  }}
                  variant="standard"
                  sx={{
                    flex: 1,
                    '& .MuiInputBase-root': {
                      alignItems: 'center',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      paddingLeft: '0',
                      paddingTop: '0',
                      paddingBottom: '0',
                    },
                    '& .MuiInput-underline:before': { borderBottom: 'none' },
                    '& .MuiInput-underline:after': { borderBottom: 'none' },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  autoFocus
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
              <Typography
                component="span"
                onClick={() => setEditingBulletId(bullet.id)}
                sx={{
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  color: isPlaceholder ? '#999' : 'black',
                  flex: 1,
                  cursor: 'text',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    '& .delete-button': {
                      opacity: 1,
                    },
                  }
                }}
              >
                {bullet.description}
              </Typography>
              <IconButton
                size="small"
                onClick={() => deleteVolunteerBulletPoint(volunteerId, bullet.id)}
                className="delete-button"
                sx={{
                  p: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  ml: 0.5,
                  '&:hover': { opacity: 1 }
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const handleVolunteerDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newVolunteerExperience = Array.from((resumeData.volunteerExperience || volunteerExperience));
    const [removed] = newVolunteerExperience.splice(result.source.index, 1);
    newVolunteerExperience.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, volunteerExperience: newVolunteerExperience }));
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
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.volunteerExperience || volunteerExperience).length === 0 ? 10 : 100 }}>
              {(resumeData.volunteerExperience || volunteerExperience).map((volunteer, volunteerIndex) => (
                <React.Fragment key={volunteer.id}>
                  <Draggable draggableId={volunteer.id} index={volunteerIndex}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 3,
                          background: 'transparent',
                          p: 2,
                          ml: -5.5,
                        }}
                      >
                        {/* Volunteer Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'grab',
                              userSelect: 'none',
                              color: '#bbb',
                              mr: 0.5,
                            }}
                          >
                            <DragIndicatorIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <TextField
                            value={volunteer.organization || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { organization: e.target.value })}
                            placeholder="Organization..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (volunteer.organization && volunteer.organization.trim()) ? 'transparent' : '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              }
                            }}
                            InputProps={{
                              style: { fontWeight: 600, fontSize: '1rem' },
                              disableUnderline: true,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteVolunteerExperience(volunteer.id)}
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

                        {/* Position and Location */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={volunteer.position || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { position: e.target.value })}
                            placeholder="Position"
                            sx={{
                              width: 200,
                              height: 28,
                              backgroundColor: (volunteer.position && volunteer.position.trim()) ? 'transparent' : '#f5f5f5',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 28,
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                paddingLeft: '8px',
                                fontSize: '0.875rem',
                                height: 28,
                              },
                            }}
                          />
                          <TextField
                            size="small"
                            value={volunteer.location || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { location: e.target.value })}
                            placeholder="Location"
                            sx={{
                              width: 150,
                              height: 28,
                              backgroundColor: (volunteer.location && volunteer.location.trim()) ? 'transparent' : '#f5f5f5',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 28,
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                paddingLeft: '8px',
                                fontSize: '0.875rem',
                                height: 28,
                              },
                            }}
                          />
                        </Box>

                        {/* Volunteer Bullet Points */}
                        <Box sx={{ mb: 1, pl: 3 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                            Key Points:
                          </Typography>
                          <DndContext
                            onDragEnd={(event) => {
                              const { active, over } = event;
                              if (active && over && active.id !== over.id) {
                                const oldIndex = volunteer.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                const newIndex = volunteer.bulletPoints.findIndex(bullet => bullet.id === over.id);

                                                                 const newBulletPoints = arrayMoveSortable(volunteer.bulletPoints, oldIndex, newIndex);
                                updateVolunteerExperience(volunteer.id, { bulletPoints: newBulletPoints });
                              }
                            }}
                          >
                            <SortableContext items={(volunteer.bulletPoints || []).map(bullet => bullet.id)}>
                              <Box sx={{ mb: 1 }}>
                                {(volunteer.bulletPoints || []).map((bullet) => (
                                  <SortableVolunteerBulletPoint
                                    key={bullet.id}
                                    bullet={bullet}
                                    volunteerId={volunteer.id}
                                    onUpdate={updateVolunteerBulletPoint}
                                  />
                                ))}
                              </Box>
                            </SortableContext>
                          </DndContext>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addVolunteerBulletPoint(volunteer.id)}
                            variant="outlined"
                            size="small"
                            sx={{
                              textTransform: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              borderRadius: 2,
                              border: '1px solid #e0e0e0',
                              color: 'black',
                              minWidth: 180,
                              mt: 1,
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #f5f5f5'
                              }
                            }}
                          >
                            Bullet Points
                          </Button>
                        </Box>

                        {/* Hours per Week */}
                        <Box sx={{ mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={volunteer.hoursPerWeek || ''}
                            onChange={(e) => updateVolunteerExperience(volunteer.id, { hoursPerWeek: e.target.value })}
                            placeholder="Hours per week (optional)"
                            sx={{
                              width: 200,
                              height: 28,
                              backgroundColor: (volunteer.hoursPerWeek && volunteer.hoursPerWeek.trim()) ? 'transparent' : '#f5f5f5',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 28,
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                paddingLeft: '8px',
                                fontSize: '0.875rem',
                                height: 28,
                              },
                            }}
                          />
                        </Box>

                        {/* Dates */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={volunteer.startDate || ''}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDatePickerPosition({
                                x: rect.left,
                                y: rect.bottom + 5
                              });
                              datePickerCallbackRef.current = (date: string) => {
                                if (date) {
                                  updateVolunteerExperience(volunteer.id, { startDate: date });
                                }
                              };
                              setDatePickerOpen(true);
                            }}
                            placeholder="Start Date"
                            sx={{
                              width: 90,
                              height: 28,
                              backgroundColor: (volunteer.startDate && volunteer.startDate.trim()) ? 'transparent' : '#f5f5f5',
                              borderRadius: 2,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 28,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                cursor: 'pointer',
                                paddingLeft: '8px',
                                fontSize: '0.875rem',
                                height: 28,
                              },
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                          <TrendingFlatIcon sx={{
                            alignSelf: 'center',
                            color: '#666',
                            fontSize: '1.2rem'
                          }} />
                          <TextField
                            size="small"
                            value={volunteer.endDate || ''}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDatePickerPosition({
                                x: rect.left,
                                y: rect.bottom + 5
                              });
                              datePickerCallbackRef.current = (date: string) => {
                                if (date) {
                                  updateVolunteerExperience(volunteer.id, { endDate: date });
                                }
                              };
                              setDatePickerOpen(true);
                            }}
                            placeholder="End Date"
                            sx={{
                              width: 90,
                              height: 28,
                              backgroundColor: (volunteer.endDate && volunteer.endDate.trim()) ? 'transparent' : '#f5f5f5',
                              borderRadius: 2,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiOutlinedInput-root': {
                                height: 28,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '&:hover fieldset': { border: 'none' },
                                '&.Mui-focused fieldset': { border: 'none' },
                              },
                              '& .MuiInputBase-input': {
                                cursor: 'pointer',
                                paddingLeft: '8px',
                                fontSize: '0.875rem',
                                height: 28,
                              },
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                  <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Volunteer Experience button */}
      <Box sx={{ ml: -1.5 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addVolunteerExperience}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            color: 'black',
            minWidth: 180,
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid #f5f5f5'
            }
          }}
        >
          Volunteer Experience
        </Button>
      </Box>
    </Box>
  );
};
