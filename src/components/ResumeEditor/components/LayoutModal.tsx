import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon 
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
      />
      {/* Popup content */}
      <Box
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
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
              Edit Resume Layout
            </Typography>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: '#666' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="section-order" type="section">
              {(provided) => (
                <List 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  sx={{ px: 0, pt: 0, pb: 0 }}
                >
                  {sectionOrder.map((section, index) => (
                    <Draggable key={section} draggableId={section} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
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
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          }
                        >
                          <Box 
                            {...provided.dragHandleProps}
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
      </Box>
    </>
  );
};
