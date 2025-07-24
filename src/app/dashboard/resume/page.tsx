"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import DashboardLayout from '@/components/DashboardLayout';

interface Resume {
  id: number;
  title: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
  template?: string;
  content: any;
  strengths: Array<{
    id: number;
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
}

export default function ResumePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes');
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      const data = await response.json();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getResumeIcon = (title: string) => {
    // Simple logic to determine icon based on title
    if (title.toLowerCase().includes('full-stack') || title.toLowerCase().includes('developer')) {
      return 'B';
    }
    return '?';
  };

  const getResumeIconColor = (title: string) => {
    if (title.toLowerCase().includes('full-stack') || title.toLowerCase().includes('developer')) {
      return '#FFD700'; // Yellow for developer resumes
    }
    return '#9E9E9E'; // Gray for others
  };

  const handleResumeClick = (resumeId: number) => {
    router.push(`/dashboard/resume/new?id=${resumeId}`);
  };

  const handleAddResume = () => {
    router.push('/dashboard/resume/new');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{
          mr: { xs: 0, md: 20 },
          backgroundColor: "#f5f5f5",
          p: 2,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: "calc(100vh - 64px)",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{
        mr: { xs: 0, md: 20 },
        backgroundColor: "#f5f5f5 !important",
        p: 2,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "calc(100vh - 64px)",
      }}>
        {/* Slot Information Bar */}
        <Box sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
              😊
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              You have {resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved out of 5 available slots.
            </Typography>
          </Stack>
            <Box
             onClick={handleAddResume}
             sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 2,
               pr: 1,
               pl: 0.5,
               py: 0.5,
               bgcolor: 'white',
               borderRadius: 2,
               cursor: 'pointer',
               transition: 'box-shadow 0.2s',
               '&:hover': {
                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
               }
             }}
            >
             <Box
               sx={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 width: 26,
                 height: 26,
                 bgcolor: '#B2F5EA',
                 borderRadius: 1.5,
                 color: '#333333'
               }}
             >
               <AddIcon sx={{ fontSize: 20 }} />
             </Box>
             <Typography
               variant="body2"
               sx={{
                 color: '#333333',
                 fontWeight: 500
               }}
             >
               Add Resume
             </Typography>
           </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{
          backgroundColor: "white",
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          {/* Resume List */}
          <Box sx={{ px: 3, py: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {resumes.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No resumes found. Create your first resume to get started!
              </Typography>
            ) : (
              <Stack spacing={0}>
                {/* Header Row */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: '1px solid #E0E0E0',
                    fontWeight: 600,
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2" fontWeight={600} sx={{ width: '35%' }}>Resume</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ width: '30%' }}>Target Job Title</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ width: '15%' }}>Last Modified</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ width: '15%' }}>Created</Typography>
                    <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end' }}></Box>
                  </Box>

                {/* Resume Rows */}
                {resumes.map((resume, index) => (
                  <Box key={resume.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 2,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => handleResumeClick(resume.id)}
                    >
                      {/* Resume Column */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '35%' }}>
                        <Avatar
                          sx={{
                            bgcolor: getResumeIconColor(resume.title),
                            color: getResumeIconColor(resume.title) === '#FFD700' ? 'black' : 'white',
                            width: 32,
                            height: 32,
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {getResumeIcon(resume.title)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                            {resume.title}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {index === 0 && (
                              <Chip
                                label="PRIMARY"
                                size="small"
                                icon={<StarIcon />}
                                sx={{
                                  bgcolor: '#4CAF50',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            )}
                            <Chip
                              label="Analysis Complete"
                              size="small"
                              icon={<CheckCircleIcon />}
                              sx={{
                                bgcolor: '#E8F5E8',
                                color: '#4CAF50',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Stack>
                        </Box>
                      </Box>

                      {/* Target Job Title Column */}
                      <Typography variant="body2" color="text.secondary" sx={{ width: '30%' }}>
                        {resume.jobTitle || '-'}
                      </Typography>

                      {/* Last Modified Column */}
                      <Typography variant="body2" color="text.secondary" sx={{ width: '15%' }}>
                        {formatTimeAgo(resume.updatedAt)}
                      </Typography>

                      {/* Created Column */}
                      <Typography variant="body2" color="text.secondary" sx={{ width: '15%' }}>
                        {formatTimeAgo(resume.createdAt)}
                      </Typography>

                      {/* Actions Column */}
                      <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle menu actions
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    {index < resumes.length - 1 && <Divider />}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
} 