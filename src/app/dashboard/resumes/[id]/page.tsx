"use client";

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import ResumeTemplateRegistry, { ResumeData, AVAILABLE_TEMPLATES } from '@/components/ResumeTemplateRegistry';
import { useRouter, useParams } from 'next/navigation';

export default function ViewResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';

  const [resumeData, setResumeData] = React.useState<ResumeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [downloading, setDownloading] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState('modern');

  // Robust React-based zooming with aspect ratio preservation
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(1);
  
  const updateZoom = React.useCallback(() => {
    if (!wrapperRef.current) return;
    const width = wrapperRef.current.offsetWidth;
    const height = wrapperRef.current.offsetHeight;
    const scaleW = width / 850;
    const scaleH = height / 1100;
    setZoom(Math.min(scaleW, scaleH, 1));
  }, []);

  React.useEffect(() => {
    // Initial zoom calculation
    updateZoom();
    
    // Add resize listener
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, [updateZoom]);

  // Additional effect to recalculate zoom when resume data loads
  React.useEffect(() => {
    if (resumeData && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(updateZoom, 100);
      return () => clearTimeout(timer);
    }
  }, [resumeData, loading, updateZoom]);

  React.useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const resume = await response.json();
          setResumeData(resume);
          // Set the selected template to the saved template from the database
          setSelectedTemplate(resume.template || 'modern');
        } else {
          setError('Failed to load resume');
        }
      } catch {
        setError('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      loadResume();
    }
  }, [resumeId]);

  const handleDownloadPDF = async () => {
    if (!resumeData) return;
    
    setDownloading(true);
    try {
      // TEMPORARY: Using final simple PDF route for testing
      // Open the HTML in a new tab instead of downloading
      const url = `/api/resumes/${resumeId}/pdf-test-final-simple?template=${selectedTemplate}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setDownloading(false);
    }
  };



  if (loading) {
    return (
      <DashboardLayout>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={{ xs: '300px', sm: '400px' }}
          p={2}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !resumeData) {
    return (
      <DashboardLayout>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Resume not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard')}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
        p: {xs: 2, md: 3}
      }}>
        {/* Header */}
        <Box 
          display="flex" 
          flexDirection="row"
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', lg: 'center' }} 
          mb={4}
          gap={2}
          sx={{ p: { xs: 1, sm: 2, md: 3 } }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem', lg: '2.125rem' },
                wordBreak: 'break-word'
              }}
            >
              {resumeData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {resumeData.createdAt ? new Date(resumeData.createdAt).toISOString().split('T')[0] : 'Unknown'}
            </Typography>
          </Box>
          <Stack 
            direction="column"
            spacing={1.2}
          >
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownloadPDF}
              disabled={downloading}
              size="small"
              sx={{ width: '100%' }}
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/dashboard/resumes/${resumeId}/edit`)}
              size="small"
              sx={{ width: '100%' }}
            >
              Edit
            </Button>
          </Stack>
        </Box>

        {/* Template Selector */}
        <Paper sx={{ 
          p: { xs: 1, sm: 2, md: 3 }, 
          mb: 3,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }} 
            gap={{ xs: 1, sm: 2 }}
          >
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
              >
                Template Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a template to preview your resume
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center" sx={{ 
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <FormControl size="small" sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '100%', sm: 'none' }
              }}>
                <InputLabel>Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="Template"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {AVAILABLE_TEMPLATES.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* Resume Preview with individual page containers */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Individual page containers */}
          <Box
            ref={wrapperRef}
            sx={{
              width: { xs: '90vw', sm: '90%', lg: 850 },
              maxWidth: 850,
              mx: 'auto',
              position: 'relative',
              background: 'transparent',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 850,
                background: '#fff',
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s',
              }}
            >
              <ResumeTemplateRegistry data={resumeData} templateId={selectedTemplate} />
            </Box>
          </Box>
        </Box>

        {/* Bottom spacing */}
        <Box sx={{ p: { xs: 2, sm: 3 } }} />

      </Box>
    </DashboardLayout>
  );
} 