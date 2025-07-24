"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function PDFViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const template = searchParams?.get('template') || 'modern';
  
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResumeHTML = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}/pdf-test-modern-fixed?template=${template}`);
        
        if (!response.ok) {
          throw new Error('Failed to load resume');
        }
        
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (err) {
        console.error('Error loading resume HTML:', err);
        setError('Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      loadResumeHTML();
    }
  }, [resumeId, template]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <div>Loading resume...</div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/dashboard/resumes/${resumeId}`)}
        >
          Back to Resume
        </Button>
      </Box>
    );
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ 
        width: '100%', 
        height: '100vh', 
        margin: 0, 
        padding: 0,
        overflow: 'auto'
      }}
    />
  );
} 