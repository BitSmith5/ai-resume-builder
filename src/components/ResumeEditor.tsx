"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
// import { generateResumePDF } from './ResumePDF';

interface ResumeData {
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
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
}

interface ResumeEditorProps {
  resumeId?: string;
  onSave?: () => void;
}

export default function ResumeEditor({ resumeId, onSave }: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: '',
    content: {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
      },
    },
    strengths: [],
    workExperience: [],
    education: [],
  });

  const loadResume = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.ok) {
        const resume = await response.json();
        setResumeData({
          title: resume.title,
          content: resume.content,
          strengths: resume.strengths,
          workExperience: resume.workExperience,
          education: resume.education,
        });
      } else {
        setError('Failed to load resume');
      }
    } catch {
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (resumeId) {
      loadResume();
    }
  }, [resumeId, loadResume]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
      const method = resumeId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
        setSuccess('Resume saved successfully!');
        onSave?.();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save resume');
      }
    } catch {
      setError('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const addStrength = () => {
    setResumeData(prev => ({
      ...prev,
      strengths: [...prev.strengths, { skillName: '', rating: 5 }],
    }));
  };

  const updateStrength = (index: number, field: 'skillName' | 'rating', value: string | number) => {
    setResumeData(prev => ({
      ...prev,
      strengths: prev.strengths.map((strength, i) => 
        i === index ? { ...strength, [field]: value } : strength
      ),
    }));
  };

  const removeStrength = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index),
    }));
  };

  const addWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      }],
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string | boolean) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeWorkExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: undefined,
      }],
    }));
  };

  const updateEducation = (index: number, field: string, value: string | boolean | number | undefined) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleDownloadPDF = async () => {
    try {
      // TODO: Implement PDF generation
      setError('PDF generation not yet implemented');
      // const blob = await generateResumePDF(resumeData);
      // const url = URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `${resumeData.title || 'resume'}.pdf`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', md: 'center' }} 
        gap={{ xs: 2, md: 3 }}
        mb={3}
      >
        <TextField
          label="Resume Title"
          value={resumeData.title}
          onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
          sx={{ minWidth: { xs: '100%', md: 300 } }}
        />
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {saving ? 'Saving...' : 'Save Resume'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Download PDF
          </Button>
        </Stack>
      </Box>

      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', lg: 'row' }}
        gap={3}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minWidth: { xs: 'auto', sm: 120 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            >
              <Tab label="Personal Info" />
              <Tab label="Skills" />
              <Tab label="Work Experience" />
              <Tab label="Education" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={resumeData.content.personalInfo.name}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          personalInfo: {
                            ...prev.content.personalInfo,
                            name: e.target.value,
                          },
                        },
                      }))}
                    />
                    <Box 
                      display="flex" 
                      flexDirection={{ xs: 'column', sm: 'row' }}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        label="Email"
                        value={resumeData.content.personalInfo.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            personalInfo: {
                              ...prev.content.personalInfo,
                              email: e.target.value,
                            },
                          },
                        }))}
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={resumeData.content.personalInfo.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            personalInfo: {
                              ...prev.content.personalInfo,
                              phone: e.target.value,
                            },
                          },
                        }))}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Address"
                      value={resumeData.content.personalInfo.address}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          personalInfo: {
                            ...prev.content.personalInfo,
                            address: e.target.value,
                          },
                        },
                      }))}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Professional Summary"
                      value={resumeData.content.personalInfo.summary}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          personalInfo: {
                            ...prev.content.personalInfo,
                            summary: e.target.value,
                          },
                        },
                      }))}
                    />
                  </Stack>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Box 
                    display="flex" 
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between" 
                    alignItems={{ xs: 'stretch', sm: 'center' }} 
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Skills & Strengths</Typography>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={addStrength}
                      variant="outlined"
                      size="small"
                    >
                      Add Skill
                    </Button>
                  </Box>
                  {resumeData.strengths.map((strength, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box 
                        display="flex" 
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={2} 
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                      >
                        <TextField
                          fullWidth
                          label="Skill Name"
                          value={strength.skillName}
                          onChange={(e) => updateStrength(index, 'skillName', e.target.value)}
                        />
                        <TextField
                          sx={{ width: { xs: '100%', sm: 150 } }}
                          type="number"
                          label="Rating (1-10)"
                          value={strength.rating}
                          onChange={(e) => updateStrength(index, 'rating', parseInt(e.target.value) || 5)}
                          inputProps={{ min: 1, max: 10 }}
                        />
                        <IconButton 
                          onClick={() => removeStrength(index)} 
                          color="error"
                          sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Box 
                    display="flex" 
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between" 
                    alignItems={{ xs: 'stretch', sm: 'center' }} 
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Work Experience</Typography>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={addWorkExperience}
                      variant="outlined"
                      size="small"
                    >
                      Add Experience
                    </Button>
                  </Box>
                  {resumeData.workExperience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Stack spacing={2}>
                        <Box 
                          display="flex" 
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Company"
                            value={exp.company}
                            onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                          />
                          <TextField
                            fullWidth
                            label="Position"
                            value={exp.position}
                            onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                          />
                        </Box>
                        <Box 
                          display="flex" 
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          gap={2}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={exp.current}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={exp.current}
                                onChange={(e) => updateWorkExperience(index, 'current', e.target.checked)}
                              />
                            }
                            label="Current Position"
                            sx={{ minWidth: 'fit-content' }}
                          />
                          <IconButton 
                            onClick={() => removeWorkExperience(index)} 
                            color="error"
                            sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Description"
                          value={exp.description}
                          onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Box 
                    display="flex" 
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between" 
                    alignItems={{ xs: 'stretch', sm: 'center' }} 
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Education</Typography>
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={addEducation}
                      variant="outlined"
                      size="small"
                    >
                      Add Education
                    </Button>
                  </Box>
                  {resumeData.education.map((edu, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Stack spacing={2}>
                        <Box 
                          display="flex" 
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Institution"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          />
                          <TextField
                            fullWidth
                            label="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          />
                        </Box>
                        <Box 
                          display="flex" 
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Field of Study"
                            value={edu.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          />
                          <TextField
                            fullWidth
                            type="number"
                            label="GPA (optional)"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value) || undefined)}
                            inputProps={{ min: 0, max: 4, step: 0.01 }}
                          />
                        </Box>
                        <Box 
                          display="flex" 
                          flexDirection={{ xs: 'column', sm: 'row' }}
                          gap={2}
                          alignItems={{ xs: 'stretch', sm: 'center' }}
                        >
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled={edu.current}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={edu.current}
                                onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                              />
                            }
                            label="Currently Studying"
                            sx={{ minWidth: 'fit-content' }}
                          />
                          <IconButton 
                            onClick={() => removeEducation(index)} 
                            color="error"
                            sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ 
          flex: 1, 
          display: { xs: 'none', lg: 'block' },
          minWidth: 0 
        }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: 'fit-content', position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>Live Preview</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {resumeData.content.personalInfo.name || 'Your Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resumeData.content.personalInfo.email || 'email@example.com'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resumeData.content.personalInfo.phone || 'Phone Number'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resumeData.content.personalInfo.address || 'Address'}
              </Typography>
            </Box>

            {resumeData.content.personalInfo.summary && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Professional Summary</Typography>
                <Typography variant="body1">
                  {resumeData.content.personalInfo.summary}
                </Typography>
              </Box>
            )}

            {resumeData.strengths.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Skills</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {resumeData.strengths.map((strength, index) => (
                    <Chip
                      key={index}
                      label={`${strength.skillName} (${strength.rating}/10)`}
                      color={strength.rating >= 8 ? 'success' : strength.rating >= 6 ? 'warning' : 'error'}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {resumeData.workExperience.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Work Experience</Typography>
                {resumeData.workExperience.map((exp, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {exp.position} at {exp.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {(() => {
                        const startDate = exp.startDate ? new Date(exp.startDate) : null;
                        const endDate = exp.endDate ? new Date(exp.endDate) : null;
                        const startStr = startDate && !isNaN(startDate.getTime()) ? startDate.toISOString().split('T')[0] : 'Unknown';
                        const endStr = exp.current ? 'Present' : (endDate && !isNaN(endDate.getTime()) ? endDate.toISOString().split('T')[0] : 'Unknown');
                        return `${startStr} - ${endStr}`;
                      })()}
                    </Typography>
                    <Typography variant="body2">
                      {exp.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {resumeData.education.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Education</Typography>
                {resumeData.education.map((edu, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {edu.degree} in {edu.field}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {edu.institution}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {(() => {
                        const startDate = edu.startDate ? new Date(edu.startDate) : null;
                        const endDate = edu.endDate ? new Date(edu.endDate) : null;
                        const startStr = startDate && !isNaN(startDate.getTime()) ? startDate.toISOString().split('T')[0] : 'Unknown';
                        const endStr = edu.current ? 'Present' : (endDate && !isNaN(endDate.getTime()) ? endDate.toISOString().split('T')[0] : 'Unknown');
                        return `${startStr} - ${endStr}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}`;
                      })()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 