"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArticleIcon from "@mui/icons-material/Article";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { DashboardLayout } from '@/shared/components';
import { useNotificationActions } from '@/hooks';


interface Resume {
  id: number;
  title: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
  template?: string;
  content: Record<string, unknown>;
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
  const { showSuccess, showError, showInfo } = useNotificationActions();
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch('/api/resumes');
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }
        const data = await response.json();
        setResumes(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        // Use direct error state instead of showError to avoid dependency issues
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []); // Only run on mount

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
    return <ArticleIcon sx={{ color: 'rgb(173, 126, 233)' }} />;
  };

  const getResumeIconColor = () => {
    return 'transparent'; // Use transparent background for all resumes
  };

  const handleResumeClick = (resumeId: number) => {
            router.push(`/resume/new?id=${resumeId}`);
  };

  const handleAddResume = () => {
            router.push('/resume/new');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, resumeId: number) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedResumeId(resumeId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedResumeId(null);
  };

  const handleEditResume = () => {
    if (selectedResumeId) {
              router.push(`/resume/new?id=${selectedResumeId}`);
    }
    handleMenuClose();
  };

  const handleExportResume = async () => {
    if (selectedResumeId) {
      try {
        showInfo('Preparing resume for export...');
        // Use the same export settings as ResumeEditorV2
        const exportSettings = {
          template: 'standard',
          pageSize: 'letter',
          fontFamily: 'Times New Roman',
          nameSize: 40,
          sectionHeadersSize: 14,
          subHeadersSize: 10.5,
          bodyTextSize: 11,
          sectionSpacing: 12,
          entrySpacing: 9,
          lineSpacing: 12,
          topBottomMargin: 33,
          sideMargins: 33,
          alignTextLeftRight: false,
          pageWidth: 850,
          pageHeight: 1100,
        };

        const response = await fetch(`/api/resumes/${selectedResumeId}/pdf-html`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exportSettings,
            generatePdf: true
          }),
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resume-${selectedResumeId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          showSuccess('Resume exported successfully!');
        } else {
          showError('Failed to export resume');
        }
      } catch {
        showError('Error exporting resume');
      }
    }
    handleMenuClose();
  };

  const handleDeleteResume = async () => {
    if (selectedResumeId && window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/resumes/${selectedResumeId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the resume from the local state
          setResumes(prevResumes => prevResumes.filter(resume => resume.id !== selectedResumeId));
          showSuccess('Resume deleted successfully');
        } else {
          showError('Failed to delete resume');
        }
      } catch {
        showError('Error deleting resume');
      }
    }
    handleMenuClose();
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
               gap: 1,
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
                                    bgcolor: 'rgb(203, 156, 263)',
                   borderRadius: 1.5,
                   color: 'rgb(143, 96, 203)'
               }}
             >
               <AddIcon sx={{ fontSize: 20 }} />
             </Box>
             <Typography
               variant="body2"
               sx={{
                 color: 'rgb(143, 96, 203)',
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
          borderRadius: 2,
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
                         transition: 'background-color 0.2s',
                         minHeight: 60
                       }}
                       onClick={() => handleResumeClick(resume.id)}
                     >
                       {/* Resume Column */}
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '35%' }}>
                                                   <Avatar
                            sx={{
                              bgcolor: getResumeIconColor(),
                              color: 'white',
                              width: 32,
                              height: 32,
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}
                          >
                           {getResumeIcon(resume.title)}
                         </Avatar>
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Typography variant="body2" fontWeight={500}>
                             {resume.title}
                           </Typography>
                         </Box>
                       </Box>

                       {/* Target Job Title Column */}
                       <Box sx={{ display: 'flex', alignItems: 'center', width: '30%' }}>
                         <Typography variant="body2" color="text.secondary">
                           {resume.jobTitle || '-'}
                         </Typography>
                       </Box>

                       {/* Last Modified Column */}
                       <Box sx={{ display: 'flex', alignItems: 'center', width: '15%' }}>
                         <Typography variant="body2" color="text.secondary">
                           {formatTimeAgo(resume.updatedAt)}
                         </Typography>
                       </Box>

                       {/* Created Column */}
                       <Box sx={{ display: 'flex', alignItems: 'center', width: '15%' }}>
                         <Typography variant="body2" color="text.secondary">
                           {formatTimeAgo(resume.createdAt)}
                         </Typography>
                       </Box>

                       {/* Actions Column */}
                       <Box sx={{ width: '5%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                         <IconButton
                           size="small"
                           onClick={(e) => handleMenuOpen(e, resume.id)}
                         >
                           <MoreHorizIcon />
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

        {/* Resume Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              minWidth: 180,
            }
          }}
        >
          <MenuItem onClick={handleEditResume}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Resume Info</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleExportResume}>
            <ListItemIcon>
              <FileDownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteResume}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: 'text.secondary' }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </DashboardLayout>
  );
} 