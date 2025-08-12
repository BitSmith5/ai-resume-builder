import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';

interface InterestsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // Available icons for interests
  const AVAILABLE_ICONS = [
    { value: '🎵', label: 'Music' },
    { value: '📚', label: 'Reading' },
    { value: '🏃‍♂️', label: 'Running' },
    { value: '🏋️‍♂️', label: 'Gym' },
    { value: '🎨', label: 'Art' },
    { value: '📷', label: 'Photography' },
    { value: '🎮', label: 'Gaming' },
    { value: '🍳', label: 'Cooking' },
    { value: '✈️', label: 'Travel' },
    { value: '🎬', label: 'Movies' },
    { value: '🎭', label: 'Theater' },
    { value: '🏊‍♂️', label: 'Swimming' },
    { value: '🚴‍♂️', label: 'Cycling' },
    { value: '🎯', label: 'Target Shooting' },
    { value: '🧘‍♀️', label: 'Yoga' },
    { value: '🎲', label: 'Board Games' },
    { value: '🎸', label: 'Guitar' },
    { value: '🎹', label: 'Piano' },
    { value: '🎤', label: 'Singing' },
    { value: '💻', label: 'Programming' },
    { value: '🔬', label: 'Science' },
    { value: '🌱', label: 'Gardening' },
    { value: '🐕', label: 'Dogs' },
    { value: '🐱', label: 'Cats' },
    { value: '⚽', label: 'Soccer' },
    { value: '🏀', label: 'Basketball' },
    { value: '🏈', label: 'Football' },
    { value: '⚾', label: 'Baseball' },
    { value: '🎳', label: 'Bowling' },
    { value: '♟️', label: 'Chess' },
    { value: '✏️', label: 'Drawing' },
    { value: '📝', label: 'Writing' },
    { value: '📊', label: 'Data Analysis' },
    { value: '🔍', label: 'Research' },
    { value: '🌍', label: 'Languages' },
    { value: '📈', label: 'Investing' },
    { value: '🏛️', label: 'History' },
    { value: '🌌', label: 'Astronomy' },
    { value: '🧬', label: 'Biology' },
    { value: '⚗️', label: 'Chemistry' },
    { value: '⚡', label: 'Physics' },
    { value: '🧮', label: 'Mathematics' }
  ];

  // Initialize interests if not exists
  const interests = resumeData.interests || [
    {
      name: "Programming",
      icon: "💻",
    }
  ];

  const addInterest = () => {
    const newInterest = {
      name: "",
      icon: "🎵",
    };
    setResumeData(prev => ({
      ...prev,
      interests: [...(prev.interests || interests), newInterest]
    }));
  };

  const updateInterest = (index: number, updates: Partial<{
    name: string;
    icon: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      interests: (prev.interests || interests).map((interest, i) =>
        i === index ? { ...interest, ...updates } : interest
      )
    }));
  };

  const deleteInterest = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      interests: (prev.interests || interests).filter((_, i) => i !== index)
    }));
  };

  const handleInterestDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newInterests = Array.from((resumeData.interests || interests));
    const [removed] = newInterests.splice(result.source.index, 1);
    newInterests.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, interests: newInterests }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Interests & Hobbies
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Interests');
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
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <DragDropContext onDragEnd={handleInterestDragEnd}>
        <Droppable droppableId="interests" type="interest">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.interests || interests).length === 0 ? 10 : 100 }}>
              {(resumeData.interests || interests).map((interest, interestIndex) => (
                <React.Fragment key={interestIndex}>
                  <Draggable draggableId={`interest-${interestIndex}`} index={interestIndex}>
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
                        {/* Interest Header with Drag Handle */}
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
                            value={interest.name || ''}
                            onChange={(e) => updateInterest(interestIndex, { name: e.target.value })}
                            placeholder="Interest Name..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (interest.name && interest.name.trim()) ? 'transparent' : '#f5f5f5',
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
                            onClick={() => deleteInterest(interestIndex)}
                            sx={{
                              color: '#999',
                              '&:hover': { color: '#d32f2f' },
                              ml: 'auto'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Interest Icon Selection */}
                        <Box sx={{ ml: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Icon</InputLabel>
                            <Select
                              value={interest.icon || '🎵'}
                              onChange={(e) => updateInterest(interestIndex, { icon: e.target.value })}
                              label="Icon"
                              sx={{
                                height: 40,
                                '& .MuiSelect-select': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }
                              }}
                            >
                              {AVAILABLE_ICONS.map((iconOption) => (
                                <MenuItem key={iconOption.value} value={iconOption.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{iconOption.value}</span>
                                    <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                      {iconOption.label}
                                    </span>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                  {provided.placeholder}
                </React.Fragment>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Box sx={{ ml: 6, mt: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addInterest}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#ddd',
            color: '#666',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Add Interest
        </Button>
      </Box>
    </Box>
  );
};
