import { useCallback } from 'react';

interface UseResumeSaveProps {
  resumeId?: string;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

export const useResumeSave = ({ 
  resumeId, 
  setSuccess, 
  setError 
}: UseResumeSaveProps) => {
  
  const saveResumeData = useCallback(async (resumeData: any, sectionOrder: string[]) => {
    if (!resumeId) {
      setError('No resume ID available');
      return false;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...resumeData,
          sectionOrder: sectionOrder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      setSuccess('Resume updated successfully');
      return true;
    } catch (error) {
      console.error('Error saving resume:', error);
      setError('Failed to save resume changes');
      return false;
    }
  }, [resumeId, setSuccess, setError]);

  const saveResumeInfo = useCallback(async (updatedData: any, sectionOrder: string[]) => {
    return await saveResumeData(updatedData, sectionOrder);
  }, [saveResumeData]);

  return {
    saveResumeData,
    saveResumeInfo
  };
};
