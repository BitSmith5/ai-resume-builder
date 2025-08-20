import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AddSectionPopupProps {
  open: boolean;
  sectionOrder: string[];
  onAddSection: (sectionName: string) => void;
}

export const AddSectionPopup: React.FC<AddSectionPopupProps> = ({
  open,
  sectionOrder,
  onAddSection
}) => {
  if (!open) return null;

  const availableSections = [
    // Original default sections (except Personal Info)
    'Professional Summary',
    'Technical Skills',
    'Work Experience',
    'Education',
    // Additional sections
    'Projects',
    'Languages',
    'Publications',
    'Awards',
    'Volunteer Experience',
    'Interests',
    'Courses',
    'References'
  ];
  
  const filteredSections = availableSections.filter(section => 
    !sectionOrder.includes(section)
  );

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-section-title"
      aria-describedby="add-section-description"
      aria-label="Add new section to resume"
      sx={{
        position: 'absolute',
        bottom: 180,
        right: 45,
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        width: 320,
        zIndex: 1003,
        maxHeight: '600px',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography 
          id="add-section-title" 
          variant="h6" 
          component="h3"
          sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 1 }}
        >
          Add New Section
        </Typography>
        <Typography 
          id="add-section-description" 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 2, fontSize: '0.875rem' }}
        >
          Select a section to add to your resume. Available sections are listed below.
        </Typography>
      </Box>
      
      <List 
        role="listbox"
        aria-label="Available sections to add"
        aria-describedby="section-selection-instructions"
        sx={{ px: 0, pt: 0, pb: 0 }}
      >
        {filteredSections.map((section) => (
          <ListItem
            key={section}
            component="button"
            role="option"
            aria-selected="false"
            onClick={(e) => {
              e.stopPropagation();
              onAddSection(section);
            }}
            aria-label={`Add ${section} section to resume`}
            aria-describedby={`add-${section}-description`}
            sx={{
              px: 2,
              py: 1.2,
              minHeight: 44,
              width: '100%',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '&:focus': {
                backgroundColor: '#f0f0f0',
                outline: '2px solid rgb(173, 126, 233)',
                outlineOffset: '-2px',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 24 }}>
              <AddIcon sx={{ fontSize: 20, color: '#666' }} />
            </ListItemIcon>
            <ListItemText
              primary={section}
              primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: '#222' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Hidden descriptions for screen readers */}
      <div id="section-selection-instructions" className="sr-only">
        Use the arrow keys to navigate through available sections. Press Enter or Space to select a section and add it to your resume.
      </div>
      {filteredSections.map((section) => (
        <div key={section} id={`add-${section}-description`} className="sr-only">
          Adds a new {section} section to your resume. This section will be placed at the end of your current sections.
        </div>
      ))}
    </Box>
  );
};
