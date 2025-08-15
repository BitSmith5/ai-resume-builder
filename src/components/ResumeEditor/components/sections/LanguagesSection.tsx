import React from 'react';
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
import { ResumeData } from '../../types';
import { COLORS } from '../../../../lib/colorSystem';

interface LanguagesSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // Initialize languages if not exists
  const languages = resumeData.languages || [
    {
      id: `language-${Date.now()}`,
      name: "English",
      proficiency: "Native",
    }
  ];

  const addLanguage = () => {
    const newLanguage = {
      id: `language-${Date.now()}`,
      name: "",
      proficiency: "Native",
    };
    setResumeData(prev => ({
      ...prev,
      languages: [...(prev.languages || languages), newLanguage]
    }));
  };

  const updateLanguage = (languageId: string, updates: Partial<{
    name: string;
    proficiency: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      languages: (prev.languages || languages).map(language =>
        language.id === languageId ? { ...language, ...updates } : language
      )
    }));
  };

  const deleteLanguage = (languageId: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: (prev.languages || languages).filter(language => language.id !== languageId)
    }));
  };

  const handleLanguageDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newLanguages = Array.from((resumeData.languages || languages));
    const [removed] = newLanguages.splice(result.source.index, 1);
    newLanguages.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, languages: newLanguages }));
  };

  const proficiencyLevels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Languages
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Languages');
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

      <DragDropContext onDragEnd={handleLanguageDragEnd}>
        <Droppable droppableId="languages" type="language">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.languages || languages).length === 0 ? 10 : 100 }}>
              {(resumeData.languages || languages).map((language, languageIndex) => (
                <React.Fragment key={language.id}>
                  <Draggable draggableId={language.id} index={languageIndex}>
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
                        {/* Language Header with Drag Handle */}
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
                            value={language.name || ''}
                            onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                            placeholder="Language..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (language.name && language.name.trim()) ? 'transparent' : '#f5f5f5',
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
                            onClick={() => deleteLanguage(language.id)}
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

                        {/* Proficiency Level */}
                        <Box sx={{ pl: 3 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                            Proficiency Level:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {proficiencyLevels.map((level) => (
                              <Box
                                key={level}
                                onClick={() => updateLanguage(language.id, { proficiency: level })}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: language.proficiency === level ? `2px solid ${COLORS.primary}` : '1px solid #e0e0e0',
                                  backgroundColor: language.proficiency === level ? COLORS.selectedBackground : 'white',
                                  fontSize: '0.875rem',
                                  fontWeight: language.proficiency === level ? 600 : 400,
                                  '&:hover': {
                                    backgroundColor: '#f0fdf4',
                                    border: `2px solid ${COLORS.primary}`,
                                  },
                                }}
                              >
                                {level}
                              </Box>
                            ))}
                          </Box>
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

      {/* Add Language button */}
      <Box sx={{ ml: -1.5 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addLanguage}
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
          Language
        </Button>
      </Box>
    </Box>
  );
};
