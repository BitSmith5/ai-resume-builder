import { useCallback } from 'react';
import { useNotificationActions } from '@/hooks';

interface UseResumeSaveProps {
  resumeId?: string;
}

export const useResumeSave = ({ 
  resumeId
}: UseResumeSaveProps) => {
  const { showSuccess, showError } = useNotificationActions();
  
  const saveResumeData = useCallback(async (resumeData: any, sectionOrder: string[]) => {
    if (!resumeId) {
      showError('No resume ID available');
      return;
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

      showSuccess('Resume updated successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      showError('Failed to save resume changes');
    }
  }, [resumeId, showSuccess, showError]);

  const saveResumeInfo = useCallback(async (updatedData: any, sectionOrder: string[]) => {
    await saveResumeData(updatedData, sectionOrder);
  }, [saveResumeData]);

  return {
    saveResumeData,
    saveResumeInfo
  };
};
