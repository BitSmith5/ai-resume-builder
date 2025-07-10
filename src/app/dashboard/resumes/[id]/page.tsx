"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter, useParams } from 'next/navigation';


interface ResumeData {
  id: number;
  title: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
      summary: string;
    };
  };
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
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  createdAt: string;
}

export default function ViewResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const resume = await response.json();
          setResumeData(resume);
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
      const response = await fetch(`/api/resumes/${resumeId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        console.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getStrengthColor = (rating: number) => {
    if (rating >= 8) return "success";
    if (rating >= 6) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !resumeData) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Resume not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {resumeData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {new Date(resumeData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard')}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/dashboard/resumes/${resumeId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </Stack>
        </Box>

        {/* Resume Content */}
        <Paper sx={{ p: 4 }}>
          {/* Personal Information */}
          <Box mb={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Personal Information
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {resumeData.content.personalInfo.name || 'Not provided'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {resumeData.content.personalInfo.email || 'Not provided'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Phone:</strong> {resumeData.content.personalInfo.phone || 'Not provided'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Address:</strong> {resumeData.content.personalInfo.address || 'Not provided'}
                </Typography>
              </Box>
            </Box>
            {resumeData.content.personalInfo.summary && (
              <Box mt={2}>
                <Typography variant="body1" gutterBottom>
                  <strong>Professional Summary:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resumeData.content.personalInfo.summary}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Skills */}
          {resumeData.strengths.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" component="h2" gutterBottom>
                Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {resumeData.strengths.map((strength) => (
                  <Chip
                    key={strength.id}
                    label={`${strength.skillName} (${strength.rating}/10)`}
                    color={getStrengthColor(strength.rating) as "success" | "warning" | "error"}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Work Experience */}
          {resumeData.workExperience.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" component="h2" gutterBottom>
                Work Experience
              </Typography>
              <Stack spacing={3}>
                {resumeData.workExperience.map((exp) => (
                  <Card key={exp.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {exp.position}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {exp.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                      </Typography>
                      {exp.description && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          {exp.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Education
              </Typography>
              <Stack spacing={3}>
                {resumeData.education.map((edu) => (
                  <Card key={edu.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {edu.degree} in {edu.field}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {edu.institution}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
                      </Typography>
                      {edu.gpa && (
                        <Typography variant="body2" color="text.secondary">
                          GPA: {edu.gpa}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
} 