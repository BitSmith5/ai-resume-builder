"use client";

import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditor from '@/components/ResumeEditor';
import { useRouter } from 'next/navigation';

export default function NewResumePage() {
  const router = useRouter();

  const handleSave = () => {
    // Redirect to resumes list after successful save
    router.push('/dashboard/resumes');
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Resume
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Build your professional resume with our easy-to-use editor
        </Typography>
        
        <ResumeEditor onSave={handleSave} />
      </Box>
    </DashboardLayout>
  );
} 