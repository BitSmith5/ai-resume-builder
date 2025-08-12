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

interface ReferencesSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // Initialize references if not exists
  const references = resumeData.references || [
    {
      id: `reference-${Date.now()}`,
      name: "Dr. Jane Smith",
      title: "Senior Manager",
      company: "Tech Solutions Inc.",
      email: "jane.smith@techsolutions.com",
      phone: "+1 (555) 123-4567",
      relationship: "Former Supervisor",
    }
  ];

  const addReference = () => {
    const newReference = {
      id: `reference-${Date.now()}`,
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      relationship: "",
    };
    setResumeData(prev => ({
      ...prev,
      references: [...(prev.references || references), newReference]
    }));
  };

  const updateReference = (referenceId: string, updates: Partial<{
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      references: (prev.references || references).map(reference =>
        reference.id === referenceId ? { ...reference, ...updates } : reference
      )
    }));
  };

  const deleteReference = (referenceId: string) => {
    setResumeData(prev => ({
      ...prev,
      references: (prev.references || references).filter(reference => reference.id !== referenceId)
    }));
  };

  const handleReferenceDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newReferences = Array.from((resumeData.references || references));
    const [removed] = newReferences.splice(result.source.index, 1);
    newReferences.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, references: newReferences }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          References
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('References');
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

      <DragDropContext onDragEnd={handleReferenceDragEnd}>
        <Droppable droppableId="references" type="reference">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.references || references).length === 0 ? 10 : 100 }}>
              {(resumeData.references || references).map((reference, referenceIndex) => (
                <React.Fragment key={reference.id}>
                  <Draggable draggableId={reference.id} index={referenceIndex}>
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
                        {/* Reference Header with Drag Handle */}
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
                            value={reference.name || ''}
                            onChange={(e) => updateReference(reference.id, { name: e.target.value })}
                            placeholder="Reference Name..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (reference.name && reference.name.trim()) ? 'transparent' : '#f5f5f5',
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
                            onClick={() => deleteReference(reference.id)}
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

                        {/* Title and Company */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={reference.title || ''}
                            onChange={(e) => updateReference(reference.id, { title: e.target.value })}
                            placeholder="Title"
                            sx={{
                              width: 200,
                              height: 28,
                              backgroundColor: (reference.title && reference.title.trim()) ? 'transparent' : '#f5f5f5',
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
                            value={reference.company || ''}
                            onChange={(e) => updateReference(reference.id, { company: e.target.value })}
                            placeholder="Company"
                            sx={{
                              width: 200,
                              height: 28,
                              backgroundColor: (reference.company && reference.company.trim()) ? 'transparent' : '#f5f5f5',
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

                        {/* Email and Phone */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={reference.email || ''}
                            onChange={(e) => updateReference(reference.id, { email: e.target.value })}
                            placeholder="Email"
                            sx={{
                              width: 250,
                              height: 28,
                              backgroundColor: (reference.email && reference.email.trim()) ? 'transparent' : '#f5f5f5',
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
                            value={reference.phone || ''}
                            onChange={(e) => updateReference(reference.id, { phone: e.target.value })}
                            placeholder="Phone"
                            sx={{
                              width: 150,
                              height: 28,
                              backgroundColor: (reference.phone && reference.phone.trim()) ? 'transparent' : '#f5f5f5',
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

                        {/* Relationship */}
                        <Box sx={{ mb: 1, pl: 3 }}>
                          <TextField
                            size="small"
                            value={reference.relationship || ''}
                            onChange={(e) => updateReference(reference.id, { relationship: e.target.value })}
                            placeholder="Relationship (e.g., Former Supervisor, Colleague)"
                            sx={{
                              width: 300,
                              height: 28,
                              backgroundColor: (reference.relationship && reference.relationship.trim()) ? 'transparent' : '#f5f5f5',
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

      {/* Add Reference button */}
      <Box sx={{ ml: -1.5 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addReference}
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
          Reference
        </Button>
      </Box>
    </Box>
  );
};
