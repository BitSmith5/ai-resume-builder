import React from 'react';
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
  // Removed unused referenceIdCounter variable

  // Clean up any existing duplicate IDs on component mount
  React.useEffect(() => {
    const references = resumeData.references || [];
    let hasChanges = false;
    
    // Check for duplicate IDs and fix them
    const seenIds = new Set<string>();
    const cleanedReferences = references.map(reference => {
      // Ensure reference entry has unique ID
      let referenceId = reference.id;
      if (!referenceId || seenIds.has(referenceId)) {
        referenceId = `reference-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        hasChanges = true;
      }
      seenIds.add(referenceId);
      return { ...reference, id: referenceId };
    });
    
    // Update data if changes were made
    if (hasChanges) {
      setResumeData(prev => ({
        ...prev,
        references: cleanedReferences
      }));
    }
  }, [resumeData.references, setResumeData]); // Include dependencies

  // Initialize references if not exists
  const references = resumeData.references || [
    {
      id: `reference-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Dr. Jane Smith",
      title: "Professor",
      company: "University of Technology",
      email: "jane.smith@university.edu",
      phone: "+1 (555) 123-4567",
      relationship: "Academic Advisor",
    }
  ];

  const addReference = () => {
    const newReference = {
      id: `reference-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      references: (prev.references || []).map(reference =>
        reference.id === referenceId ? { ...reference, ...updates } : reference
      )
    }));
  };

  const deleteReference = (referenceId: string) => {
    setResumeData(prev => ({
      ...prev,
      references: (prev.references || []).filter(reference => reference.id !== referenceId)
    }));
  };

  const handleReferenceDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newReferences = Array.from(references);
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
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: references.length === 0 ? 10 : 100 }}>
              {references.map((reference, referenceIndex) => (
                <React.Fragment key={reference.id}>
                  <Draggable draggableId={reference.id} index={referenceIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 3,
                          p: 2,
                          mr: 2,
                        }}
                      >
                        {/* Reference Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
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
                            value={reference.name || ''}
                            onChange={(e) => updateReference(reference.id, { name: e.target.value })}
                            placeholder="Reference Name..."
                            variant="outlined"
                            label="Reference Name"
                            size="small"
                            sx={{ minWidth: 300 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteReference(reference.id)}
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4.5 }}>
                          {/* Title and Company */}
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              value={reference.title || ''}
                              onChange={(e) => updateReference(reference.id, { title: e.target.value })}
                              placeholder="Title"
                              variant="outlined"
                              label="Title"
                              size="small"
                              sx={{ minWidth: 200 }}
                            />
                            <TextField
                              value={reference.company || ''}
                              onChange={(e) => updateReference(reference.id, { company: e.target.value })}
                              placeholder="Company"
                              variant="outlined"
                              label="Company"
                              size="small"
                              sx={{ minWidth: 200 }}
                            />
                          </Box>
                          {/* Email and Phone */}
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              value={reference.email || ''}
                              onChange={(e) => updateReference(reference.id, { email: e.target.value })}
                              placeholder="Email"
                              variant="outlined"
                              label="Email"
                              size="small"
                              sx={{ minWidth: 200 }}
                            />
                            <TextField
                              value={reference.phone || ''}
                              onChange={(e) => updateReference(reference.id, { phone: e.target.value })}
                              placeholder="Phone"
                              variant="outlined"
                              label="Phone"
                              size="small"
                              sx={{ minWidth: 200 }}
                            />
                          </Box>
                          {/* Relationship */}
                          <Box>
                            <TextField
                              value={reference.relationship || ''}
                              onChange={(e) => updateReference(reference.id, { relationship: e.target.value })}
                              placeholder="Relationship (e.g., Former Supervisor, Colleague)"
                              variant="outlined"
                              label="Relationship"
                              size="small"
                              sx={{ minWidth: 200 }}
                            />
                          </Box>
                        </Box>
                      </Card>
                    )}
                  </Draggable>
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Reference button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addReference}
          variant="outlined"
          size="small"
        >
          Reference
        </Button>
      </Box>


    </Box>
  );
};
