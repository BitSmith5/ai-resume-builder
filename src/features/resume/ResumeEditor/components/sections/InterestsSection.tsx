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
  Card,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
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

  // Clean up any existing duplicate IDs on component mount
  React.useEffect(() => {
    const interests = resumeData.interests || [];
    let hasChanges = false;
    
    // Check for duplicate IDs and fix them
    const seenIds = new Set<string>();
    const cleanedInterests = interests.map(interest => {
      // Ensure interest entry has unique ID
      let interestId = interest.id;
      if (!interestId || seenIds.has(interestId)) {
        interestId = `interest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        hasChanges = true;
      }
      seenIds.add(interestId);
      return { ...interest, id: interestId };
    });
    
    // Update data if changes were made
    if (hasChanges) {
      setResumeData(prev => ({
        ...prev,
        interests: cleanedInterests
      }));
    }
  }, [resumeData.interests, setResumeData]); // Include dependencies

  // Initialize interests if not exists
  const interests = resumeData.interests || [
    {
      id: "default-interest",
      name: "Programming",
      icon: "💻",
    }
  ];

  const addInterest = () => {
    const newInterest = {
      id: `interest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      icon: "🎵",
    };
    setResumeData(prev => ({
      ...prev,
      interests: [...(prev.interests || interests), newInterest]
    }));
  };

  const updateInterest = (interestId: string, updates: Partial<{
    name: string;
    icon: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      interests: (prev.interests || interests).map((interest) =>
        interest.id === interestId ? { ...interest, ...updates } : interest
      )
    }));
  };

  const deleteInterest = (interestId: string) => {
    setResumeData(prev => ({
      ...prev,
      interests: (prev.interests || interests).filter((interest) => interest.id !== interestId)
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
                <React.Fragment key={interest.id}>
                  <Draggable draggableId={interest.id} index={interestIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Interest Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: 'fit-content', gap: 2 }}>
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
                            value={interest.name || ''}
                            onChange={(e) => updateInterest(interest.id, { name: e.target.value })}
                            placeholder="Interest Name..."
                            variant="outlined"
                            label="Interest Name"
                            size="small"
                            sx={{ width: 200 }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl size="small" sx={{ width: 150 }}>
                              <InputLabel>Icon</InputLabel>
                              <Select
                                value={interest.icon || '🎵'}
                                onChange={(e) => updateInterest(interest.id, { icon: e.target.value })}
                                label="Icon"
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
                          <IconButton
                            size="small"
                            onClick={() => deleteInterest(interest.id)}
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
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addInterest}
          variant="outlined"
          size="small"
        >
          Add Interest
        </Button>
      </Box>
    </Box>
  );
};
