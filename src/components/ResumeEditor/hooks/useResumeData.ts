import { useState, useCallback } from 'react';
import { ResumeData } from '../types';

interface UseResumeDataProps {
  initialData: ResumeData;
  onSave?: (data: ResumeData) => Promise<void>;
}

export const useResumeData = ({ initialData, onSave }: UseResumeDataProps) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const updateResumeData = useCallback((updates: Partial<ResumeData>) => {
    setResumeData((prev: ResumeData) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const updateSection = useCallback((sectionName: keyof ResumeData, updates: any) => {
    setResumeData((prev: ResumeData) => {
      const currentSection = prev[sectionName];
      if (currentSection && typeof currentSection === 'object') {
        return {
          ...prev,
          [sectionName]: {
            ...currentSection,
            ...updates,
          },
        };
      }
      return prev;
    });
  }, []);

  const saveResume = useCallback(async () => {
    if (!onSave) return;
    
    try {
      setLoading(true);
      setError('');
      await onSave(resumeData);
      setSuccess('Resume saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setLoading(false);
    }
  }, [resumeData, onSave]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    resumeData,
    setResumeData,
    loading,
    error,
    success,
    updateResumeData,
    updateSection,
    saveResume,
    clearMessages,
  };
};
