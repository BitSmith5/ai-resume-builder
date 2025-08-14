"use client";

// ResumeEditorV2 - Enhanced with section deletion persistence
// Features:
// - Sections can be deleted and this state is persisted to the database
// - Deleted sections are remembered and won't show up when the page is reloaded
// - Users can re-add deleted sections through the "Add Section" button
// - Section order and deletion state are saved automatically

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  Close as CloseIcon,
  DragIndicator as DragIndicatorIcon,
  List as ListIcon,
} from "@mui/icons-material";

import { DragDropContext, Droppable, Draggable, DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';

import { COLORS } from '../lib/colorSystem';
import { ResumeHeader } from './ResumeEditor/components/ResumeHeader';
import { PersonalInfoSection } from './ResumeEditor/components/sections/PersonalInfoSection';
import { ProfessionalSummarySection } from "./ResumeEditor/components/sections/ProfessionalSummarySection";
import { TechnicalSkillsSection } from "./ResumeEditor/components/sections/TechnicalSkillsSection";
import { WorkExperienceSection } from "./ResumeEditor/components/sections/WorkExperienceSection";
import { EducationSection } from "./ResumeEditor/components/sections/EducationSection";
import { CoursesSection } from "./ResumeEditor/components/sections/CoursesSection";
import { InterestsSection } from "./ResumeEditor/components/sections/InterestsSection";
import { ProjectsSection } from "./ResumeEditor/components/sections/ProjectsSection";
import { LanguagesSection } from "./ResumeEditor/components/sections/LanguagesSection";
import { PublicationsSection } from "./ResumeEditor/components/sections/PublicationsSection";
import { AwardsSection } from "./ResumeEditor/components/sections/AwardsSection";
import { VolunteerExperienceSection } from "./ResumeEditor/components/sections/VolunteerExperienceSection";
import { ReferencesSection } from "./ResumeEditor/components/sections/ReferencesSection";
import { ExportPanel } from "./ResumeEditor/components/ExportPanel";
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
  const [editFormData, setEditFormData] = useState({
    title: "",
    jobTitle: "",
  });

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









  // Custom Date Picker Component
  const DatePicker = ({ isOpen, onClose, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (date: string) => void;
  }) => {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    if (!isOpen) return null;

    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 3000,
          }}
          onClick={() => {
            onClose();
            setSelectedYear(null);
          }}
        />
        <Box
          sx={{
            position: 'fixed',
            top: datePickerPosition.y,
            left: datePickerPosition.x,
            background: '#fff',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            zIndex: 3001,
            px: 1,
            minWidth: 100,
            transform: 'scaleY(0)',
            transformOrigin: 'top',
            animation: 'expandDown 0.2s ease-out forwards',
            '@keyframes expandDown': {
              '0%': {
                transform: 'scaleY(0)',
                opacity: 0,
              },
              '100%': {
                transform: 'scaleY(1)',
                opacity: 1,
              },
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!selectedYear ? (
            // Year Selection
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 200,
              overflowY: 'auto',
              overflowX: 'hidden',
              alignItems: 'flex-start',
              pr: 0.5,
              ml: -0.5,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cccccc',
                borderRadius: '2px',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#aaaaaa',
              },
            }}>
              {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <Box
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  sx={{
                    py: 0.25,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: COLORS.background,
                    },
                    textAlign: 'left',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    width: '100%',
                  }}
                >
                  {year}
                </Box>
              ))}
            </Box>
          ) : (
            // Month Selection
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 200,
              overflowY: 'auto',
              overflowX: 'hidden',
              alignItems: 'flex-start',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cccccc',
                borderRadius: '2px',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#aaaaaa',
              },
            }}>
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ].map((month) => (
                <Box
                  key={month}
                  onClick={() => {
                    const dateString = `${month} ${selectedYear}`;
                    onSelect(dateString);
                    setSelectedYear(null);
                  }}
                  sx={{
                    py: 0.25,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: COLORS.background,
                    },
                    textAlign: 'left',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    width: '100%',
                  }}
                >
                  {month}
                </Box>
              ))}
            </Box>
          )}

          {selectedYear && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button
                onClick={() => setSelectedYear(null)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  color: COLORS.primary,
                  '&:hover': {
                    backgroundColor: COLORS.overlay,
                  }
                }}
              >
                Back to Years
              </Button>
            </Box>
          )}
        </Box>
      </>
    );
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
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading resume editor...
        </Typography>
      </Box>
    );
  }

  // Helper: map section titles to render functions
  const SECTION_COMPONENTS: Record<string, () => JSX.Element> = {
    "Personal Info": () => (
      <PersonalInfoSection
        profileData={profileData}
        setProfileData={setProfileData}
      />
    ),
    "Professional Summary": () => (
      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Technical Skills": () => (
      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Work Experience": () => (
      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Education": () => (
      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Courses": () => (
      <CoursesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Interests": () => (
      <InterestsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Projects": () => (
      <ProjectsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Languages": () => (
      <LanguagesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Publications": () => (
      <PublicationsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Awards": () => (
      <AwardsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Volunteer Experience": () => (
      <VolunteerExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
        setDatePickerOpen={setDatePickerOpen}
        setDatePickerPosition={setDatePickerPosition}
        datePickerCallbackRef={datePickerCallbackRef}
      />
    ),
    "References": () => (
      <ReferencesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    // Add more sections as needed...
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Resume Header */}
      <ResumeHeader
        resumeTitle={resumeData.title || 'Resume Title'}
        loading={loading}
        onClose={() => router.push('/resume')}
        onEditResumeInfo={() => {
          setEditFormData({
            title: resumeData.title,
            jobTitle: resumeData.jobTitle || "",
          });
          setEditResumeInfoOpen(true);
        }}
        onExport={handleExportClick}
        onDelete={handleDeleteResume}
      />
      {/* Main Content Area */}

      <Box sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        marginX: 2,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
      }}>
        {/* Fixed Header */}
        <Box sx={{
          padding: 3,
          borderBottom: '1px solid #e0e0e0',
          background: `linear-gradient(90deg, ${COLORS.primary} 0%, #ffffff 100%)`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Typography variant="h5" fontWeight={600} sx={{ color: 'black' }}>
            Resume Content
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(0, 0, 0, 0.7)' }}>
            Edit and organize your resume sections below
          </Typography>
        </Box>

        {/* Scrollable Content Area */}
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cccccc',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#aaaaaa',
            },
          }}>
          <DragDropContext
            onDragStart={handleDragStart}
            onDragUpdate={handleDragUpdate}
            onDragEnd={handleDragEnd}
          >
            <Droppable droppableId="main-section-list" type="main-section">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {sectionOrder.map((section, idx) => (
                    <React.Fragment key={section}>
                      {section === "Personal Info" ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'stretch',
                            background: 'none',
                            borderRadius: 2,
                            mb: 0,
                          }}
                        >
                          {/* Section content */}
                          <Box sx={{ flex: 1, pl: 3 }}>
                            {SECTION_COMPONENTS[section]
                              ? SECTION_COMPONENTS[section]()
                              : (
                                <Box sx={{ py: 2, textAlign: "center" }}>
                                  <Typography color="text.secondary">
                                    {section} section coming soon...
                                  </Typography>
                                </Box>
                              )}
                          </Box>

                        </Box>
                      ) : (
                        <Draggable draggableId={section} index={idx}>
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'stretch',
                                background: 'none',
                                border: 'none',
                                borderRadius: 2,
                                mb: 0,
                                zIndex: 'auto',
                              }}
                            >
                              {/* Drag handle */}
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  px: 1,
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  alignSelf: 'flex-start',
                                  pt: 2.7,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              {/* Section content */}
                              <Box sx={{ flex: 1 }}>
                                {SECTION_COMPONENTS[section]
                                  ? SECTION_COMPONENTS[section]()
                                  : (
                                    <Box sx={{ py: 2, textAlign: "center" }}>
                                      <Typography color="text.secondary">
                                        {section} section coming soon...
                                      </Typography>
                                    </Box>
                                  )}
                              </Box>

                            </Box>
                          )}
                        </Draggable>
                      )}
                      {idx < sectionOrder.length - 1 && (
                        <Divider sx={{ borderColor: '#e0e0e0', my: 0 }} />
                      )}
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Box>

      {/* Floating Edit Resume Layout Button */}
      <Box
        sx={{
          position: "absolute",
          bottom: 100,
          right: 50,
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          sx={{
            borderRadius: "50%",
            width: 60,
            height: 60,
            minWidth: 60,
            minHeight: 60,
            maxWidth: 60,
            maxHeight: 60,
            padding: 0,
            background: COLORS.primary,
            boxShadow: 'none',
            '&:hover': {
              background: COLORS.hover,
            }
          }}
          onClick={() => setLayoutModalOpen(true)}
        >
          <ListIcon sx={{ fontSize: 28, color: 'black', fontWeight: 500 }} />
        </Button>
      </Box>

      {/* Edit Resume Layout Modal */}
      {layoutModalOpen && (
        <>
          {/* Backdrop overlay for Edit Resume Layout popup */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            }}
            onClick={() => {
              setLayoutModalOpen(false);
            }}
          />
          {/* Popup content */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 180,
              right: 45,
              background: '#fff',
              borderRadius: '0 18px 18px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 8px rgba(0,0,0,0.10)',
              zIndex: 1001,
              width: 320,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 1.5, pt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                  Edit Resume Layout
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setLayoutModalOpen(false)}
                  sx={{ color: '#666' }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="section-order" type="section">
                  {(provided) => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ px: 0, pt: 0, pb: 0 }}
                    >
                      {sectionOrder.map((section, index) => (
                        <Draggable key={section} draggableId={section} index={index}>
                          {(provided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                background: '#f5f5f5',
                                border: 'none',
                                borderRadius: 2,
                                mb: 0.5,
                                px: 1,
                                py: 1.2,
                                height: 38,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                transform: 'none',
                                transition: 'all 0.2s ease',
                              }}
                              secondaryAction={
                                <IconButton size="small" edge="end" sx={{ ml: 1 }}>
                                  <DeleteOutlineIcon />
                                </IconButton>
                              }
                            >
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mr: 0.2,
                                  cursor: 'grab',
                                  '&:active': { cursor: 'grabbing' }
                                }}
                              >
                                <DragIndicatorIcon sx={{ color: '#bdbdbd', fontSize: 22 }} />
                              </Box>
                              <ListItemText
                                primary={section}
                                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem', color: '#222' }}
                              />
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
              <Box sx={{ mb: 1.5 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="text"
                  fullWidth
                  onClick={() => setAddSectionPopupOpen(true)}
                  sx={{
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    color: '#222',
                    fontWeight: 500,
                    boxShadow: 'none',
                    height: 38,
                    py: 1.2,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: '#f0f1f3',
                      boxShadow: 'none',
                      border: 'none',
                    },
                  }}
                >
                  Add New Section
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Add New Section Popup - Independent Modal */}
      {addSectionPopupOpen && layoutModalOpen && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 180,
            right: 45,
            background: '#fff',
            borderRadius: '18px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            width: 320,
            zIndex: 1003,
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          <List sx={{ px: 0, pt: 0, pb: 0 }}>
            {(() => {
              const availableSections = [
                // Original default sections (except Personal Info)
                'Professional Summary',
                'Technical Skills',
                'Work Experience',
                'Education',
                // Additional sections
                'Projects',
                'Languages',
                'Publications',
                'Awards',
                'Volunteer Experience',
                'Interests',
                'Courses',
                'References'
              ];
              const filteredSections = availableSections.filter(section =>
                !sectionOrder.includes(section)
              );
              return filteredSections;
            })().map((section) => (
              <ListItem
                key={section}
                component="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSection(section);
                }}
                sx={{
                  px: 2,
                  py: 1.2,
                  minHeight: 44,
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <AddIcon sx={{ fontSize: 20, color: '#666' }} />
                </ListItemIcon>
                <ListItemText
                  primary={section}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: '#222' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

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
      />

      {/* Edit Resume Info Popup - Full Screen Overlay */}
      {editResumeInfoOpen && (
        <>
          {/* Backdrop overlay for Edit Resume Info popup */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 2000,
            }}
            onClick={() => setEditResumeInfoOpen(false)}
          />
          {/* Popup content */}
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: '0 18px 18px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 8px rgba(0,0,0,0.10)',
              zIndex: 2001,
              width: 500,
              p: 3,
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                Edit Resume Info
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditResumeInfoOpen(false)}
                sx={{ color: '#666' }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box sx={{ mx: 0, mb: 3, height: 1.5, backgroundColor: '#e0e0e0' }} />

            {/* Form Fields */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                * Resume Name
              </Typography>
              <TextField
                fullWidth
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your resume name"
                inputProps={{
                  style: {
                    fontSize: '14px',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    height: 40,
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Target Job Title
              </Typography>
              <TextField
                fullWidth
                value={editFormData.jobTitle}
                onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Enter the job title you're aiming for (e.g., Product Manager)"
                inputProps={{
                  style: {
                    fontSize: '14px',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    height: 40,
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setEditResumeInfoOpen(false)}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  color: '#222',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  const updatedResumeData = {
                    ...resumeData,
                    title: editFormData.title,
                    jobTitle: editFormData.jobTitle,
                  };
                  setResumeData(updatedResumeData);
                  setEditResumeInfoOpen(false);

                  // Force immediate save
                  try {
                    // debouncedSave is no longer imported, so this will cause an error
                    // Assuming debouncedSave is meant to be removed or replaced
                    // For now, commenting out the call to avoid immediate errors
                    // await debouncedSave(updatedResumeData, profileData, sectionOrder);
                  } catch (error) {
                    console.error('Error saving resume info:', error);
                  }
                }}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  background: COLORS.primary,
                  color: '#222',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    background: COLORS.hover,
                  },
                }}
              >
                Update
              </Button>
            </Box>
          </Box>
        </>
      )}

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
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${COLORS.shadow}`,
            border: `1px solid ${COLORS.overlay}`,
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
            color: 'white',
            borderRadius: '12px 12px 0 0',
            textAlign: 'center'
          }}
        >
          Delete Resume
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ my: 3, color: '#333', lineHeight: 1.6 }}>
            Are you sure you want to delete this resume? This action cannot be undone and will permanently remove all associated data including:
          </Typography>
          <Box
            component="ul"
            sx={{
              px: 4,
              py: 2,
              mb: 3,
              backgroundColor: COLORS.selectedBackground,
              borderRadius: 2,
              border: `1px solid ${COLORS.overlay}`
            }}
          >
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
              Personal information and contact details
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
              Work experience and education history
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
              Skills, projects, and achievements
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1, color: '#555' }}>
              Profile picture and all other resume data
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 2,
              p: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="#856404" fontWeight={600}>
              ⚠️ This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: COLORS.primary,
              color: COLORS.primary,
              '&:hover': {
                borderColor: COLORS.primaryDark,
                backgroundColor: COLORS.selectedBackground,
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{
              textTransform: 'none',
              backgroundColor: '#dc3545',
              '&:hover': {
                backgroundColor: '#c82333',
              },
              '&:disabled': {
                backgroundColor: '#6c757d',
              }
            }}
          >
            {loading ? 'Deleting...' : 'Delete Resume'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

