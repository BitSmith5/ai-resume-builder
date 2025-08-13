"use client";

// ResumeEditorV2 - Enhanced with section deletion persistence
// Features:
// - Sections can be deleted and this state is persisted to the database
// - Deleted sections are remembered and won't show up when the page is reloaded
// - Users can re-add deleted sections through the "Add Section" button
// - Section order and deletion state are saved automatically

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
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
  List as ListIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";



import { DragDropContext, Droppable, Draggable, DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';




import { useDebouncedCallback } from 'use-debounce';
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



interface ResumeData {
  title: string;
  jobTitle?: string;
  template?: string;
  profilePicture?: string;
  deletedSections?: string[]; // Array of section names that have been deleted
  sectionOrder?: string[]; // Array of section names in display order
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      city: string;
      state: string;
      summary: string;
      website?: string;
      linkedin?: string;
      github?: string;
    };
  };
  strengths: Array<{
    skillName: string;
    rating: number;
  }>;
  skillCategories?: Array<{
    id: string;
    title: string;
    skills: Array<{
      id: string;
      name: string;
    }>;
  }>;
  workExperience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  courses: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  interests: Array<{
    name: string;
    icon: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
    technologies: string[];
    link: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  publications?: Array<{
    id: string;
    title: string;
    authors: string;
    journal: string;
    year: string;
    doi: string;
    link: string;
  }>;
  awards?: Array<{
    id: string;
    title: string;
    organization: string;
    year: string;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
  }>;
  volunteerExperience?: Array<{
    id: string;
    organization: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
    hoursPerWeek: string;
  }>;
  references?: Array<{
    id: string;
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
}

interface ResumeEditorV2Props {
  resumeId?: string;
  onSave?: () => void;
  template?: string;
  showPreview?: boolean;
}



export default function ResumeEditorV2({
  resumeId,
}: ResumeEditorV2Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [addSectionPopupOpen, setAddSectionPopupOpen] = useState(false);
  const [editResumeInfoOpen, setEditResumeInfoOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    jobTitle: "",
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });

  const datePickerCallbackRef = React.useRef<((date: string) => void) | null>(null);

  // Export panel state
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [exportPanelFullyClosed, setExportPanelFullyClosed] = useState(true);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const exportPanelFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exportSettings, setExportSettings] = useState({
    template: 'standard',
    pageSize: 'letter',
    fontFamily: 'Times New Roman',
    nameSize: 40,
    sectionHeadersSize: 14,
    subHeadersSize: 10.5,
    bodyTextSize: 11,
    sectionSpacing: 12,
    entrySpacing: 9,
    lineSpacing: 12,
    topBottomMargin: 33,
    sideMargins: 33,
    alignTextLeftRight: false,
    pageWidth: 850,
    pageHeight: 1100,
  });



  // Autosave state


  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  // Prevent hydration mismatch by ensuring popup state is only set on client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exportPanelFallbackTimeoutRef.current) {
        clearTimeout(exportPanelFallbackTimeoutRef.current);
      }
    };
  }, []);





  const [sectionOrder, setSectionOrder] = useState([
    "Personal Info",
    "Professional Summary",
    "Technical Skills",
    "Work Experience",
    "Education",
  ]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "",
    jobTitle: "",
    template: "modern",
    profilePicture: "",
    deletedSections: [],
    content: {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        summary: "",
        website: "",
        linkedin: "",
        github: "",
      },
    },
    strengths: [],
    workExperience: [],
    education: [],
    courses: [],
    interests: [],
    projects: [],
    languages: [],
    publications: [],
    awards: [],
    volunteerExperience: [],
    references: [],
  });



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

  useEffect(() => {
    const loadProfileData = async () => {
      try {

        const response = await fetch('/api/profile');

        if (response.ok) {
          const userData = await response.json();

          setProfileData({
            name: userData.name || session?.user?.name || "",
            email: userData.email || session?.user?.email || "",
            phone: userData.phone || "",
            location: userData.location || "",
            linkedinUrl: userData.linkedinUrl || "",
            githubUrl: userData.githubUrl || "",
            portfolioUrl: userData.portfolioUrl || "",
          });
        } else {
          console.error('Profile response not ok:', response.status, response.statusText);
          // Fallback to session data only
          setProfileData({
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            phone: "",
            location: "",
            linkedinUrl: "",
            githubUrl: "",
            portfolioUrl: "",
          });
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        // Fallback to session data only
        setProfileData({
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          phone: "",
          location: "",
          linkedinUrl: "",
          githubUrl: "",
          portfolioUrl: "",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadProfileData();
    }
  }, [session]);

  // Load existing resume data when editing
  useEffect(() => {
    const loadResumeData = async () => {
      if (!resumeId || !session?.user) return;

      try {
        const response = await fetch(`/api/resumes/${resumeId}`);
        if (response.ok) {
          const resume = await response.json();
          console.log('📥 API Response for resume:', {
            id: resume.id,
            skillCategories: resume.skillCategories,
            content: resume.content,
            hasSkillCategories: !!resume.skillCategories?.length
          });


          setResumeData({
            title: resume.title || "",
            jobTitle: resume.jobTitle || "",
            template: resume.template || "modern",
            profilePicture: resume.profilePicture || "",
            deletedSections: resume.deletedSections || [],
            content: resume.content || {
              personalInfo: {
                name: "",
                email: "",
                phone: "",
                city: "",
                state: "",
                summary: "",
                website: "",
                linkedin: "",
                github: "",
              },
            },
            strengths: (resume.strengths || []).map((strength: Record<string, unknown>) => ({
              ...strength,
              id: String(strength.id || Math.random())
            })),
            skillCategories: resume.skillCategories || [],
            workExperience: (() => {
              // Get work experience from database (has dates but no location)
              const dbWorkExperience = resume.workExperience || [];
              // Get work experience from content (has location but dates might be strings)
              const contentWorkExperience = (resume.content as Record<string, unknown>)?.workExperience as Array<Record<string, unknown>> || [];

              // Merge the data, prioritizing content data for location
              const mergedWorkExperience = dbWorkExperience.map((dbWork: Record<string, unknown>, index: number) => {
                const contentWork = contentWorkExperience[index] || {};

                // Convert Date objects back to "MMM YYYY" format
                const formatDate = (date: Date | string): string => {
                  if (!date) return '';

                  let d: Date;

                  // Handle YYYY-MM-DD format (from API) to avoid timezone issues
                  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    const [year, month, day] = date.split('-').map(Number);
                    d = new Date(year, month - 1, day); // month is 0-indexed
                  } else {
                    d = new Date(date);
                  }

                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${months[d.getMonth()]} ${d.getFullYear()}`;
                };

                return {
                  ...dbWork,
                  ...contentWork, // This will include location from content
                  id: String(dbWork.id || contentWork.id || Math.random()),
                  startDate: formatDate(dbWork.startDate as string | Date),
                  endDate: formatDate(dbWork.endDate as string | Date),
                  bulletPoints: ((dbWork.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
                    ...bullet,
                    id: String(bullet.id || Math.random())
                  }))
                };
              });

              // Deduplicate work experience entries based on company and position
              const seen = new Set();
              const deduplicatedWorkExperience = mergedWorkExperience.filter((work: Record<string, unknown>) => {
                const key = `${work.company}-${work.position}`;
                if (seen.has(key)) {
                  return false; // Remove duplicate
                }
                seen.add(key);
                return true; // Keep first occurrence
              });



              return deduplicatedWorkExperience;
            })(),
            education: (resume.education || []).map((edu: Record<string, unknown>) => {
              // Convert Date objects back to "MMM YYYY" format
              const formatDate = (date: Date | string): string => {
                if (!date) return '';

                let d: Date;

                // Handle YYYY-MM-DD format (from API) to avoid timezone issues
                if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  const [year, month, day] = date.split('-').map(Number);
                  d = new Date(year, month - 1, day); // month is 0-indexed
                } else {
                  d = new Date(date);
                }

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
              };

              return {
                ...edu,
                id: String(edu.id || Math.random()),
                startDate: formatDate(edu.startDate as string | Date),
                endDate: formatDate(edu.endDate as string | Date),
              };
            }),
            courses: resume.courses || [],
            interests: (resume.interests || []).map((interest: Record<string, unknown>) => ({
              ...interest,
              id: String(interest.id || Math.random())
            })),
            projects: (resume.projects || []).map((project: Record<string, unknown>) => {
              // Convert Date objects back to "MMM YYYY" format
              const formatDate = (date: Date | string): string => {
                if (!date) return '';

                let d: Date;

                // Handle YYYY-MM-DD format (from API) to avoid timezone issues
                if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  const [year, month, day] = date.split('-').map(Number);
                  d = new Date(year, month - 1, day); // month is 0-indexed
                } else {
                  d = new Date(date);
                }

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
              };

              return {
                ...project,
                id: String(project.id || Math.random()),
                startDate: formatDate(project.startDate as string | Date),
                endDate: formatDate(project.endDate as string | Date),
                bulletPoints: ((project.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
                  ...bullet,
                  id: String(bullet.id || Math.random())
                }))
              };
            }),
            languages: (resume.languages || []).map((language: Record<string, unknown>) => ({
              ...language,
              id: String(language.id || Math.random())
            })),
            publications: (resume.publications || []).map((publication: Record<string, unknown>) => ({
              ...publication,
              id: String(publication.id || Math.random())
            })),
            awards: (resume.awards || []).map((award: Record<string, unknown>) => ({
              ...award,
              id: String(award.id || Math.random()),
              bulletPoints: ((award.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
                ...bullet,
                id: String(bullet.id || Math.random())
              }))
            })),
            volunteerExperience: (resume.volunteerExperience || []).map((volunteer: Record<string, unknown>) => {
              // Convert Date objects back to "MMM YYYY" format
              const formatDate = (date: Date | string): string => {
                if (!date) return '';

                let d: Date;

                // Handle YYYY-MM-DD format (from API) to avoid timezone issues
                if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  const [year, month, day] = date.split('-').map(Number);
                  d = new Date(year, month - 1, day); // month is 0-indexed
                } else {
                  d = new Date(date);
                }

                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
              };

              return {
                ...volunteer,
                id: String(volunteer.id || Math.random()),
                startDate: formatDate(volunteer.startDate as string | Date),
                endDate: formatDate(volunteer.endDate as string | Date),
                bulletPoints: ((volunteer.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
                  ...bullet,
                  id: String(bullet.id || Math.random())
                }))
              };
            }),
            references: (resume.references || []).map((reference: Record<string, unknown>) => ({
              ...reference,
              id: String(reference.id || Math.random())
            })),
          });

          // Load sectionOrder from database
          if (resume.sectionOrder && Array.isArray(resume.sectionOrder)) {

            // Filter out deleted sections from the loaded section order
            const deletedSections = resume.deletedSections || [];
            const filteredSectionOrder = resume.sectionOrder.filter((section: string) => !deletedSections.includes(section));

            setSectionOrder(filteredSectionOrder);

            // Also set sectionOrder in resumeData
            setResumeData(prev => ({
              ...prev,
              sectionOrder: filteredSectionOrder
            }));
          }

          // Load exportSettings from database
          if (resume.exportSettings) {

            setExportSettings(prev => ({
              ...prev,
              ...resume.exportSettings
            }));
          }
        } else {
          console.error('Failed to load resume:', response.status);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResumeData();
  }, [resumeId, session?.user]);

  // Auto-populate common sections when creating a new resume
  useEffect(() => {
    if (!resumeId && !loading && session?.user) {
      // Auto-add some common sections
      setResumeData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          personalInfo: {
            ...prev.content.personalInfo,
            summary: "Experienced professional with a strong background in [your field]. Skilled in [key skills] with a proven track record of [achievements]. Passionate about [interests] and committed to delivering high-quality results.",
          },
        },
        strengths: [
          { skillName: "Leadership", rating: 8 },
          { skillName: "Problem Solving", rating: 9 },
          { skillName: "Communication", rating: 8 },
        ],
        education: [],
      }));
    }
  }, [resumeId, loading, session?.user]);

  // Note: Section order filtering is now handled during initial load to preserve saved order

  // Debounced autosave function
  const debouncedSave = useDebouncedCallback(async (data: ResumeData, profileData: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  }, currentSectionOrder: string[]) => {
    if (!session?.user) return;






    try {
      // Save profile data first
      if (profileData.name || profileData.email || profileData.phone || profileData.location ||
        profileData.linkedinUrl || profileData.githubUrl || profileData.portfolioUrl) {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileData.name || session.user.name || '',
            email: profileData.email || session.user.email || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            linkedinUrl: profileData.linkedinUrl || '',
            githubUrl: profileData.githubUrl || '',
            portfolioUrl: profileData.portfolioUrl || '',
          }),
        });
      }

      // Filter out data for deleted sections
      const deletedSections = data.deletedSections || [];


      // Sync profileData with resumeData.content.personalInfo
      const updatedContent = {
        ...data.content,
        personalInfo: {
          ...data.content.personalInfo,
          name: profileData.name || data.content.personalInfo.name || '',
          email: profileData.email || data.content.personalInfo.email || '',
          phone: profileData.phone || data.content.personalInfo.phone || '',
          city: profileData.location || data.content.personalInfo.city || '',
          state: data.content.personalInfo.state || '',
          summary: data.content.personalInfo.summary || '',
          website: profileData.portfolioUrl || data.content.personalInfo.website || '',
          linkedin: profileData.linkedinUrl || data.content.personalInfo.linkedin || '',
          github: profileData.githubUrl || data.content.personalInfo.github || '',
        }
      };

      const filteredData = {
        ...data,
        content: updatedContent,
        // Only include data for sections that are not deleted
        strengths: deletedSections.includes('Technical Skills') ? [] : (data.strengths || []),
        skillCategories: deletedSections.includes('Technical Skills') ? [] : (data.skillCategories || []),
        workExperience: deletedSections.includes('Work Experience') ? [] : (data.workExperience || []),
        education: deletedSections.includes('Education') ? [] : (data.education || []),
        courses: deletedSections.includes('Courses') ? [] : (data.courses || []),
        interests: deletedSections.includes('Interests') ? [] : (data.interests || []),
        projects: deletedSections.includes('Projects') ? [] : (data.projects || []),
        languages: deletedSections.includes('Languages') ? [] : (data.languages || []),
        publications: deletedSections.includes('Publications') ? [] : (data.publications || []),
        awards: deletedSections.includes('Awards') ? [] : (data.awards || []),
        volunteerExperience: deletedSections.includes('Volunteer Experience') ? [] : (data.volunteerExperience || []),
        references: deletedSections.includes('References') ? [] : (data.references || []),
      };



      // Save resume data
      const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";
      const method = resumeId ? "PUT" : "POST";

      const savePayload = {
        title: filteredData.title || "Untitled Resume",
        jobTitle: filteredData.jobTitle || "",
        template: filteredData.template || "modern",
        content: filteredData.content,
        profilePicture: filteredData.profilePicture || "",
        deletedSections: filteredData.deletedSections || [],
        sectionOrder: currentSectionOrder, // Add sectionOrder to save payload
        exportSettings: exportSettings, // Add exportSettings to save payload
        strengths: filteredData.strengths || [],
        skillCategories: filteredData.skillCategories || [],
        workExperience: filteredData.workExperience || [],
        education: filteredData.education || [],
        courses: filteredData.courses || [],
        interests: filteredData.interests || [],
        projects: filteredData.projects || [],
        languages: filteredData.languages || [],
        publications: filteredData.publications || [],
        awards: filteredData.awards || [],
        volunteerExperience: filteredData.volunteerExperience || [],
        references: filteredData.references || [],
      };





      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });



      if (response.ok) {
        const savedResume = await response.json();

        // If this was a new resume, update the URL with the new ID
        if (!resumeId && savedResume.id) {
          router.replace(`/resume/new?id=${savedResume.id}`);
        }
      } else {
        console.error('Save failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Save error details:', errorText);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  }, 2000); // 2 second debounce

  // Autosave effect
  useEffect(() => {
    if (loading || !session?.user) return;

    // Don't save if we're still loading initial data
    if (resumeId && !resumeData.title && resumeData.workExperience.length === 0) return;



    debouncedSave(resumeData, profileData, sectionOrder);
  }, [resumeData, profileData, sectionOrder, exportSettings, loading, session?.user, resumeId, debouncedSave]);

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



  if (loading || !session?.user) {
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

  // Export panel handlers
  const handleExportClick = () => {
    setExportPanelOpen(true);
    setExportPanelFullyClosed(false);
  };

  const handleExportClose = () => {
    setExportPanelOpen(false);
    // Set a fallback timeout in case onTransitionEnd doesn't fire
    exportPanelFallbackTimeoutRef.current = setTimeout(() => {
      setExportPanelFullyClosed(true);
    }, 300); // 300ms should be enough for the transition
  };

  const handleDownloadPDF = async () => {
    if (!resumeId) {
      console.error('No resume ID available for PDF download');
      return;
    }

    try {
      console.log('🎯 Starting PDF download with export settings for resume:', resumeId);
      console.log('🎯 Export settings:', exportSettings);

      // Show loading state
      setPdfDownloading(true);
      setSuccess('');
      setError('');

      // Use the same export settings for PDF as preview - NO SCALING
      const pdfExportSettings = {
        ...exportSettings
      };

      console.log('🎯 PDF export settings (scaled):', pdfExportSettings);

      // Call the unified PDF generation API
      const response = await fetch(`/api/resumes/${resumeId}/pdf-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportSettings: pdfExportSettings,
          generatePdf: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🎯 PDF generation error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.title || 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setSuccess('PDF downloaded successfully!');

      // Close the export panel
      setExportPanelOpen(false);

      console.log('🎯 PDF download completed successfully');

    } catch (error) {
      console.error('🎯 PDF download error:', error);
      setError(error instanceof Error ? error.message : 'Failed to download PDF');
    } finally {
      setPdfDownloading(false);
    }
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
      setLoading(true);
      setDeleteConfirmOpen(false);

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Resume deleted successfully");
        // Redirect to resume page after a short delay
        setTimeout(() => {
          router.push("/resume");
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete resume");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("An error occurred while deleting the resume");
    } finally {
      setLoading(false);
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
      {exportPanelFullyClosed && !exportPanelOpen && (
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
      )}

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
              setAddSectionPopupOpen(false);
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
      {isClient && addSectionPopupOpen && layoutModalOpen && (
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
                    await debouncedSave(updatedResumeData, profileData, sectionOrder);
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
        resumeData={resumeData}
        onDownloadPDF={handleDownloadPDF}
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

