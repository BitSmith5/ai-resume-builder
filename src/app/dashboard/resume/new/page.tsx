"use client";

import { Box, Typography } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeEditorV2 from '@/components/ResumeEditorV2';
import { useRouter } from 'next/navigation';

export default function NewResumeV2Page() {
  const router = useRouter();

  const handleSave = () => {
    // Redirect to resume list after successful save
    router.push('/dashboard/resume');
  };

  return (
    <DashboardLayout>
      <Box sx={{ 
        pr: {xs: 2, md: 20}, 
        maxWidth: "100%",
      }}> 
        <ResumeEditorV2 
          onSave={handleSave} 
          template="modern"
        />
      </Box>
    </DashboardLayout>
  );
} 