"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { DragUpdate } from '@hello-pangea/dnd';
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
    datePickerOpen,
    setDatePickerOpen,
    setEditResumeInfoOpen,
    setLayoutModalOpen,
    setAddSectionPopupOpen,
    setDeleteConfirmOpen
  } = modalState;

  // Date picker state
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });
  const datePickerCallbackRef = useRef<((date: string) => void) | null>(null);

  // Scroll and layout refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect for export timeouts
  useEffect(() => {
    return () => {
      cleanupExport();
    };
  }, [cleanupExport]);

  // Cleanup effect for scroll intervals
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, []);

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

  // Real-time preview update effect
  useEffect(() => {
    // This effect ensures the preview updates when export settings change
    // The preview is already reactive to exportSettings changes
  }, [exportSettings]);


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

  // Enhanced drag update with auto-scroll
  const handleDragUpdateWithScroll = (result: DragUpdate) => {
    if (!scrollContainerRef.current) return;

    // Clear any existing scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Get current mouse position from the document
    let mouseY = 0;
    if (window.event && window.event instanceof MouseEvent) {
      mouseY = window.event.clientY;
    } else {
      // Fallback: try to get from the drag update result if available
      mouseY = (result as any).clientY || 0;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSpeed = 15; // Reduced scroll speed for smoother control
    const scrollThreshold = 250; // Increased threshold for better detection

    // Only start scrolling if we're near the edges and not already scrolling
    if (!scrollIntervalRef.current) {
      // Check if dragging near the top edge
      if (mouseY - containerRect.top < scrollThreshold) {
        // Start continuous scrolling up
        scrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop -= scrollSpeed;
          }
        }, 16); // ~60fps
      }
      // Check if dragging near the bottom edge
      else if (containerRect.bottom - mouseY < scrollThreshold) {
        // Start continuous scrolling down
        scrollIntervalRef.current = setInterval(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += scrollSpeed;
          }
        }, 16); // ~60fps
      }
    }
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
    onDeleteSection: handleDeleteSection,
    setDatePickerOpen,
    setDatePickerPosition,
    datePickerCallbackRef
  });

  const handleDeleteResume = async () => {
    if (!resumeId) {
      setError("No resume ID found");
      return;
    }

    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteConfirmOpen(false);
      await deleteResume();
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("An error occurred while deleting the resume");
    }
  };

  return (
    <Box sx={{
      mr: { xs: 0, md: 20 },
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: "relative",
      height: "calc(100vh - 64px)",
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
        isOpen={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          // Don't clear the callback at all - let onSelect handle it
        }}
        onSelect={(date: string) => {
          if (datePickerCallbackRef.current) {
            datePickerCallbackRef.current(date);
          } else {

          }
          setDatePickerOpen(false);
        }}
        position={datePickerPosition}
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

