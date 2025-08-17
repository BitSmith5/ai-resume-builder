import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Card,
  Chip,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';
import { themeColors } from '@/lib/theme';

interface TechnicalSkillsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const TechnicalSkillsSection: React.FC<TechnicalSkillsSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // State for skill input fields
  const [skillInputs, setSkillInputs] = React.useState<{ [key: string]: string }>({});

  const addSkillCategory = () => {
    const newCategory = {
      id: `category-${Date.now()}`,
      title: 'New Category',
      skills: []
    };

    setResumeData(prev => ({
      ...prev,
      skillCategories: [...(prev.skillCategories || []), newCategory]
    }));
  };

  const updateSkillCategory = (categoryId: string, updates: Partial<{ title: string; skills: Array<{ id: string; name: string }> }>) => {
    setResumeData(prev => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    }));
  };

  const deleteSkillCategory = (categoryId: string) => {
    setResumeData(prev => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).filter((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) => cat.id !== categoryId)
    }));
  };

  const addSkillToCategory = (categoryId: string, skillName: string) => {
    if (!skillName.trim()) return;
    const newSkill = { id: Math.random().toString(), name: skillName.trim() };

    setResumeData(prev => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
        cat.id === categoryId ? { ...cat, skills: [...cat.skills, newSkill] } : cat
      )
    }));
    
    // Clear the input field
    setSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

  const handleSkillInputChange = (categoryId: string, value: string) => {
    setSkillInputs(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSkillInputKeyPress = (categoryId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = skillInputs[categoryId] || '';
      if (value.trim()) {
        addSkillToCategory(categoryId, value.trim());
      }
    }
  };

  const deleteSkillFromCategory = (categoryId: string, skillId: string) => {
    setResumeData(prev => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
        cat.id === categoryId ? { ...cat, skills: cat.skills.filter(skill => skill.id !== skillId) } : cat
      )
    }));
  };

  const handleSkillDragEnd = (result: DropResult, categoryId: string) => {
    if (!result.destination) return;

    const category = (resumeData.skillCategories || []).find(cat => cat.id === categoryId);
    if (!category) return;

    const newSkills = Array.from(category.skills);
    const [removed] = newSkills.splice(result.source.index, 1);
    newSkills.splice(result.destination.index, 0, removed);

    updateSkillCategory(categoryId, { skills: newSkills });
  };

  const handleCategoryDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCategories = Array.from((resumeData.skillCategories || []));
    const [removed] = newCategories.splice(result.source.index, 1);
    newCategories.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, skillCategories: newCategories }));
  };

  const handleAllDragEnd = (result: DropResult) => {
    // Check if this is a skill drag
    if (result.source.droppableId.startsWith('skills-')) {
      const categoryId = result.source.droppableId.replace('skills-', '');
      handleSkillDragEnd(result, categoryId);
    } else if (result.source.droppableId === 'categories') {
      // This is a category drag
      handleCategoryDragEnd(result);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Technical Skills
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Technical Skills');
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

      {/* Skill Categories */}
      <DragDropContext onDragEnd={handleAllDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.skillCategories || []).length === 0 ? 10 : 100 }}>
              {(resumeData.skillCategories || []).map((category, categoryIndex) => (
                <React.Fragment key={category.id}>
                  <Draggable draggableId={`category-${category.id}`} index={categoryIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-category-id={category.id}
                        sx={{ mb: 3, mr: 2, p: 2 }}
                      >
                        {/* Category Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0', mr: 1 }} />
                          </Box>
                          <TextField
                            value={category.title}
                            onChange={(e) => updateSkillCategory(category.id, { title: e.target.value })}
                            variant="outlined"
                            label="Category"
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteSkillCategory(category.id)}
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

                        {/* Skills in this category */}
                        <Droppable droppableId={`skills-${category.id}`} direction="horizontal" type="skill">
                          {(provided) => (
                            <Box 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              sx={{ 
                                display: "flex", 
                                minHeight: 40, 
                                flexWrap: "wrap", 
                                pl: 3, 
                                gap: 1, 
                                my: 1.5 
                              }}
                            >
                              {category.skills.map((skill, skillIndex) => (
                                <Draggable 
                                  key={`${category.id}-skill-${skillIndex}`} 
                                  draggableId={`${category.id}-skill-${skillIndex}`} 
                                  index={skillIndex}
                                >
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <Chip
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          py: 1,
                                          cursor: 'grab',
                                          '&:active': {
                                            cursor: 'grabbing',
                                          },
                                          '&:focus': {
                                            outline: 'none',
                                          },
                                        }}
                                        label={
                                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', ml: -0.5 }}>
                                              <DragIndicatorIcon sx={{ fontSize: 20, mr: 0.5, color: '#999' }} />
                                            </Box>
                                            <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
                                              {skill.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: -1 }}>
                                              <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  deleteSkillFromCategory(category.id, skill.id);
                                                }}
                                                onMouseDown={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                }}
                                                sx={{ p: 0.5, borderRadius: "50%", '&:hover': { backgroundColor: themeColors.gray[500], color: themeColors.white } }}
                                              >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                              </IconButton>
                                            </Box>
                                          </Box>
                                        }
                                      />
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>

                        {/* Add skill input for this category */}
                        <Box sx={{ display: "flex", alignItems: "center", width: 300, pl: 3, mx: 0.5, mt: 0.5 }}>
                          <TextField
                            size="small"
                            placeholder="Add skill..."
                            value={skillInputs[category.id] || ''}
                            onChange={(e) => handleSkillInputChange(category.id, e.target.value)}
                            onKeyPress={(e) => handleSkillInputKeyPress(category.id, e)}
                          />
                          <Button
                            size="small"
                            onClick={() => {
                              const value = skillInputs[category.id] || '';
                              if (value.trim()) {
                                addSkillToCategory(category.id, value.trim());
                              }
                            }}
                            sx={{ height: 32, minWidth: 'auto' }}
                          >
                            <AddCircleOutlineIcon fontSize="small" />
                          </Button>
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

      {/* + Skills button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addSkillCategory}
          variant="outlined"
          size="small"
        >
          Skill Category
        </Button>
      </Box>
    </Box>
  );
};
