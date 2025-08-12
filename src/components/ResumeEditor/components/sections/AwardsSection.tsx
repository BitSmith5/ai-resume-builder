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
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove as arrayMoveSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeData } from '../../types';

interface AwardsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);

  // Initialize awards if not exists
  const awards = resumeData.awards || [
    {
      id: `award-${Date.now()}`,
      title: "Best Student Award",
      organization: "University of Technology",
      year: "2024",
      bulletPoints: [
        {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: "Recognized for outstanding academic performance and leadership"
        }
      ],
    }
  ];

  const addAward = () => {
    const newAward = {
      id: `award-${Date.now()}`,
      title: "",
      organization: "",
      year: "",
      bulletPoints: [],
    };
    setResumeData(prev => ({
      ...prev,
      awards: [...(prev.awards || awards), newAward]
    }));
  };

  const updateAward = (awardId: string, updates: Partial<{
    title: string;
    organization: string;
    year: string;
    bulletPoints: Array<{ id: string; description: string }>;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      awards: (prev.awards || awards).map(award =>
        award.id === awardId ? { ...award, ...updates } : award
      )
    }));
  };

  const deleteAward = (awardId: string) => {
    setResumeData(prev => ({
      ...prev,
      awards: (prev.awards || awards).filter(award => award.id !== awardId)
    }));
  };

  const addAwardBulletPoint = (awardId: string, description: string = "") => {
    const newBulletPoint = {
      id: `bullet-${Date.now()}-${Math.random()}`,
      description: description
    };
    const award = (resumeData.awards || awards).find(a => a.id === awardId);
    if (!award) return;

    const newBulletPoints = [...(award.bulletPoints || []), newBulletPoint];
    updateAward(awardId, { bulletPoints: newBulletPoints });
    setEditingBulletId(newBulletPoint.id);
  };

  const updateAwardBulletPoint = (awardId: string, bulletId: string, description: string) => {
    const award = (resumeData.awards || awards).find(a => a.id === awardId);
    if (!award) return;

    const newBulletPoints = (award.bulletPoints || []).map(bullet =>
      bullet.id === bulletId ? { ...bullet, description } : bullet
    );
    updateAward(awardId, { bulletPoints: newBulletPoints });
  };

  const deleteAwardBulletPoint = (awardId: string, bulletId: string) => {
    const award = (resumeData.awards || awards).find(a => a.id === awardId);
    if (!award) return;

    const newBulletPoints = (award.bulletPoints || []).filter(bullet => bullet.id !== bulletId);
    updateAward(awardId, { bulletPoints: newBulletPoints });
  };

  const SortableAwardBulletPoint = ({ bullet, awardId, onUpdate }: {
    bullet: { id: string; description: string };
    awardId: string;
    onUpdate: (awardId: string, bulletId: string, description: string) => void;
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
                  onChange={(e) => onUpdate(awardId, bullet.id, e.target.value)}
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
                onClick={() => deleteAwardBulletPoint(awardId, bullet.id)}
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

  const handleAwardDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newAwards = Array.from((resumeData.awards || awards));
    const [removed] = newAwards.splice(result.source.index, 1);
    newAwards.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, awards: newAwards }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Awards & Recognition
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Awards');
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

      <DragDropContext onDragEnd={handleAwardDragEnd}>
        <Droppable droppableId="awards" type="award">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.awards || awards).length === 0 ? 10 : 100 }}>
              {(resumeData.awards || awards).map((award, awardIndex) => (
                <React.Fragment key={award.id}>
                  <Draggable draggableId={award.id} index={awardIndex}>
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
                        {/* Award Header with Drag Handle */}
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
                            value={award.title || ''}
                            onChange={(e) => updateAward(award.id, { title: e.target.value })}
                            placeholder="Award Title..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (award.title && award.title.trim()) ? 'transparent' : '#f5f5f5',
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
                            onClick={() => deleteAward(award.id)}
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

                        {/* Organization and Year */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={award.organization || ''}
                            onChange={(e) => updateAward(award.id, { organization: e.target.value })}
                            placeholder="Organization"
                            sx={{
                              width: 200,
                              height: 28,
                              backgroundColor: (award.organization && award.organization.trim()) ? 'transparent' : '#f5f5f5',
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
                            value={award.year || ''}
                            onChange={(e) => updateAward(award.id, { year: e.target.value })}
                            placeholder="Year"
                            sx={{
                              width: 80,
                              height: 28,
                              backgroundColor: (award.year && award.year.trim()) ? 'transparent' : '#f5f5f5',
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

                        {/* Award Bullet Points */}
                        <Box sx={{ mb: 1, pl: 3 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                            Key Points:
                          </Typography>
                          <DndContext
                            onDragEnd={(event) => {
                              const { active, over } = event;
                              if (active && over && active.id !== over.id) {
                                const oldIndex = award.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                const newIndex = award.bulletPoints.findIndex(bullet => bullet.id === over.id);

                                                                       const newBulletPoints = arrayMoveSortable(award.bulletPoints, oldIndex, newIndex);
                                updateAward(award.id, { bulletPoints: newBulletPoints });
                              }
                            }}
                          >
                            <SortableContext items={(award.bulletPoints || []).map(bullet => bullet.id)}>
                              <Box sx={{ mb: 1 }}>
                                {(award.bulletPoints || []).map((bullet) => (
                                  <SortableAwardBulletPoint
                                    key={bullet.id}
                                    bullet={bullet}
                                    awardId={award.id}
                                    onUpdate={updateAwardBulletPoint}
                                  />
                                ))}
                              </Box>
                            </SortableContext>
                          </DndContext>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addAwardBulletPoint(award.id)}
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

      {/* Add Award button */}
      <Box sx={{ ml: -1.5 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addAward}
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
          Award
        </Button>
      </Box>
    </Box>
  );
};
