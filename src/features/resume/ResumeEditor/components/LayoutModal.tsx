import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Add as AddIcon, 
  DeleteOutline as DeleteOutlineIcon, 
  DragIndicator as DragIndicatorIcon 
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface LayoutModalProps {
  open: boolean;
  onClose: () => void;
  sectionOrder: string[];
  onDragEnd: (result: DropResult) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionName: string) => void;
}

export const LayoutModal: React.FC<LayoutModalProps> = ({
  open,
  onClose,
  sectionOrder,
  onDragEnd,
  onAddSection,
  onDeleteSection
}) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop overlay for Edit Resume Layout popup */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Popup content */}
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby="layout-modal-title"
        aria-describedby="layout-modal-description"
        aria-label="Edit Resume Layout"
        sx={{
          position: 'absolute',
          bottom: 180,
          right: 45,
          background: '#fff',
          borderRadius: '0 18px 18px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 8px rgba(0,0,0,0.10)',
          zIndex: 1001,
          width: 320,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography 
              id="layout-modal-title" 
              variant="h6" 
              fontWeight={600} 
              sx={{ fontSize: '1.1rem' }}
            >
              Edit Resume Layout
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close layout editor"
              aria-describedby="close-layout-description"
              sx={{ color: '#666' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          
          <Typography 
            id="layout-modal-description" 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2, fontSize: '0.875rem' }}
          >
            Drag and drop sections to reorder them, or add new sections to your resume.
          </Typography>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="section-order" type="section">
              {(provided) => (
                <List 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  aria-label="Resume sections list"
                  aria-describedby="drag-drop-instructions"
                  sx={{ px: 0, pt: 0, pb: 0 }}
                >
                  {sectionOrder.map((section, index) => (
                    <Draggable key={section} draggableId={section} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          role="listitem"
                          aria-label={`${section} section`}
                          aria-describedby={`section-${index}-description`}
                          sx={{
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: 2,
                            mb: 0.5,
                            px: 1,
                            py: 1.2,
                            height: 38,
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            transform: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          secondaryAction={
                            <IconButton 
                              size="small" 
                              edge="end" 
                              sx={{ ml: 1 }}
                              onClick={() => onDeleteSection(section)}
                              aria-label={`Remove ${section} section from resume`}
                              aria-describedby={`delete-${section}-description`}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          }
                        >
                          <Box 
                            {...provided.dragHandleProps}
                            role="button"
                            tabIndex={0}
                            aria-label={`Drag to reorder ${section} section`}
                            aria-describedby={`drag-instructions-${section}`}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mr: 0.2, 
                              cursor: 'grab',
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <DragIndicatorIcon sx={{ color: '#bdbdbd', fontSize: 22 }} />
                          </Box>
                          <ListItemText
                            primary={section}
                            primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem', color: '#222' }}
                          />
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
          
          <Box sx={{ mb: 1.5 }}>
            <Button
              startIcon={<AddIcon />}
              variant="text"
              fullWidth
              onClick={onAddSection}
              aria-label="Add new section to resume"
              aria-describedby="add-section-description"
              aria-haspopup="dialog"
              sx={{
                borderRadius: 2,
                background: 'white',
                border: '1px solid #e0e0e0',
                color: '#222',
                fontWeight: 500,
                boxShadow: 'none',
                height: 38,
                py: 1.2,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  background: '#f0f1f3',
                  boxShadow: 'none',
                  border: 'none',
                },
              }}
            >
              Add New Section
            </Button>
          </Box>
        </Box>

        {/* Hidden descriptions for screen readers */}
        <div id="close-layout-description" className="sr-only">
          Closes the layout editor and returns to the resume view.
        </div>
        <div id="drag-drop-instructions" className="sr-only">
          Use the drag handle on the left of each section to reorder them. The order will be saved automatically.
        </div>
        <div id="add-section-description" className="sr-only">
          Opens a dialog to select and add new sections to your resume.
        </div>
        {sectionOrder.map((section, index) => (
          <div key={section} id={`section-${index}-description`} className="sr-only">
            {section} section. Use the drag handle to reorder or the delete button to remove.
          </div>
        ))}
        {sectionOrder.map((section) => (
          <div key={section} id={`delete-${section}-description`} className="sr-only">
            Removes the {section} section from your resume. This action cannot be undone.
          </div>
        ))}
        {sectionOrder.map((section) => (
          <div key={section} id={`drag-instructions-${section}`} className="sr-only">
            Click and drag to move the {section} section to a new position in your resume.
          </div>
        ))}
      </Box>
    </>
  );
};
