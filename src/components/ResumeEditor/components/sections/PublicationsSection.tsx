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

interface PublicationsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // Initialize publications if not exists
  const publications = resumeData.publications || [
    {
      id: `publication-${Date.now()}`,
      title: "Machine Learning in Modern Web Applications",
      authors: "John Doe, Jane Smith",
      journal: "Journal of Computer Science",
      year: "2024",
      doi: "10.1000/example.doi",
      link: "https://example.com/paper",
    }
  ];

  const addPublication = () => {
    const newPublication = {
      id: `publication-${Date.now()}`,
      title: "",
      authors: "",
      journal: "",
      year: "",
      doi: "",
      link: "",
    };
    setResumeData(prev => ({
      ...prev,
      publications: [...(prev.publications || publications), newPublication]
    }));
  };

  const updatePublication = (publicationId: string, updates: Partial<{
    title: string;
    authors: string;
    journal: string;
    year: string;
    doi: string;
    link: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      publications: (prev.publications || publications).map(publication =>
        publication.id === publicationId ? { ...publication, ...updates } : publication
      )
    }));
  };

  const deletePublication = (publicationId: string) => {
    setResumeData(prev => ({
      ...prev,
      publications: (prev.publications || publications).filter(publication => publication.id !== publicationId)
    }));
  };

  const handlePublicationDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newPublications = Array.from((resumeData.publications || publications));
    const [removed] = newPublications.splice(result.source.index, 1);
    newPublications.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, publications: newPublications }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Publications
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Publications');
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

      <DragDropContext onDragEnd={handlePublicationDragEnd}>
        <Droppable droppableId="publications" type="publication">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.publications || publications).length === 0 ? 10 : 100 }}>
              {(resumeData.publications || publications).map((publication, publicationIndex) => (
                <React.Fragment key={publication.id}>
                  <Draggable draggableId={publication.id} index={publicationIndex}>
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
                        {/* Publication Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: 300, mb: 2, gap: 2 }}>
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
                            value={publication.title || ''}
                            onChange={(e) => updatePublication(publication.id, { title: e.target.value })}
                            placeholder="Publication Title..."
                            variant="outlined"
                            size="small"
                            label="Publication Title"
                            sx={{ width: 300 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deletePublication(publication.id)}
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

                        {/* Authors */}
                        <Box sx={{ mb: 2, ml: 4.5 }}>
                          <TextField
                            size="small"
                            value={publication.authors || ''}
                            onChange={(e) => updatePublication(publication.id, { authors: e.target.value })}
                            placeholder="Authors..."
                            variant="outlined"
                            label="Authors"
                            sx={{ width: 300 }}
                          />
                        </Box>

                        {/* Journal and Year */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, ml: 4.5 }}>
                          <TextField
                            size="small"
                            value={publication.journal || ''}
                            onChange={(e) => updatePublication(publication.id, { journal: e.target.value })}
                            placeholder="Journal/Conference"
                            variant="outlined"
                            label="Journal/Conference"
                            sx={{ width: 300 }}
                          />
                          <TextField
                            size="small"
                            value={publication.year || ''}
                            onChange={(e) => updatePublication(publication.id, { year: e.target.value })}
                            placeholder="Year"
                            variant="outlined"
                            label="Year"
                            sx={{ width: 80 }}
                          />
                        </Box>

                        {/* DOI and Link */}
                        <Box sx={{ display: 'flex', gap: 2, ml: 4.5 }}>
                          <TextField
                            size="small"
                            value={publication.doi || ''}
                            onChange={(e) => updatePublication(publication.id, { doi: e.target.value })}
                            placeholder="DOI (optional)"
                            variant="outlined"
                            label="DOI"
                            sx={{ width: 300 }}
                          />
                          <TextField
                            size="small"
                            value={publication.link || ''}
                            onChange={(e) => updatePublication(publication.id, { link: e.target.value })}
                            placeholder="Link (optional)"
                            variant="outlined"
                            label="Link"
                            sx={{ width: 500 }}
                          />
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

      {/* Add Publication button */}
      <Box>
        <Button
          startIcon={<AddIcon />}
          onClick={addPublication}
          variant="outlined"
          size="small"
        >
          Publication
        </Button>
      </Box>
    </Box>
  );
};
