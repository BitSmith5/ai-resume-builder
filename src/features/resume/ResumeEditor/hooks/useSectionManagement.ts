import { useCallback } from 'react';

interface UseSectionManagementProps {
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  setResumeData: (data: any) => void;
  setAddSectionPopupOpen: (open: boolean) => void;
  setLayoutModalOpen: (open: boolean) => void;
}

export const useSectionManagement = ({
  sectionOrder,
  setSectionOrder,
  setResumeData,
  setAddSectionPopupOpen,
  setLayoutModalOpen
}: UseSectionManagementProps) => {
  
  const handleAddSection = useCallback((sectionName: string) => {
    // Add to section order
    const newOrder = [...sectionOrder, sectionName];
    setSectionOrder(newOrder);

    // Initialize section data based on type
    setResumeData((prev: any) => {
      const updatedData = { ...prev };
      
      switch (sectionName) {
        case 'Professional Summary':
          updatedData.professionalSummary = updatedData.professionalSummary || '';
          break;
        case 'Technical Skills':
          updatedData.technicalSkills = updatedData.technicalSkills || [];
          break;
        case 'Work Experience':
          updatedData.workExperience = updatedData.workExperience || [];
          break;
        case 'Education':
          updatedData.education = updatedData.education || [];
          break;
        case 'Projects':
          updatedData.projects = updatedData.projects || [];
          break;
        case 'Languages':
          updatedData.languages = updatedData.languages || [];
          break;
        case 'Publications':
          updatedData.publications = updatedData.publications || [];
          break;
        case 'Awards':
          updatedData.awards = updatedData.awards || [];
          break;
        case 'Volunteer Experience':
          updatedData.volunteerExperience = updatedData.volunteerExperience || [];
          break;
        case 'Interests':
          updatedData.interests = updatedData.interests || [];
          break;
        case 'Courses':
          updatedData.courses = updatedData.courses || [];
          break;
        case 'References':
          updatedData.references = updatedData.references || [];
          break;
      }
      
      return updatedData;
    });

    // Close modals
    setAddSectionPopupOpen(false);
    setLayoutModalOpen(false);
  }, [sectionOrder, setSectionOrder, setResumeData, setAddSectionPopupOpen, setLayoutModalOpen]);

  const handleDeleteSection = useCallback((sectionName: string) => {
    // Remove from section order
    const newOrder = sectionOrder.filter(section => section !== sectionName);
    setSectionOrder(newOrder);

    // Clear section data
    setResumeData((prev: any) => {
      const updatedData = { ...prev };
      
      switch (sectionName) {
        case 'Professional Summary':
          updatedData.professionalSummary = '';
          break;
        case 'Technical Skills':
          updatedData.technicalSkills = [];
          break;
        case 'Work Experience':
          updatedData.workExperience = [];
          break;
        case 'Education':
          updatedData.education = [];
          break;
        case 'Projects':
          updatedData.projects = [];
          break;
        case 'Languages':
          updatedData.languages = [];
          break;
        case 'Publications':
          updatedData.publications = [];
          break;
        case 'Awards':
          updatedData.awards = [];
          break;
        case 'Volunteer Experience':
          updatedData.volunteerExperience = [];
          break;
        case 'Interests':
          updatedData.interests = [];
          break;
        case 'Courses':
          updatedData.courses = [];
          break;
        case 'References':
          updatedData.references = [];
          break;
      }
      
      return updatedData;
    });
  }, [sectionOrder, setSectionOrder, setResumeData]);

  return {
    handleAddSection,
    handleDeleteSection
  };
};
