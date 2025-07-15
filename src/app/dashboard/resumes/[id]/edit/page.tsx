"use client";

import { Box, Typography, Container } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditor from '@/components/ResumeEditor';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';

  const handleSave = () => {
    // Redirect to resumes list after successful save
    router.push('/dashboard/resumes');
  };

  return (
    <DashboardLayout>
      <Box maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: {xs: 2, md: 3}, overflow: "hidden", maxWidth: "100vw", scrollbarGutter: "stable" }}>
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
              fontWeight: 600,
            }}
          >
            Edit Resume
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          >
            Update your professional resume
          </Typography>
        </Box>
        
        <ResumeEditor 
          resumeId={resumeId} 
          onSave={handleSave} 
          template="modern"
        />
      </Box>
    </DashboardLayout>
  );
} 