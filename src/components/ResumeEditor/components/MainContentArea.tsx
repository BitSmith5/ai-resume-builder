import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';

interface MainContentAreaProps {
  sectionOrder: string[];
  sectionComponents: Record<string, () => JSX.Element>;
  onDragStart: (result: DragStart) => void;
  onDragUpdate: (result: DragUpdate) => void;
  onDragEnd: (result: DropResult) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const MainContentArea: React.FC<MainContentAreaProps> = ({
  sectionOrder,
  sectionComponents,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  scrollContainerRef
}) => {
  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      flex: 1,
      marginX: 2,
      backgroundColor: "white",
      borderTopLeftRadius: 20, 
      borderTopRightRadius: 20,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      overflow: 'hidden',
      height: '100%', // Ensure full height
    }}>
      {/* Fixed Header */}
      <Box sx={{
        padding: 3,
        borderBottom: '1px solid',
        background: 'linear-gradient(90deg, rgb(173, 126, 233) 0%, #ffffff 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Typography variant="h5" fontWeight={600} sx={{ color: 'black' }}>
          Resume Content
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'rgba(0, 0, 0, 0.7)' }}>
          Edit and organize your resume sections below
        </Typography>
      </Box>

      {/* Scrollable Content Area */}
      <Box 
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0, // Ensure flex child can shrink
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cccccc',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#aaaaaa',
          },
        }}>
        <DragDropContext 
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
        >
          <Droppable droppableId="main-section-list" type="main-section">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ padding: '16px' }}>
                {sectionOrder.map((section, idx) => (
                  <React.Fragment key={section}>
                    {section === "Personal Info" ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'stretch',
                          background: 'none',
                          borderRadius: 2,
                          mb: 0,
                        }}
                      >
                        {/* Section content */}
                        <Box sx={{ flex: 1, pl: 3 }}>
                          {sectionComponents[section]
                          ? sectionComponents[section]()
                            : (
                              <Box sx={{ py: 2, textAlign: "center" }}>
                                <Typography color="text.secondary">
                                  {section} section coming soon...
                                </Typography>
                              </Box>
                            )}
                        </Box>

                      </Box>
                    ) : (
                      <Draggable draggableId={section} index={idx}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'stretch',
                              background: 'none',
                              border: 'none',
                              borderRadius: 2,
                              mb: 0,
                              zIndex: 'auto',
                            }}
                          >
                            {/* Drag handle */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                cursor: 'grab',
                                userSelect: 'none',
                                color: '#bbb',
                                alignSelf: 'flex-start',
                                pt: 2.7,
                              }}
                            >
                              <DragIndicatorIcon sx={{ fontSize: 20 }} />
                            </Box>
                            {/* Section content */}
                            <Box sx={{ flex: 1 }}>
                              {sectionComponents[section]
                              ? sectionComponents[section]()
                                : (
                                  <Box sx={{ py: 2, textAlign: "center" }}>
                                    <Typography color="text.secondary">
                                      {section} section coming soon...
                                    </Typography>
                                  </Box>
                                )}
                            </Box>

                          </Box>
                        )}
                      </Draggable>
                    )}
                    {idx < sectionOrder.length - 1 && (
                      <Divider sx={{ my: 0 }} />
                    )}
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Box>
  );
};
