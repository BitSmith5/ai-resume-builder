import { useState, useCallback } from 'react';

export const useModalState = () => {
  const [editResumeInfoOpen, setEditResumeInfoOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [addSectionPopupOpen, setAddSectionPopupOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const openEditResumeInfo = useCallback(() => setEditResumeInfoOpen(true), []);
  const closeEditResumeInfo = useCallback(() => setEditResumeInfoOpen(false), []);
  
  const openLayoutModal = useCallback(() => setLayoutModalOpen(true), []);
  const closeLayoutModal = useCallback(() => setLayoutModalOpen(false), []);
  
  const openAddSectionPopup = useCallback(() => setAddSectionPopupOpen(true), []);
  const closeAddSectionPopup = useCallback(() => setAddSectionPopupOpen(false), []);
  
  const openDeleteConfirm = useCallback(() => setDeleteConfirmOpen(true), []);
  const closeDeleteConfirm = useCallback(() => setDeleteConfirmOpen(false), []);
  
  const openDatePicker = useCallback(() => setDatePickerOpen(true), []);
  const closeDatePicker = useCallback(() => setDatePickerOpen(false), []);

  const closeAllModals = useCallback(() => {
    setEditResumeInfoOpen(false);
    setLayoutModalOpen(false);
    setAddSectionPopupOpen(false);
    setDeleteConfirmOpen(false);
    setDatePickerOpen(false);
  }, []);

  return {
    // Modal states
    editResumeInfoOpen,
    layoutModalOpen,
    addSectionPopupOpen,
    deleteConfirmOpen,
    datePickerOpen,
    
    // Open functions
    openEditResumeInfo,
    openLayoutModal,
    openAddSectionPopup,
    openDeleteConfirm,
    openDatePicker,
    
    // Close functions
    closeEditResumeInfo,
    closeLayoutModal,
    closeAddSectionPopup,
    closeDeleteConfirm,
    closeDatePicker,
    
    // Utility
    closeAllModals,
    
    // Setters (for backward compatibility)
    setEditResumeInfoOpen,
    setLayoutModalOpen,
    setAddSectionPopupOpen,
    setDeleteConfirmOpen,
    setDatePickerOpen
  };
};
