"use client";

import { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditor from '@/components/ResumeEditor';
import { useRouter } from 'next/navigation';

// Placeholder for template previews
const templates = [
  {
    id: 'modern',
    name: 'Modern (Two-Column)',
    description: 'A modern, two-column resume with color accents.',
    // You can add a preview image or component here later
  },
  // Add more templates here in the future
];

export default function NewResumePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSave = () => {
    // Redirect to resumes list after successful save
    router.push('/dashboard/resumes');
  };

  if (!selectedTemplate) {
    return (
      <DashboardLayout>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Select a Resume Template
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Choose a style for your new resume. You can customize your content after selecting a template.
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
            {templates.map((template) => (
              <Paper key={template.id} elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{template.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{template.description}</Typography>
                {/* Add a preview image or component here in the future */}
                <Button variant="contained" onClick={() => setSelectedTemplate(template.id)}>
                  Select
                </Button>
              </Paper>
            ))}
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Resume
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Build your professional resume with our easy-to-use editor
        </Typography>
        <ResumeEditor onSave={handleSave} template={selectedTemplate} />
      </Box>
    </DashboardLayout>
  );
} 