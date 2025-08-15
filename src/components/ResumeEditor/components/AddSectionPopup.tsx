import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
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
      <List sx={{ px: 0, pt: 0, pb: 0 }}>
        {filteredSections.map((section) => (
          <ListItem
            key={section}
            component="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddSection(section);
            }}
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
    </Box>
  );
};
