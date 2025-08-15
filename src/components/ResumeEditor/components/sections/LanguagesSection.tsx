import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  FormControl,
  Select,
  MenuItem,
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
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('Beginner');

  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    const language = {
      id: Math.random().toString(),
      name: newLanguage.trim(),
      proficiency: newProficiency,
    };

    setResumeData(prev => ({
      ...prev,
      languages: [...(prev.languages || []), language]
    }));

    setNewLanguage('');
    setNewProficiency('Beginner');
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
      <Box sx={{ ml: -3.5 }}>
        {(resumeData.languages || []).map((language) => (
          <Box key={language.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f5f5f5' }}>
            {/* Language Header */}
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
                value={language.name}
                onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                variant="outlined"
                label="Language"
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

            {/* Proficiency Selection */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, pl: 3 }}>
              {proficiencyLevels.map((level) => (
                <Button
                  key={level}
                  variant={language.proficiency === level ? "contained" : "outlined"}
                  size="small"
                  onClick={() => updateLanguage(language.id, { proficiency: level })}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto',
                    border: language.proficiency === level ? `2px solid rgb(173, 126, 233)` : '1px solid #e0e0e0',
                    backgroundColor: language.proficiency === level ? '#fafafa' : 'white',
                    color: language.proficiency === level ? 'rgb(173, 126, 233)' : '#333',
                    '&:hover': {
                      border: `2px solid rgb(173, 126, 233)`,
                      backgroundColor: language.proficiency === level ? '#fafafa' : '#f5f5f5',
                    }
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Add Language Form */}
      <Box sx={{ ml: -1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Add language..."
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          sx={{
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
            if (e.key === 'Enter' && newLanguage.trim()) {
              addLanguage();
            }
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value)}
            sx={{
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
          >
            {proficiencyLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          startIcon={<AddIcon />}
          onClick={addLanguage}
          variant="outlined"
          size="small"
          disabled={!newLanguage.trim()}
          sx={{
            textTransform: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            color: 'black',
            minWidth: 120,
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid #f5f5f5'
            }
          }}
        >
          Add Language
        </Button>
      </Box>
    </Box>
  );
};
