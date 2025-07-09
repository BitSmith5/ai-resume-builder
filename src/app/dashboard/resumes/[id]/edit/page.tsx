"use client";

import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditor from '@/components/ResumeEditor';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const handleSave = () => {
    // Redirect to resumes list after successful save
    router.push('/dashboard/resumes');
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Resume
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Update your professional resume
        </Typography>
        
        <ResumeEditor resumeId={resumeId} onSave={handleSave} />
      </Box>
    </DashboardLayout>
  );
} 