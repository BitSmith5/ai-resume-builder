import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ResumeData } from '../../types';

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
  };

  const deleteSkillFromCategory = (categoryId: string, skillId: string) => {
    setResumeData(prev => ({
      ...prev,
      skillCategories: (prev.skillCategories || []).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
        cat.id === categoryId ? { ...cat, skills: cat.skills.filter(skill => skill.id !== skillId) } : cat
      )
    }));
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
      <Box sx={{ ml: -3.5 }}>
        {(resumeData.skillCategories || []).map((category) => (
          <Box key={category.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            {/* Category Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                userSelect: 'none',
                color: '#bbb',
              }}>
                <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0', mr: 1 }} />
              </Box>
              <TextField
                value={category.title}
                onChange={(e) => updateSkillCategory(category.id, { title: e.target.value })}
                variant="outlined"
                label="Category"
                size="small"
                sx={{
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  }
                }}
                InputProps={{
                  style: { fontWeight: 600, fontSize: '1rem' },
                }}
              />
              <IconButton
                size="small"
                onClick={() => deleteSkillCategory(category.id)}
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

            {/* Skills in this category */}
            <Box sx={{ display: "flex", minHeight: 40, flexWrap: "wrap", pl: 3 }}>
              {category.skills.map((skill) => (
                <Box
                  key={skill.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    px: 0.5,
                    py: 1,
                    margin: 0.5,
                    flexShrink: 0,
                    cursor: 'grab',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}>
                    <DragIndicatorIcon sx={{ fontSize: 20, mr: 0.5, color: '#999' }} />
                  </Box>

                  <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
                    {skill.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                      sx={{ p: 0.5, backgroundColor: 'white', borderRadius: "50%", mr: 0.5 }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Add skill input for this category */}
            <Box sx={{ display: "flex", alignItems: "center", width: 300, pl: 3, mx: 0.5, mt: 0.5 }}>
              <TextField
                size="small"
                placeholder="Add skill..."
                sx={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
                onKeyPress={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === 'Enter' && target.value.trim()) {
                    addSkillToCategory(category.id, target.value);
                    target.value = '';
                  }
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addSkillToCategory(category.id, input.value);
                    input.value = '';
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* + Skills button */}
      <Box sx={{ ml: -1.5 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addSkillCategory}
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
          Skill Category
        </Button>
      </Box>
    </Box>
  );
};
