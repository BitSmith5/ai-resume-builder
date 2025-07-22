"use client";

import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import DashboardLayout from '@/components/DashboardLayout';

export default function ResumePage() {
  const router = useRouter();
  
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>
            RESUME
          </Typography>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/resume/new')}
          >
            Add Resume
          </Button>
        </Stack>
        <Paper sx={{ p: 3, borderRadius: 3, minHeight: 300 }}>
          {/* Resume list and actions will go here */}
          <Typography color="text.secondary" align="center">
            You have 0 resumes saved out of 5 available slots.
          </Typography>
          {/* TODO: Implement resume list table and actions */}
        </Paper>
      </Box>
    </DashboardLayout>
  );
} 