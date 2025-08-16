import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Card,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  const [newBulletId, setNewBulletId] = useState<string | null>(null);
  const bulletRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Focus on new bullet point when it's added
  useEffect(() => {
    if (newBulletId && bulletRefs.current[newBulletId]) {
      bulletRefs.current[newBulletId]?.focus();
      setNewBulletId(null);
    }
  }, [newBulletId]);

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
    const newBulletId = Math.random().toString();
    const newBullet = { id: newBulletId, description: description };
    setResumeData(prev => ({
      ...prev,
      awards: (prev.awards || awards).map(award =>
        award.id === awardId ? { ...award, bulletPoints: [...award.bulletPoints, newBullet] } : award
      )
    }));

    // Set the new bullet ID to trigger focus in useEffect
    setNewBulletId(newBulletId);
  };

  const updateAwardBulletPoint = (awardId: string, bulletId: string, description: string) => {
    setResumeData(prev => ({
      ...prev,
      awards: (prev.awards || awards).map(award =>
        award.id === awardId ? {
          ...award,
          bulletPoints: award.bulletPoints.map(bullet =>
            bullet.id === bulletId ? { ...bullet, description } : bullet
          )
        } : award
      )
    }));
  };

  const deleteAwardBulletPoint = (awardId: string, bulletId: string) => {
    setResumeData(prev => ({
      ...prev,
      awards: (prev.awards || awards).map(award =>
        award.id === awardId ? {
          ...award,
          bulletPoints: award.bulletPoints.filter(bullet => bullet.id !== bulletId)
        } : award
      )
    }));
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
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Award Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
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
                            value={award.title || ''}
                            onChange={(e) => updateAward(award.id, { title: e.target.value })}
                            placeholder="Award Title..."
                            variant="outlined"
                            label="Award Title"
                            size="small"
                            sx={{ width: 300 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteAward(award.id)}
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

                        {/* Organization and Year */}
                        <Box sx={{ display: 'flex', gap: 2, my: 2, ml: 4.5 }}>
                          <TextField
                            size="small"
                            value={award.organization || ''}
                            onChange={(e) => updateAward(award.id, { organization: e.target.value })}
                            placeholder="Organization"
                            variant="outlined"
                            label="Organization"
                            sx={{ width: 200 }}
                          />
                          <TextField
                            size="small"
                            value={award.year || ''}
                            onChange={(e) => updateAward(award.id, { year: e.target.value })}
                            placeholder="Year"
                            variant="outlined"
                            label="Year"
                            sx={{ width: 80 }}
                          />
                        </Box>

                        {/* Award Bullet Points */}
                        <Box sx={{ ml: 3 }}>
                          {award.bulletPoints.map((bullet) => (
                            <Box key={bullet.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ mr: 1, color: 'black', fontSize: '0.875rem' }}>•</Typography>
                              <TextField
                                inputRef={(el) => {
                                  bulletRefs.current[bullet.id] = el;
                                }}
                                value={bullet.description}
                                onChange={(e) => updateAwardBulletPoint(award.id, bullet.id, e.target.value)}
                                placeholder="Bullet point description..."
                                variant="outlined"
                                size="small"
                                multiline
                                maxRows={3}
                                sx={{ flex: 1 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteAwardBulletPoint(award.id, bullet.id)}
                                sx={{ p: 0.5, ml: 1 }}
                              >
                                <CloseIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          ))}

                          {/* Add Bullet Point Button */}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addAwardBulletPoint(award.id)}
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
                  <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Award button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addAward}
          variant="outlined"
          size="small"
        >
          Award
        </Button>
      </Box>
    </Box>
  );
};
