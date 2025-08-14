"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';
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

  // Layout and section management state
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [addSectionPopupOpen, setAddSectionPopupOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editResumeInfoOpen, setEditResumeInfoOpen] = useState(false);

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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

  // Section management functions
  const handleAddSection = (sectionName: string) => {
    if (!sectionOrder.includes(sectionName)) {
      setSectionOrder(prev => [...prev, sectionName]);
      // Remove from deleted sections if it was previously deleted
      setResumeData(prev => {
        return {
          ...prev,
          deletedSections: prev.deletedSections?.filter(section => section !== sectionName) || []
          // Note: When re-adding a section, the data will be empty arrays which is correct
          // since the data was cleared when the section was deleted
        };
      });
    }
    setAddSectionPopupOpen(false);
  };

  // Real-time preview update effect
  useEffect(() => {
    // This effect ensures the preview updates when export settings change
    // The preview is already reactive to exportSettings changes
  }, [exportSettings]);


  // Auto-scroll handlers for drag and drop
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (result: DragStart) => {
    // Drag start handler
  };

  const handleDragUpdate = (result: DragUpdate) => {
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
  };

  // Handle drag end for section reordering
  const handleDragEnd = (result: DropResult) => {

    // Clear any active scroll interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (!result.destination) return;


    const newOrder = Array.from(sectionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);


    setSectionOrder(newOrder);
  };

  const handleDeleteSection = (sectionName: string) => {

    // Remove from section order
    setSectionOrder(prev => {
      const newOrder = prev.filter(section => section !== sectionName);

      return newOrder;
    });

    // Add to deleted sections and clear the data for that section
    setResumeData(prev => {
      const newDeletedSections = [...(prev.deletedSections || []), sectionName];


      const updatedData = {
        ...prev,
        deletedSections: newDeletedSections,
        // Clear data for the deleted section
        strengths: sectionName === 'Technical Skills' ? [] : prev.strengths,
        skillCategories: sectionName === 'Technical Skills' ? [] : prev.skillCategories,
        workExperience: sectionName === 'Work Experience' ? [] : prev.workExperience,
        education: sectionName === 'Education' ? [] : prev.education,
        courses: sectionName === 'Courses' ? [] : prev.courses,
        interests: sectionName === 'Interests' ? [] : prev.interests,
        projects: sectionName === 'Projects' ? [] : prev.projects,
        languages: sectionName === 'Languages' ? [] : prev.languages,
        publications: sectionName === 'Publications' ? [] : prev.publications,
        awards: sectionName === 'Awards' ? [] : prev.awards,
        volunteerExperience: sectionName === 'Volunteer Experience' ? [] : prev.volunteerExperience,
        references: sectionName === 'References' ? [] : prev.references,
      };

      return updatedData;
    });
  };

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
        onDragUpdate={handleDragUpdate}
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

          // Force immediate save
          try {
            // Save the updated resume data immediately
            if (resumeId) {
              const response = await fetch(`/api/resumes/${resumeId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...updatedData,
                  sectionOrder: sectionOrder,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to save resume');
              }

              setSuccess('Resume updated successfully');
            }
          } catch (error) {
            console.error('Error saving resume info:', error);
            setError('Failed to save resume changes');
          }
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

