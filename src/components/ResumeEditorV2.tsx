"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";

import { ResumeHeader } from './ResumeEditor/components/ResumeHeader';
import { ExportPanel } from "./ResumeEditor/components/ExportPanel";
import { DatePicker } from "./ResumeEditor/components/DatePicker";
import { EditResumeInfoModal } from "./ResumeEditor/components/EditResumeInfoModal";
import { LayoutModal } from "./ResumeEditor/components/LayoutModal";
import { AddSectionPopup } from "./ResumeEditor/components/AddSectionPopup";
import { DeleteConfirmationDialog } from "./ResumeEditor/components/DeleteConfirmationDialog";
import { FloatingActionButton } from "./ResumeEditor/components/FloatingActionButton";
import { MainContentArea } from "./ResumeEditor/components/MainContentArea";
import { LoadingComponent } from "./ResumeEditor/components/LoadingComponent";
import { AlertMessages } from "./ResumeEditor/components/AlertMessages";
import { createSectionComponents } from "./ResumeEditor/components/SectionComponents";
import { useResumeData } from "./ResumeEditor/hooks/useResumeData";
import { useExportSettings } from "./ResumeEditor/hooks/useExportSettings";
import { useDragAndDrop } from "./ResumeEditor/hooks/useDragAndDrop";
import { useSectionManagement } from "./ResumeEditor/hooks/useSectionManagement";
import { useModalState } from "./ResumeEditor/hooks/useModalState";
import { useResumeSave } from "./ResumeEditor/hooks/useResumeSave";
import { useResumeDelete } from "./ResumeEditor/hooks/useResumeDelete";
import { useDatePicker } from "./ResumeEditor/hooks/useDatePicker";
import { useScrollManagement } from "./ResumeEditor/hooks/useScrollManagement";

interface ResumeEditorV2Props {
  resumeId?: string;
}

export default function ResumeEditorV2({ resumeId }: ResumeEditorV2Props) {
  const router = useRouter();

  // Use the custom hooks
  const {
    loading,
    error,
    success,
    resumeData,
    profileData,
    sectionOrder,
    setResumeData,
    setProfileData,
    setSectionOrder,
    setError,
    setSuccess,
    deleteResume,
  } = useResumeData(resumeId);

  const {
    exportPanelOpen,
    pdfDownloading,
    exportSettings,
    setExportSettings,
    handleExportClick,
    handleExportClose,
    handleDownloadPDF,
    refreshTrigger,
    refreshPreview,
    cleanup: cleanupExport,
  } = useExportSettings(resumeId, resumeData.title);

  // Wrapper function for PDF download that provides success/error callbacks
  const handlePDFDownload = async () => {
    await handleDownloadPDF(
      (message: string) => setSuccess(message),
      (message: string) => setError(message)
    );
  };

  // Modal state management
  const modalState = useModalState();
  const {
    editResumeInfoOpen,
    layoutModalOpen,
    addSectionPopupOpen,
    deleteConfirmOpen,
    setEditResumeInfoOpen,
    setLayoutModalOpen,
    setAddSectionPopupOpen,
    setDeleteConfirmOpen
  } = modalState;

  // Date picker state management
  const datePicker = useDatePicker();

  // Scroll management
  const scrollManagement = useScrollManagement();
  const {
    scrollContainerRef,
    scrollIntervalRef,
    handleDragUpdateWithScroll
  } = scrollManagement;

  // Cleanup effect for export timeouts
  useEffect(() => {
    return () => {
      cleanupExport();
    };
  }, [cleanupExport]);



  // Section management functionality
  const { handleAddSection, handleDeleteSection: handleDeleteSectionFromHook } = useSectionManagement({
    sectionOrder,
    setSectionOrder,
    setResumeData,
    setAddSectionPopupOpen,
    setLayoutModalOpen
  });

  // Resume save functionality
  const { saveResumeInfo } = useResumeSave({
    resumeId,
    setSuccess,
    setError
  });

  // Resume deletion functionality
  const { handleDeleteResume, confirmDelete } = useResumeDelete({
    resumeId,
    deleteResume,
    setError,
    setDeleteConfirmOpen
  });

  // Real-time preview update effect
  useEffect(() => {
    // This effect ensures the preview updates when export settings change
    // The preview is already reactive to exportSettings changes
  }, [exportSettings]);

  // Auto-refresh export panel when resume data changes
  useEffect(() => {
    // If the export panel is open and resume data changes, refresh the preview
    if (exportPanelOpen && refreshPreview) {
      refreshPreview();
    }
  }, [resumeData, sectionOrder, exportPanelOpen, refreshPreview]);


  // Drag and drop functionality
  const { handleDragStart, handleDragEnd: baseHandleDragEnd } = useDragAndDrop({
    sectionOrder,
    setSectionOrder
  });

  // Enhanced drag end that ensures scroll cleanup
  const handleDragEnd = (result: any) => {
    // Always clear any active scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    
    // Call the base handler
    baseHandleDragEnd(result);
  };



  // Use the hook's delete function
  const handleDeleteSection = handleDeleteSectionFromHook;

  if (loading) {
    return <LoadingComponent />;
  }

  // Helper: map section titles to render functions
  const SECTION_COMPONENTS = createSectionComponents({
    profileData,
    resumeData,
    setProfileData,
    setResumeData,
    onDeleteSection: handleDeleteSection
  });



  return (
    <Box sx={{
      mt: 0, // Remove negative margin
      mr: { xs: 0, md: 20 },
      display: "flex",
      flexDirection: "column",
      position: "relative",
      height: "100%", // Use full height of parent
      overflow: "hidden", // Prevent main scrollbar
    }}>

      <AlertMessages error={error} success={success} />

      {/* Resume Header */}
      <ResumeHeader
        resumeTitle={resumeData.title || 'Resume Title'}
        loading={loading}
        onClose={() => router.push('/resume')}
        onEditResumeInfo={() => {
          setEditResumeInfoOpen(true);
        }}
        onExport={handleExportClick}
        onDelete={handleDeleteResume}
      />
      {/* Main Content Area */}
      <MainContentArea
        sectionOrder={sectionOrder}
        sectionComponents={SECTION_COMPONENTS}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdateWithScroll}
        onDragEnd={handleDragEnd}
        scrollContainerRef={scrollContainerRef}
      />

      {/* Floating Edit Resume Layout Button */}
      <FloatingActionButton onClick={() => setLayoutModalOpen(true)} />

      {/* Edit Resume Layout Modal */}
      <LayoutModal
        open={layoutModalOpen}
        onClose={() => setLayoutModalOpen(false)}
        sectionOrder={sectionOrder}
        onDragEnd={handleDragEnd}
        onAddSection={() => setAddSectionPopupOpen(true)}
        onDeleteSection={handleDeleteSection}
      />

      {/* Add New Section Popup */}
      <AddSectionPopup
        open={addSectionPopupOpen && layoutModalOpen}
        sectionOrder={sectionOrder}
        onAddSection={handleAddSection}
      />

      {/* Date Picker */}
      <DatePicker
        isOpen={datePicker.datePickerOpen}
        onClose={() => datePicker.closeDatePicker()}
        onSelect={datePicker.handleDateSelect}
        position={datePicker.datePickerPosition}
      />

      {/* Edit Resume Info Modal */}
      <EditResumeInfoModal
        open={editResumeInfoOpen}
        onClose={() => setEditResumeInfoOpen(false)}
        resumeData={resumeData}
                onSave={async (updatedData) => {
          setResumeData(updatedData);
          await saveResumeInfo(updatedData, sectionOrder);
        }}
      />

      <ExportPanel
        open={exportPanelOpen}
        onClose={handleExportClose}
        exportSettings={exportSettings}
        setExportSettings={setExportSettings}
        resumeId={resumeId || ''}
        onDownloadPDF={handlePDFDownload}
        pdfDownloading={pdfDownloading}
        refreshTrigger={refreshTrigger}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={loading}
      />
    </Box>
  );
}

