import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';

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
  const [newLanguageId, setNewLanguageId] = useState<string | null>(null);
  const languageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Focus on new language when it's added
  useEffect(() => {
    if (newLanguageId && languageRefs.current[newLanguageId]) {
      // Find the input element within the div and focus it
      const inputElement = languageRefs.current[newLanguageId]?.querySelector('input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
      setNewLanguageId(null);
    }
  }, [newLanguageId]);

  const addLanguage = () => {
    const newLanguage = {
      id: Math.random().toString(),
      name: "",
      proficiency: "Beginner",
    };

    setResumeData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), newLanguage]
    }));

    // Set the new language ID to trigger focus in useEffect
    setNewLanguageId(newLanguage.id);
  };

  const updateLanguage = (languageId: string, updates: Partial<{ name: string; proficiency: string }>) => {
    setResumeData(prev => ({
      ...prev,
      languages: (prev.languages || []).map((lang: { id: string; name: string; proficiency: string }) =>
        lang.id === languageId ? { ...lang, ...updates } : lang
      )
    }));
  };

  const deleteLanguage = (languageId: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: (prev.languages || []).filter((lang: { id: string; name: string; proficiency: string }) => lang.id !== languageId)
    }));
  };

  const handleLanguageDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newLanguages = Array.from((resumeData.languages || []));
    const [removed] = newLanguages.splice(result.source.index, 1);
    newLanguages.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, languages: newLanguages }));
  };

  const proficiencyLevels = ['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Native'];

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

      {/* Languages List */}
      <DragDropContext onDragEnd={handleLanguageDragEnd}>
        <Droppable droppableId="languages" type="language">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.languages || []).length === 0 ? 10 : 100 }}>
              {(resumeData.languages || []).map((language, languageIndex) => (
                <React.Fragment key={language.id}>
                  <Draggable draggableId={`language-${language.id}`} index={languageIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-language-id={language.id}
                        sx={{ mb: 2, p: 2, mr: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            ref={(el) => { languageRefs.current[language.id] = el; }}
                            value={language.name}
                            onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                            placeholder="Language name"
                            variant="outlined"
                            label="Language"
                            size="small"
                            sx={{ minWidth: 150 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Proficiency</InputLabel>
                            <Select
                              value={language.proficiency}
                              onChange={(e) => updateLanguage(language.id, { proficiency: e.target.value })}
                              label="Proficiency"
                            >
                              {proficiencyLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <IconButton
                            size="small"
                            onClick={() => deleteLanguage(language.id)}
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

      {/* Add Language Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addLanguage}
        variant="outlined"
        size="small"
      >
        Add Language
      </Button>
    </Box>
  );
};
