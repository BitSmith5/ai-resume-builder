import { useCallback } from 'react';

interface UseResumeDeleteProps {
  resumeId?: string;
  deleteResume: () => Promise<boolean>;
  setError: (message: string) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
}

export const useResumeDelete = ({ 
  resumeId, 
  deleteResume, 
  setError, 
  setDeleteConfirmOpen 
}: UseResumeDeleteProps) => {
  
  const handleDeleteResume = useCallback(() => {
    if (!resumeId) {
      setError("No resume ID found");
      return;
    }
    setDeleteConfirmOpen(true);
  }, [resumeId, setError, setDeleteConfirmOpen]);

  const confirmDelete = useCallback(async () => {
    try {
      setDeleteConfirmOpen(false);
      await deleteResume();
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("An error occurred while deleting the resume");
    }
  }, [deleteResume, setDeleteConfirmOpen, setError]);

  return {
    handleDeleteResume,
    confirmDelete
  };
};
