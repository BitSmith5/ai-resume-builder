import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Card,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
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
  const languageRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Focus on new language when it's added
  useEffect(() => {
    if (newLanguageId && languageRefs.current[newLanguageId]) {
      languageRefs.current[newLanguageId]?.focus();
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
      <Box>
        {(resumeData.languages || []).map((language) => (
          <Card key={language.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f5f5f5', mr: 2 }}>
            {/* Language Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                userSelect: 'none',
                color: '#bbb',
              }}>
                <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0' }} />
              </Box>
              <TextField
                inputRef={(el) => {
                  languageRefs.current[language.id] = el;
                }}
                value={language.name}
                onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                variant="outlined"
                label="Language"
                size="small"
                sx={{ width: 200 }}
                placeholder="Enter language name..."
              />
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

            {/* Proficiency Selection */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, ml: 4.5 }}>
              {proficiencyLevels.map((level) => (
                <Button
                  key={level}
                  variant={language.proficiency === level ? "contained" : "outlined"}
                  size="small"
                  onClick={() => updateLanguage(language.id, { proficiency: level })}
                >
                  {level}
                </Button>
              ))}
            </Box>
          </Card>
        ))}
      </Box>

      {/* Add Language Button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addLanguage}
          variant="outlined"
          size="small"
        >
          Add Language
        </Button>
      </Box>
    </Box>
  );
};
