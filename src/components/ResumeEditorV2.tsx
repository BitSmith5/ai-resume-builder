"use client";

// ResumeEditorV2 - Enhanced with section deletion persistence
// Features:
// - Sections can be deleted and this state is persisted to the database
// - Deleted sections are remembered and won't show up when the page is reloaded
// - Users can re-add deleted sections through the "Add Section" button
// - Section order and deletion state are saved automatically

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Drawer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  FormControlLabel,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Star as StarIcon,
  List as ListIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  DragIndicator as DragIndicatorIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";
import { ToggleButton } from "@mui/material";


import { DragDropContext, Droppable, Draggable, DropResult, DragStart, DragUpdate } from '@hello-pangea/dnd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDebouncedCallback } from 'use-debounce';
import { COLORS } from '../lib/colorSystem';
import { ResumeHeader } from './ResumeEditor/components/ResumeHeader';
import { PersonalInfoSection } from './ResumeEditor/components/sections/PersonalInfoSection';
import { ProfessionalSummarySection } from "./ResumeEditor/components/sections/ProfessionalSummarySection";
import { TechnicalSkillsSection } from "./ResumeEditor/components/sections/TechnicalSkillsSection";
import { WorkExperienceSection } from "./ResumeEditor/components/sections/WorkExperienceSection";
import { EducationSection } from "./ResumeEditor/components/sections/EducationSection";

// Phone number formatting function
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Limit to 10 digits
  const trimmed = phoneNumber.slice(0, 10);

  // Format as (XXX) XXX-XXXX
  if (trimmed.length === 0) return "";
  if (trimmed.length <= 3) return `(${trimmed}`;
  if (trimmed.length <= 6)
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
};

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
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
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

  // PDF Preview state
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');

  // Cache for preview results to avoid unnecessary API calls
  const previewCache = useRef<Map<string, string>>(new Map());

  // Create a cache key from export settings
  const getCacheKey = useCallback((): string => {
    return JSON.stringify(exportSettings);
  }, [exportSettings]);

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



  // Load PDF preview when export panel opens or settings change
  useEffect(() => {
    if (exportPanelOpen && resumeId) {
      // Create AbortController for request cancellation
      const abortController = new AbortController();

      // Check cache first
      const cacheKey = getCacheKey();
      const cachedHtml = previewCache.current.get(cacheKey);

      if (cachedHtml) {
        setPreviewHtml(cachedHtml);
        setPreviewLoading(false);
        setPreviewError('');
        return;
      }

      // Debounce the API call to avoid excessive requests
      const timeoutId = setTimeout(async () => {
        try {
          setPreviewLoading(true);
          setPreviewError('');
          const response = await fetch(`/api/resumes/${resumeId}/pdf-html`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              exportSettings: exportSettings
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error('Failed to load preview');
          }

          const htmlContent = await response.text();

          // Cache the result
          previewCache.current.set(cacheKey, htmlContent);

          // Limit cache size to prevent memory issues
          if (previewCache.current.size > 20) {
            const firstKey = previewCache.current.keys().next().value;
            if (firstKey) {
              previewCache.current.delete(firstKey);
            }
          }

          setPreviewHtml(htmlContent);
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            // Request was cancelled, don't show error
            return;
          }
          console.error('Error loading preview:', err);
          setPreviewError('Failed to load preview');
        } finally {
          setPreviewLoading(false);
        }
      }, 150); // Reduced to 150ms for faster response

      return () => {
        clearTimeout(timeoutId);
        abortController.abort(); // Cancel any pending request
      };
    }
  }, [exportPanelOpen, resumeId, getCacheKey]);

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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const SECTION_COMPONENTS: Record<string, (resumeData: ResumeData, setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>) => JSX.Element> = {
    "Personal Info": () => (
      <PersonalInfoSection
        profileData={profileData}
        setProfileData={setProfileData}
      />
    ),
    "Professional Summary": (resumeData, setResumeData) => (
      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Technical Skills": (resumeData, setResumeData) => (
      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Work Experience": (resumeData, setResumeData) => (
      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Education": (resumeData, setResumeData) => (
      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
    ),
    "Courses": (resumeData, setResumeData) => {
      // Initialize courses if not exists
      const courses = resumeData.courses || [
        {
          title: "Advanced React Development",
          provider: "Udemy",
          link: "https://udemy.com/course/advanced-react",
        }
      ];

      const addCourse = () => {
        const newCourse = {
          title: "",
          provider: "",
          link: "",
        };
        setResumeData(prev => ({
          ...prev,
          courses: [...(prev.courses || courses), newCourse]
        }));
      };

      const updateCourse = (index: number, updates: Partial<{
        title: string;
        provider: string;
        link?: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          courses: (prev.courses || courses).map((course, i) =>
            i === index ? { ...course, ...updates } : course
          )
        }));
      };

      const deleteCourse = (index: number) => {
        setResumeData(prev => ({
          ...prev,
          courses: (prev.courses || courses).filter((_, i) => i !== index)
        }));
      };

      const handleCourseDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newCourses = Array.from((resumeData.courses || courses));
        const [removed] = newCourses.splice(result.source.index, 1);
        newCourses.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, courses: newCourses }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Courses & Certifications
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Courses');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleCourseDragEnd}>
            <Droppable droppableId="courses" type="course">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.courses || courses).length === 0 ? 10 : 100 }}>
                  {(resumeData.courses || courses).map((course, courseIndex) => (
                    <React.Fragment key={courseIndex}>
                      <Draggable draggableId={`course-${courseIndex}`} index={courseIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Course Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={course.title || ''}
                                onChange={(e) => updateCourse(courseIndex, { title: e.target.value })}
                                placeholder="Course Title..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (course.title && course.title.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteCourse(courseIndex)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Provider and Link */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={course.provider || ''}
                                onChange={(e) => updateCourse(courseIndex, { provider: e.target.value })}
                                placeholder="Provider (e.g., Udemy, Coursera)"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (course.provider && course.provider.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            <Box sx={{ pl: 3 }}>
                              <TextField
                                size="small"
                                value={course.link || ''}
                                onChange={(e) => updateCourse(courseIndex, { link: e.target.value })}
                                placeholder="Course Link (optional)"
                                sx={{
                                  width: 300,
                                  height: 28,
                                  backgroundColor: (course.link && course.link.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Course button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addCourse}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Course
            </Button>
          </Box>
        </Box>
      );
    },
    "Interests": (resumeData, setResumeData) => {
      // Available icons for interests
      const AVAILABLE_ICONS = [
        { value: '🎵', label: 'Music' },
        { value: '📚', label: 'Reading' },
        { value: '🏃‍♂️', label: 'Running' },
        { value: '🏋️‍♂️', label: 'Gym' },
        { value: '🎨', label: 'Art' },
        { value: '📷', label: 'Photography' },
        { value: '🎮', label: 'Gaming' },
        { value: '🍳', label: 'Cooking' },
        { value: '✈️', label: 'Travel' },
        { value: '🎬', label: 'Movies' },
        { value: '🎭', label: 'Theater' },
        { value: '🏊‍♂️', label: 'Swimming' },
        { value: '🚴‍♂️', label: 'Cycling' },
        { value: '🎯', label: 'Target Shooting' },
        { value: '🧘‍♀️', label: 'Yoga' },
        { value: '🎲', label: 'Board Games' },
        { value: '🎸', label: 'Guitar' },
        { value: '🎹', label: 'Piano' },
        { value: '🎤', label: 'Singing' },
        { value: '💻', label: 'Programming' },
        { value: '🔬', label: 'Science' },
        { value: '🌱', label: 'Gardening' },
        { value: '🐕', label: 'Dogs' },
        { value: '🐱', label: 'Cats' },
        { value: '⚽', label: 'Soccer' },
        { value: '🏀', label: 'Basketball' },
        { value: '🏈', label: 'Football' },
        { value: '⚾', label: 'Baseball' },
        { value: '🎳', label: 'Bowling' },
        { value: '♟️', label: 'Chess' },
        { value: '✏️', label: 'Drawing' },
        { value: '📝', label: 'Writing' },
        { value: '📊', label: 'Data Analysis' },
        { value: '🔍', label: 'Research' },
        { value: '🌍', label: 'Languages' },
        { value: '📈', label: 'Investing' },
        { value: '🏛️', label: 'History' },
        { value: '🌌', label: 'Astronomy' },
        { value: '🧬', label: 'Biology' },
        { value: '⚗️', label: 'Chemistry' },
        { value: '⚡', label: 'Physics' },
        { value: '🧮', label: 'Mathematics' }
      ];

      // Initialize interests if not exists
      const interests = resumeData.interests || [
        {
          name: "Programming",
          icon: "💻",
        }
      ];

      const addInterest = () => {
        const newInterest = {
          name: "",
          icon: "🎵",
        };
        setResumeData(prev => ({
          ...prev,
          interests: [...(prev.interests || interests), newInterest]
        }));
      };

      const updateInterest = (index: number, updates: Partial<{
        name: string;
        icon: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          interests: (prev.interests || interests).map((interest, i) =>
            i === index ? { ...interest, ...updates } : interest
          )
        }));
      };

      const deleteInterest = (index: number) => {
        setResumeData(prev => ({
          ...prev,
          interests: (prev.interests || interests).filter((_, i) => i !== index)
        }));
      };

      const handleInterestDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newInterests = Array.from((resumeData.interests || interests));
        const [removed] = newInterests.splice(result.source.index, 1);
        newInterests.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, interests: newInterests }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Interests & Hobbies
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Interests');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleInterestDragEnd}>
            <Droppable droppableId="interests" type="interest">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.interests || interests).length === 0 ? 10 : 100 }}>
                  {(resumeData.interests || interests).map((interest, interestIndex) => (
                    <React.Fragment key={interestIndex}>
                      <Draggable draggableId={`interest-${interestIndex}`} index={interestIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Interest Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={interest.name || ''}
                                onChange={(e) => updateInterest(interestIndex, { name: e.target.value })}
                                placeholder="Interest Name..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (interest.name && interest.name.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteInterest(interestIndex)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Icon Selection */}
                            <Box sx={{ pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Select Icon:
                              </Typography>
                              <FormControl size="small" sx={{ minWidth: 200 }}>
                                <Select
                                  value={interest.icon}
                                  onChange={(e) => updateInterest(interestIndex, { icon: e.target.value })}
                                  displayEmpty
                                  sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#e0e0e0',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: COLORS.primary,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: COLORS.primary,
                                    },
                                  }}
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        '& .MuiMenuItem-root.Mui-selected': {
                                          backgroundColor: COLORS.selectedBackground,
                                          color: COLORS.primary,
                                          '&:hover': {
                                            backgroundColor: COLORS.selectedBackground,
                                          },
                                        },
                                        '& .MuiMenuItem-root.Mui-selected.Mui-focusVisible': {
                                          backgroundColor: COLORS.selectedBackground,
                                        },
                                        // Custom scrollbar styling - transparent track, visible handle
                                        '&::-webkit-scrollbar': {
                                          width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                          background: 'transparent',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                          background: '#c1c1c1',
                                          borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                          background: '#a8a8a8',
                                        },
                                        // Firefox scrollbar styling
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#c1c1c1 transparent',
                                      },
                                    },
                                  }}
                                >
                                  {AVAILABLE_ICONS.map((iconOption) => (
                                    <MenuItem key={iconOption.value} value={iconOption.value}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span style={{ fontSize: '1.2rem' }}>{iconOption.value}</span>
                                        <span>{iconOption.label}</span>
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Interest button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addInterest}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Interest
            </Button>
          </Box>
        </Box>
      );
    },
    "Projects": (resumeData, setResumeData) => {
      // Initialize projects if not exists
      const projects = resumeData.projects || [
        {
          id: `project-${Date.now()}`,
          title: "AI Resume Builder",
          bulletPoints: [
            {
              id: `bullet-${Date.now()}-${Math.random()}`,
              description: "A modern web application for creating professional resumes with AI assistance"
            }
          ],
          technologies: ["React", "TypeScript", "Node.js"],
          link: "https://github.com/username/ai-resume-builder",
          startDate: "Jan 2024",
          endDate: "Mar 2024",
          current: false,
        }
      ];

      const addProject = () => {
        const newProject = {
          id: `project-${Date.now()}`,
          title: "",
          bulletPoints: [],
          technologies: [],
          link: "",
          startDate: "",
          endDate: "",
          current: false,
        };
        setResumeData(prev => ({
          ...prev,
          projects: [...(prev.projects || projects), newProject]
        }));
      };

      const updateProject = (projectId: string, updates: Partial<{
        title: string;
        bulletPoints: Array<{ id: string; description: string }>;
        technologies: string[];
        link: string;
        startDate: string;
        endDate: string;
        current: boolean;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          projects: (prev.projects || projects).map(project =>
            project.id === projectId ? { ...project, ...updates } : project
          )
        }));
      };

      const deleteProject = (projectId: string) => {
        setResumeData(prev => ({
          ...prev,
          projects: (prev.projects || projects).filter(project => project.id !== projectId)
        }));
      };

      const addTechnology = (projectId: string, technology: string) => {
        if (!technology.trim()) return;
        const project = (resumeData.projects || projects).find(p => p.id === projectId);
        if (!project) return;

        const newTechnologies = [...project.technologies, technology.trim()];
        updateProject(projectId, { technologies: newTechnologies });
      };

      const removeTechnology = (projectId: string, technologyIndex: number) => {
        const project = (resumeData.projects || projects).find(p => p.id === projectId);
        if (!project) return;

        const newTechnologies = project.technologies.filter((_, index) => index !== technologyIndex);
        updateProject(projectId, { technologies: newTechnologies });
      };

      const handleTechnologyDragEnd = (event: DragEndEvent, projectId: string) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          const project = (resumeData.projects || projects).find(p => p.id === projectId);
          if (!project) return;

          const oldIndex = project.technologies.findIndex((_, index) => `${projectId}-tech-${index}` === active.id);
          const newIndex = project.technologies.findIndex((_, index) => `${projectId}-tech-${index}` === over?.id);

          if (oldIndex !== -1 && newIndex !== -1) {
            const newTechnologies = arrayMove(project.technologies, oldIndex, newIndex);
            updateProject(projectId, { technologies: newTechnologies });
          }
        }
      };

      const SortableTechnology = ({ technology, index, projectId, onRemove }: {
        technology: string;
        index: number;
        projectId: string;
        onRemove: (projectId: string, index: number) => void;
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: `${projectId}-tech-${index}` });

        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        };

        return (
          <Box
            ref={setNodeRef}
            style={style}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: isDragging ? '#f5f5f5' : '#f5f5f5',
              borderRadius: 2,
              px: 0.5,
              py: 1,
              border: isDragging ? '2px solid #e0e0e0' : '1px solid #e0e0e0',
              margin: 0.5,
              flexShrink: 0,
              transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'none',
              transition: 'all 0.2s ease',
              boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              zIndex: isDragging ? 1000 : 'auto',
              cursor: 'grab',
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'scale(1.02)',
              },
            }}
          >
            {/* Drag handle area */}
            <Box
              {...attributes}
              {...listeners}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}
            >
              <DragIndicatorIcon sx={{ fontSize: 20, mr: 0.5, color: '#999' }} />
            </Box>

            {/* Technology name */}
            <Typography variant="body2" sx={{ mr: 1, flex: 1, fontSize: '0.8rem' }}>
              {technology}
            </Typography>

            {/* Delete button - separate from drag area */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(projectId, index);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                sx={{ p: 0.5, backgroundColor: 'white', borderRadius: "50%", mr: 0.5 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        );
      };

      const addProjectBulletPoint = (projectId: string, description: string = "") => {
        const newBulletPoint = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: description
        };
        const project = (resumeData.projects || projects).find(p => p.id === projectId);
        if (!project) return;

        const newBulletPoints = [...(project.bulletPoints || []), newBulletPoint];
        updateProject(projectId, { bulletPoints: newBulletPoints });
        setEditingBulletId(newBulletPoint.id);
      };

      const updateProjectBulletPoint = (projectId: string, bulletId: string, description: string) => {
        const project = (resumeData.projects || projects).find(p => p.id === projectId);
        if (!project) return;

        const newBulletPoints = (project.bulletPoints || []).map(bullet =>
          bullet.id === bulletId ? { ...bullet, description } : bullet
        );
        updateProject(projectId, { bulletPoints: newBulletPoints });
      };

      const deleteProjectBulletPoint = (projectId: string, bulletId: string) => {
        const project = (resumeData.projects || projects).find(p => p.id === projectId);
        if (!project) return;

        const newBulletPoints = (project.bulletPoints || []).filter(bullet => bullet.id !== bulletId);
        updateProject(projectId, { bulletPoints: newBulletPoints });
      };

      const SortableProjectBulletPoint = ({ bullet, projectId, onUpdate }: {
        bullet: { id: string; description: string };
        projectId: string;
        onUpdate: (projectId: string, bulletId: string, description: string) => void;
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: bullet.id });

        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        };

        const isEditing = editingBulletId === bullet.id;
        const isPlaceholder = bullet.description === "Bullet point...";

        return (
          <Box
            ref={setNodeRef}
            style={style}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '80%',
            }}
          >
            <Box
              {...attributes}
              {...listeners}
              sx={{
                mr: 0.25,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                cursor: 'grab'
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 0.5,
                flex: 1,
                cursor: isEditing ? 'text' : 'default',
                backgroundColor: isEditing ? '#f5f5f5' : 'transparent',
                borderRadius: isEditing ? 2 : 0,
                '&:hover': {
                  backgroundColor: isEditing ? '#f5f5f5' : '#f5f5f5',
                  borderRadius: 2,
                  '& .delete-button': {
                    opacity: 1,
                  },
                },
              }}
            >
              {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={bullet.description}
                      placeholder="Enter bullet point description..."
                      onChange={(e) => onUpdate(projectId, bullet.id, e.target.value)}
                      onBlur={() => {
                        if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                          setEditingBulletId(null);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                            setEditingBulletId(null);
                          }
                        }
                      }}
                      variant="standard"
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-root': {
                          alignItems: 'center',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          paddingLeft: '0',
                          paddingTop: '0',
                          paddingBottom: '0',
                        },
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:after': { borderBottom: 'none' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      autoFocus
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Typography
                    component="span"
                    onClick={() => setEditingBulletId(bullet.id)}
                    sx={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: isPlaceholder ? '#999' : 'black',
                      flex: 1,
                      cursor: 'text',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        '& .delete-button': {
                          opacity: 1,
                        },
                      }
                    }}
                  >
                    {bullet.description}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => deleteProjectBulletPoint(projectId, bullet.id)}
                    className="delete-button"
                    sx={{
                      p: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      ml: 0.5,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        );
      };

      const handleProjectDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newProjects = Array.from((resumeData.projects || projects));
        const [removed] = newProjects.splice(result.source.index, 1);
        newProjects.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, projects: newProjects }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Projects
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Projects');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleProjectDragEnd}>
            <Droppable droppableId="projects" type="project">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.projects || projects).length === 0 ? 10 : 100 }}>
                  {(resumeData.projects || projects).map((project, projectIndex) => (
                    <React.Fragment key={project.id}>
                      <Draggable draggableId={project.id} index={projectIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Project Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={project.title || ''}
                                onChange={(e) => updateProject(project.id, { title: e.target.value })}
                                placeholder="Project Title..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (project.title && project.title.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteProject(project.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Project Bullet Points */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Key Points:
                              </Typography>
                              <DndContext
                                onDragEnd={(event) => {
                                  const { active, over } = event;
                                  if (active && over && active.id !== over.id) {
                                    const oldIndex = project.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                    const newIndex = project.bulletPoints.findIndex(bullet => bullet.id === over.id);

                                    const newBulletPoints = arrayMove(project.bulletPoints, oldIndex, newIndex);
                                    updateProject(project.id, { bulletPoints: newBulletPoints });
                                  }
                                }}
                              >
                                <SortableContext items={(project.bulletPoints || []).map(bullet => bullet.id)}>
                                  <Box sx={{ mb: 1 }}>
                                    {(project.bulletPoints || []).map((bullet) => (
                                      <SortableProjectBulletPoint
                                        key={bullet.id}
                                        bullet={bullet}
                                        projectId={project.id}
                                        onUpdate={updateProjectBulletPoint}
                                      />
                                    ))}
                                  </Box>
                                </SortableContext>
                              </DndContext>
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addProjectBulletPoint(project.id)}
                                variant="outlined"
                                size="small"
                                sx={{
                                  textTransform: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  borderRadius: 2,
                                  border: '1px solid #e0e0e0',
                                  color: 'black',
                                  minWidth: 180,
                                  mt: 1,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5'
                                  }
                                }}
                              >
                                Bullet Points
                              </Button>
                            </Box>

                            {/* Technologies */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Technologies:
                              </Typography>
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => handleTechnologyDragEnd(event, project.id)}
                              >
                                <SortableContext
                                  items={project.technologies.map((_, index) => `${project.id}-tech-${index}`)}
                                  strategy={horizontalListSortingStrategy}
                                >
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                    {project.technologies.map((tech, techIndex) => (
                                      <SortableTechnology
                                        key={`${project.id}-tech-${techIndex}`}
                                        technology={tech}
                                        index={techIndex}
                                        projectId={project.id}
                                        onRemove={removeTechnology}
                                      />
                                    ))}
                                  </Box>
                                </SortableContext>
                              </DndContext>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: 300 }}>
                                <TextField
                                  size="small"
                                  placeholder="Add technology..."
                                  sx={{
                                    flex: 1,
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': { border: 'none' },
                                      '&:hover fieldset': { border: 'none' },
                                      '&.Mui-focused fieldset': { border: 'none' },
                                    },
                                  }}
                                  onKeyPress={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (e.key === 'Enter' && target.value.trim()) {
                                      addTechnology(project.id, target.value);
                                      target.value = '';
                                    }
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      addTechnology(project.id, input.value);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            </Box>

                            {/* Project Link */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={project.link || ''}
                                onChange={(e) => updateProject(project.id, { link: e.target.value })}
                                placeholder="Project Link (optional)"
                                sx={{
                                  width: 300,
                                  height: 28,
                                  backgroundColor: (project.link && project.link.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Dates */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={project.startDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateProject(project.id, { startDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="Start Date"
                                sx={{
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (project.startDate && project.startDate.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    cursor: 'pointer',
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                              <TrendingFlatIcon sx={{
                                alignSelf: 'center',
                                color: '#666',
                                fontSize: '1.2rem'
                              }} />
                              <TextField
                                size="small"
                                value={project.endDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateProject(project.id, { endDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="End Date"
                                sx={{
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (project.endDate && project.endDate.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    cursor: 'pointer',
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Project button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addProject}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Project
            </Button>
          </Box>
        </Box>
      );
    },
    "Languages": (resumeData, setResumeData) => {
      // Initialize languages if not exists
      const languages = resumeData.languages || [
        {
          id: `language-${Date.now()}`,
          name: "English",
          proficiency: "Native",
        }
      ];

      const addLanguage = () => {
        const newLanguage = {
          id: `language-${Date.now()}`,
          name: "",
          proficiency: "Native",
        };
        setResumeData(prev => ({
          ...prev,
          languages: [...(prev.languages || languages), newLanguage]
        }));
      };

      const updateLanguage = (languageId: string, updates: Partial<{
        name: string;
        proficiency: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          languages: (prev.languages || languages).map(language =>
            language.id === languageId ? { ...language, ...updates } : language
          )
        }));
      };

      const deleteLanguage = (languageId: string) => {
        setResumeData(prev => ({
          ...prev,
          languages: (prev.languages || languages).filter(language => language.id !== languageId)
        }));
      };

      const handleLanguageDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newLanguages = Array.from((resumeData.languages || languages));
        const [removed] = newLanguages.splice(result.source.index, 1);
        newLanguages.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, languages: newLanguages }));
      };

      const proficiencyLevels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Languages
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Languages');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleLanguageDragEnd}>
            <Droppable droppableId="languages" type="language">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.languages || languages).length === 0 ? 10 : 100 }}>
                  {(resumeData.languages || languages).map((language, languageIndex) => (
                    <React.Fragment key={language.id}>
                      <Draggable draggableId={language.id} index={languageIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Language Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={language.name || ''}
                                onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                                placeholder="Language..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (language.name && language.name.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteLanguage(language.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Proficiency Level */}
                            <Box sx={{ pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Proficiency Level:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {proficiencyLevels.map((level) => (
                                  <Box
                                    key={level}
                                    onClick={() => updateLanguage(language.id, { proficiency: level })}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      px: 2,
                                      py: 0.5,
                                      borderRadius: 2,
                                      cursor: 'pointer',
                                      border: language.proficiency === level ? `2px solid ${COLORS.primary}` : '1px solid #e0e0e0',
                                      backgroundColor: language.proficiency === level ? COLORS.selectedBackground : 'white',
                                      fontSize: '0.875rem',
                                      fontWeight: language.proficiency === level ? 600 : 400,
                                      '&:hover': {
                                        backgroundColor: '#f0fdf4',
                                        border: `2px solid ${COLORS.primary}`,
                                      },
                                    }}
                                  >
                                    {level}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Language button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addLanguage}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Language
            </Button>
          </Box>
        </Box>
      );
    },
    "Publications": (resumeData, setResumeData) => {
      // Initialize publications if not exists
      const publications = resumeData.publications || [
        {
          id: `publication-${Date.now()}`,
          title: "Machine Learning in Modern Web Applications",
          authors: "John Doe, Jane Smith",
          journal: "Journal of Computer Science",
          year: "2024",
          doi: "10.1000/example.doi",
          link: "https://example.com/paper",
        }
      ];

      const addPublication = () => {
        const newPublication = {
          id: `publication-${Date.now()}`,
          title: "",
          authors: "",
          journal: "",
          year: "",
          doi: "",
          link: "",
        };
        setResumeData(prev => ({
          ...prev,
          publications: [...(prev.publications || publications), newPublication]
        }));
      };

      const updatePublication = (publicationId: string, updates: Partial<{
        title: string;
        authors: string;
        journal: string;
        year: string;
        doi: string;
        link: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          publications: (prev.publications || publications).map(publication =>
            publication.id === publicationId ? { ...publication, ...updates } : publication
          )
        }));
      };

      const deletePublication = (publicationId: string) => {
        setResumeData(prev => ({
          ...prev,
          publications: (prev.publications || publications).filter(publication => publication.id !== publicationId)
        }));
      };

      const handlePublicationDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newPublications = Array.from((resumeData.publications || publications));
        const [removed] = newPublications.splice(result.source.index, 1);
        newPublications.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, publications: newPublications }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Publications
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Publications');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handlePublicationDragEnd}>
            <Droppable droppableId="publications" type="publication">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.publications || publications).length === 0 ? 10 : 100 }}>
                  {(resumeData.publications || publications).map((publication, publicationIndex) => (
                    <React.Fragment key={publication.id}>
                      <Draggable draggableId={publication.id} index={publicationIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Publication Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={publication.title || ''}
                                onChange={(e) => updatePublication(publication.id, { title: e.target.value })}
                                placeholder="Publication Title..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (publication.title && publication.title.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deletePublication(publication.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Authors */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={publication.authors || ''}
                                onChange={(e) => updatePublication(publication.id, { authors: e.target.value })}
                                placeholder="Authors..."
                                sx={{
                                  width: 300,
                                  height: 28,
                                  backgroundColor: (publication.authors && publication.authors.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Journal and Year */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={publication.journal || ''}
                                onChange={(e) => updatePublication(publication.id, { journal: e.target.value })}
                                placeholder="Journal/Conference"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (publication.journal && publication.journal.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={publication.year || ''}
                                onChange={(e) => updatePublication(publication.id, { year: e.target.value })}
                                placeholder="Year"
                                sx={{
                                  width: 80,
                                  height: 28,
                                  backgroundColor: (publication.year && publication.year.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* DOI and Link */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={publication.doi || ''}
                                onChange={(e) => updatePublication(publication.id, { doi: e.target.value })}
                                placeholder="DOI (optional)"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (publication.doi && publication.doi.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={publication.link || ''}
                                onChange={(e) => updatePublication(publication.id, { link: e.target.value })}
                                placeholder="Link (optional)"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (publication.link && publication.link.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Publication button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addPublication}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Publication
            </Button>
          </Box>
        </Box>
      );
    },
    "Awards": (resumeData, setResumeData) => {
      // Initialize awards if not exists
      const awards = resumeData.awards || [
        {
          id: `award-${Date.now()}`,
          title: "Best Student Award",
          organization: "University of Technology",
          year: "2024",
          bulletPoints: [
            {
              id: `bullet-${Date.now()}-${Math.random()}`,
              description: "Recognized for outstanding academic performance and leadership"
            }
          ],
        }
      ];

      const addAward = () => {
        const newAward = {
          id: `award-${Date.now()}`,
          title: "",
          organization: "",
          year: "",
          bulletPoints: [],
        };
        setResumeData(prev => ({
          ...prev,
          awards: [...(prev.awards || awards), newAward]
        }));
      };

      const updateAward = (awardId: string, updates: Partial<{
        title: string;
        organization: string;
        year: string;
        bulletPoints: Array<{ id: string; description: string }>;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          awards: (prev.awards || awards).map(award =>
            award.id === awardId ? { ...award, ...updates } : award
          )
        }));
      };

      const deleteAward = (awardId: string) => {
        setResumeData(prev => ({
          ...prev,
          awards: (prev.awards || awards).filter(award => award.id !== awardId)
        }));
      };

      const addAwardBulletPoint = (awardId: string, description: string = "") => {
        const newBulletPoint = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: description
        };
        const award = (resumeData.awards || awards).find(a => a.id === awardId);
        if (!award) return;

        const newBulletPoints = [...(award.bulletPoints || []), newBulletPoint];
        updateAward(awardId, { bulletPoints: newBulletPoints });
        setEditingBulletId(newBulletPoint.id);
      };

      const updateAwardBulletPoint = (awardId: string, bulletId: string, description: string) => {
        const award = (resumeData.awards || awards).find(a => a.id === awardId);
        if (!award) return;

        const newBulletPoints = (award.bulletPoints || []).map(bullet =>
          bullet.id === bulletId ? { ...bullet, description } : bullet
        );
        updateAward(awardId, { bulletPoints: newBulletPoints });
      };

      const deleteAwardBulletPoint = (awardId: string, bulletId: string) => {
        const award = (resumeData.awards || awards).find(a => a.id === awardId);
        if (!award) return;

        const newBulletPoints = (award.bulletPoints || []).filter(bullet => bullet.id !== bulletId);
        updateAward(awardId, { bulletPoints: newBulletPoints });
      };

      const SortableAwardBulletPoint = ({ bullet, awardId, onUpdate }: {
        bullet: { id: string; description: string };
        awardId: string;
        onUpdate: (awardId: string, bulletId: string, description: string) => void;
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: bullet.id });

        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        };

        const isEditing = editingBulletId === bullet.id;
        const isPlaceholder = bullet.description === "Bullet point...";

        return (
          <Box
            ref={setNodeRef}
            style={style}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '80%',
            }}
          >
            <Box
              {...attributes}
              {...listeners}
              sx={{
                mr: 0.25,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                cursor: 'grab'
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 0.5,
                flex: 1,
                cursor: isEditing ? 'text' : 'default',
                backgroundColor: isEditing ? '#f5f5f5' : 'transparent',
                borderRadius: isEditing ? 2 : 0,
                '&:hover': {
                  backgroundColor: isEditing ? '#f5f5f5' : '#f5f5f5',
                  borderRadius: 2,
                  '& .delete-button': {
                    opacity: 1,
                  },
                },
              }}
            >
              {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={bullet.description}
                      placeholder="Enter bullet point description..."
                      onChange={(e) => onUpdate(awardId, bullet.id, e.target.value)}
                      onBlur={() => {
                        if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                          setEditingBulletId(null);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                            setEditingBulletId(null);
                          }
                        }
                      }}
                      variant="standard"
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-root': {
                          alignItems: 'center',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          paddingLeft: '0',
                          paddingTop: '0',
                          paddingBottom: '0',
                        },
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:after': { borderBottom: 'none' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      autoFocus
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Typography
                    component="span"
                    onClick={() => setEditingBulletId(bullet.id)}
                    sx={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: isPlaceholder ? '#999' : 'black',
                      flex: 1,
                      cursor: 'text',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        '& .delete-button': {
                          opacity: 1,
                        },
                      }
                    }}
                  >
                    {bullet.description}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => deleteAwardBulletPoint(awardId, bullet.id)}
                    className="delete-button"
                    sx={{
                      p: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      ml: 0.5,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        );
      };

      const handleAwardDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newAwards = Array.from((resumeData.awards || awards));
        const [removed] = newAwards.splice(result.source.index, 1);
        newAwards.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, awards: newAwards }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Awards & Recognition
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Awards');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleAwardDragEnd}>
            <Droppable droppableId="awards" type="award">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.awards || awards).length === 0 ? 10 : 100 }}>
                  {(resumeData.awards || awards).map((award, awardIndex) => (
                    <React.Fragment key={award.id}>
                      <Draggable draggableId={award.id} index={awardIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Award Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={award.title || ''}
                                onChange={(e) => updateAward(award.id, { title: e.target.value })}
                                placeholder="Award Title..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (award.title && award.title.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteAward(award.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Organization and Year */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={award.organization || ''}
                                onChange={(e) => updateAward(award.id, { organization: e.target.value })}
                                placeholder="Organization"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (award.organization && award.organization.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={award.year || ''}
                                onChange={(e) => updateAward(award.id, { year: e.target.value })}
                                placeholder="Year"
                                sx={{
                                  width: 80,
                                  height: 28,
                                  backgroundColor: (award.year && award.year.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Award Bullet Points */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Key Points:
                              </Typography>
                              <DndContext
                                onDragEnd={(event) => {
                                  const { active, over } = event;
                                  if (active && over && active.id !== over.id) {
                                    const oldIndex = award.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                    const newIndex = award.bulletPoints.findIndex(bullet => bullet.id === over.id);

                                    const newBulletPoints = arrayMove(award.bulletPoints, oldIndex, newIndex);
                                    updateAward(award.id, { bulletPoints: newBulletPoints });
                                  }
                                }}
                              >
                                <SortableContext items={(award.bulletPoints || []).map(bullet => bullet.id)}>
                                  <Box sx={{ mb: 1 }}>
                                    {(award.bulletPoints || []).map((bullet) => (
                                      <SortableAwardBulletPoint
                                        key={bullet.id}
                                        bullet={bullet}
                                        awardId={award.id}
                                        onUpdate={updateAwardBulletPoint}
                                      />
                                    ))}
                                  </Box>
                                </SortableContext>
                              </DndContext>
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addAwardBulletPoint(award.id)}
                                variant="outlined"
                                size="small"
                                sx={{
                                  textTransform: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  borderRadius: 2,
                                  border: '1px solid #e0e0e0',
                                  color: 'black',
                                  minWidth: 180,
                                  mt: 1,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5'
                                  }
                                }}
                              >
                                Bullet Points
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Award button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addAward}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Award
            </Button>
          </Box>
        </Box>
      );
    },
    "Volunteer Experience": (resumeData, setResumeData) => {
      // Initialize volunteer experience if not exists
      const volunteerExperience = resumeData.volunteerExperience || [
        {
          id: `volunteer-${Date.now()}`,
          organization: "Local Food Bank",
          position: "Volunteer Coordinator",
          location: "Community Center",
          startDate: "Jan 2023",
          endDate: "Dec 2023",
          current: false,
          bulletPoints: [
            {
              id: `bullet-${Date.now()}-${Math.random()}`,
              description: "Organized food drives and coordinated volunteer schedules"
            }
          ],
          hoursPerWeek: "5-10",
        }
      ];

      const addVolunteerExperience = () => {
        const newVolunteer = {
          id: `volunteer-${Date.now()}`,
          organization: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bulletPoints: [],
          hoursPerWeek: "",
        };
        setResumeData(prev => ({
          ...prev,
          volunteerExperience: [...(prev.volunteerExperience || volunteerExperience), newVolunteer]
        }));
      };

      const updateVolunteerExperience = (volunteerId: string, updates: Partial<{
        organization: string;
        position: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        bulletPoints: Array<{ id: string; description: string }>;
        hoursPerWeek: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          volunteerExperience: (prev.volunteerExperience || volunteerExperience).map(volunteer =>
            volunteer.id === volunteerId ? { ...volunteer, ...updates } : volunteer
          )
        }));
      };

      const deleteVolunteerExperience = (volunteerId: string) => {
        setResumeData(prev => ({
          ...prev,
          volunteerExperience: (prev.volunteerExperience || volunteerExperience).filter(volunteer => volunteer.id !== volunteerId)
        }));
      };

      const addVolunteerBulletPoint = (volunteerId: string, description: string = "") => {
        const newBulletPoint = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: description
        };
        const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
        if (!volunteer) return;

        const newBulletPoints = [...(volunteer.bulletPoints || []), newBulletPoint];
        updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
        setEditingBulletId(newBulletPoint.id);
      };

      const updateVolunteerBulletPoint = (volunteerId: string, bulletId: string, description: string) => {
        const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
        if (!volunteer) return;

        const newBulletPoints = (volunteer.bulletPoints || []).map(bullet =>
          bullet.id === bulletId ? { ...bullet, description } : bullet
        );
        updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
      };

      const deleteVolunteerBulletPoint = (volunteerId: string, bulletId: string) => {
        const volunteer = (resumeData.volunteerExperience || volunteerExperience).find(v => v.id === volunteerId);
        if (!volunteer) return;

        const newBulletPoints = (volunteer.bulletPoints || []).filter(bullet => bullet.id !== bulletId);
        updateVolunteerExperience(volunteerId, { bulletPoints: newBulletPoints });
      };

      const SortableVolunteerBulletPoint = ({ bullet, volunteerId, onUpdate }: {
        bullet: { id: string; description: string };
        volunteerId: string;
        onUpdate: (volunteerId: string, bulletId: string, description: string) => void;
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: bullet.id });

        const style = {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        };

        const isEditing = editingBulletId === bullet.id;
        const isPlaceholder = bullet.description === "Bullet point...";

        return (
          <Box
            ref={setNodeRef}
            style={style}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '80%',
            }}
          >
            <Box
              {...attributes}
              {...listeners}
              sx={{
                mr: 0.25,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                cursor: 'grab'
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 20, color: '#bbb' }} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 0.5,
                flex: 1,
                cursor: isEditing ? 'text' : 'default',
                backgroundColor: isEditing ? '#f5f5f5' : 'transparent',
                borderRadius: isEditing ? 2 : 0,
                '&:hover': {
                  backgroundColor: isEditing ? '#f5f5f5' : '#f5f5f5',
                  borderRadius: 2,
                  '& .delete-button': {
                    opacity: 1,
                  },
                },
              }}
            >
              {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={bullet.description}
                      placeholder="Enter bullet point description..."
                      onChange={(e) => onUpdate(volunteerId, bullet.id, e.target.value)}
                      onBlur={() => {
                        if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                          setEditingBulletId(null);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (bullet.description.trim() && bullet.description !== "Bullet point...") {
                            setEditingBulletId(null);
                          }
                        }
                      }}
                      variant="standard"
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-root': {
                          alignItems: 'center',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          paddingLeft: '0',
                          paddingTop: '0',
                          paddingBottom: '0',
                        },
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:after': { borderBottom: 'none' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      autoFocus
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0, lineHeight: 1 }}>•</Typography>
                  <Typography
                    component="span"
                    onClick={() => setEditingBulletId(bullet.id)}
                    sx={{
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      color: isPlaceholder ? '#999' : 'black',
                      flex: 1,
                      cursor: 'text',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        '& .delete-button': {
                          opacity: 1,
                        },
                      }
                    }}
                  >
                    {bullet.description}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => deleteVolunteerBulletPoint(volunteerId, bullet.id)}
                    className="delete-button"
                    sx={{
                      p: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      ml: 0.5,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        );
      };

      const handleVolunteerDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newVolunteerExperience = Array.from((resumeData.volunteerExperience || volunteerExperience));
        const [removed] = newVolunteerExperience.splice(result.source.index, 1);
        newVolunteerExperience.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, volunteerExperience: newVolunteerExperience }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Volunteer Experience
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('Volunteer Experience');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleVolunteerDragEnd}>
            <Droppable droppableId="volunteerExperience" type="volunteer">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.volunteerExperience || volunteerExperience).length === 0 ? 10 : 100 }}>
                  {(resumeData.volunteerExperience || volunteerExperience).map((volunteer, volunteerIndex) => (
                    <React.Fragment key={volunteer.id}>
                      <Draggable draggableId={volunteer.id} index={volunteerIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Volunteer Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={volunteer.organization || ''}
                                onChange={(e) => updateVolunteerExperience(volunteer.id, { organization: e.target.value })}
                                placeholder="Organization..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (volunteer.organization && volunteer.organization.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteVolunteerExperience(volunteer.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Position and Location */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={volunteer.position || ''}
                                onChange={(e) => updateVolunteerExperience(volunteer.id, { position: e.target.value })}
                                placeholder="Position"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (volunteer.position && volunteer.position.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={volunteer.location || ''}
                                onChange={(e) => updateVolunteerExperience(volunteer.id, { location: e.target.value })}
                                placeholder="Location"
                                sx={{
                                  width: 150,
                                  height: 28,
                                  backgroundColor: (volunteer.location && volunteer.location.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Volunteer Bullet Points */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                                Key Points:
                              </Typography>
                              <DndContext
                                onDragEnd={(event) => {
                                  const { active, over } = event;
                                  if (active && over && active.id !== over.id) {
                                    const oldIndex = volunteer.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                    const newIndex = volunteer.bulletPoints.findIndex(bullet => bullet.id === over.id);

                                    const newBulletPoints = arrayMove(volunteer.bulletPoints, oldIndex, newIndex);
                                    updateVolunteerExperience(volunteer.id, { bulletPoints: newBulletPoints });
                                  }
                                }}
                              >
                                <SortableContext items={(volunteer.bulletPoints || []).map(bullet => bullet.id)}>
                                  <Box sx={{ mb: 1 }}>
                                    {(volunteer.bulletPoints || []).map((bullet) => (
                                      <SortableVolunteerBulletPoint
                                        key={bullet.id}
                                        bullet={bullet}
                                        volunteerId={volunteer.id}
                                        onUpdate={updateVolunteerBulletPoint}
                                      />
                                    ))}
                                  </Box>
                                </SortableContext>
                              </DndContext>
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addVolunteerBulletPoint(volunteer.id)}
                                variant="outlined"
                                size="small"
                                sx={{
                                  textTransform: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  borderRadius: 2,
                                  border: '1px solid #e0e0e0',
                                  color: 'black',
                                  minWidth: 180,
                                  mt: 1,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5'
                                  }
                                }}
                              >
                                Bullet Points
                              </Button>
                            </Box>

                            {/* Hours per Week */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={volunteer.hoursPerWeek || ''}
                                onChange={(e) => updateVolunteerExperience(volunteer.id, { hoursPerWeek: e.target.value })}
                                placeholder="Hours per week (optional)"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (volunteer.hoursPerWeek && volunteer.hoursPerWeek.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Dates */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={volunteer.startDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateVolunteerExperience(volunteer.id, { startDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="Start Date"
                                sx={{
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (volunteer.startDate && volunteer.startDate.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    cursor: 'pointer',
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                              <TrendingFlatIcon sx={{
                                alignSelf: 'center',
                                color: '#666',
                                fontSize: '1.2rem'
                              }} />
                              <TextField
                                size="small"
                                value={volunteer.endDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateVolunteerExperience(volunteer.id, { endDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="End Date"
                                sx={{
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (volunteer.endDate && volunteer.endDate.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    cursor: 'pointer',
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Volunteer Experience button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addVolunteerExperience}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Volunteer Experience
            </Button>
          </Box>
        </Box>
      );
    },
    "References": (resumeData, setResumeData) => {
      // Initialize references if not exists
      const references = resumeData.references || [
        {
          id: `reference-${Date.now()}`,
          name: "Dr. Jane Smith",
          title: "Senior Manager",
          company: "Tech Solutions Inc.",
          email: "jane.smith@techsolutions.com",
          phone: "+1 (555) 123-4567",
          relationship: "Former Supervisor",
        }
      ];

      const addReference = () => {
        const newReference = {
          id: `reference-${Date.now()}`,
          name: "",
          title: "",
          company: "",
          email: "",
          phone: "",
          relationship: "",
        };
        setResumeData(prev => ({
          ...prev,
          references: [...(prev.references || references), newReference]
        }));
      };

      const updateReference = (referenceId: string, updates: Partial<{
        name: string;
        title: string;
        company: string;
        email: string;
        phone: string;
        relationship: string;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          references: (prev.references || references).map(reference =>
            reference.id === referenceId ? { ...reference, ...updates } : reference
          )
        }));
      };

      const deleteReference = (referenceId: string) => {
        setResumeData(prev => ({
          ...prev,
          references: (prev.references || references).filter(reference => reference.id !== referenceId)
        }));
      };

      const handleReferenceDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const newReferences = Array.from((resumeData.references || references));
        const [removed] = newReferences.splice(result.source.index, 1);
        newReferences.splice(result.destination.index, 0, removed);

        setResumeData(prev => ({ ...prev, references: newReferences }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              References
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleDeleteSection('References');
              }}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5',
                  borderRadius: '50%'
                }
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>

          <DragDropContext onDragEnd={handleReferenceDragEnd}>
            <Droppable droppableId="references" type="reference">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.references || references).length === 0 ? 10 : 100 }}>
                  {(resumeData.references || references).map((reference, referenceIndex) => (
                    <React.Fragment key={reference.id}>
                      <Draggable draggableId={reference.id} index={referenceIndex}>
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: 'transparent',
                              p: 2,
                              ml: -5.5,
                            }}
                          >
                            {/* Reference Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  userSelect: 'none',
                                  color: '#bbb',
                                  mr: 0.5,
                                }}
                              >
                                <DragIndicatorIcon sx={{ fontSize: 20 }} />
                              </Box>
                              <TextField
                                value={reference.name || ''}
                                onChange={(e) => updateReference(reference.id, { name: e.target.value })}
                                placeholder="Reference Name..."
                                variant="standard"
                                sx={{
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (reference.name && reference.name.trim()) ? 'transparent' : '#f5f5f5',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 600, fontSize: '1rem' },
                                  disableUnderline: true,
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteReference(reference.id)}
                                sx={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '50%',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #f5f5f5',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Title and Company */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={reference.title || ''}
                                onChange={(e) => updateReference(reference.id, { title: e.target.value })}
                                placeholder="Title"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (reference.title && reference.title.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={reference.company || ''}
                                onChange={(e) => updateReference(reference.id, { company: e.target.value })}
                                placeholder="Company"
                                sx={{
                                  width: 200,
                                  height: 28,
                                  backgroundColor: (reference.company && reference.company.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Email and Phone */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={reference.email || ''}
                                onChange={(e) => updateReference(reference.id, { email: e.target.value })}
                                placeholder="Email"
                                sx={{
                                  width: 250,
                                  height: 28,
                                  backgroundColor: (reference.email && reference.email.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                value={reference.phone || ''}
                                onChange={(e) => updateReference(reference.id, { phone: e.target.value })}
                                placeholder="Phone"
                                sx={{
                                  width: 150,
                                  height: 28,
                                  backgroundColor: (reference.phone && reference.phone.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>

                            {/* Relationship */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={reference.relationship || ''}
                                onChange={(e) => updateReference(reference.id, { relationship: e.target.value })}
                                placeholder="Relationship (e.g., Former Supervisor, Colleague)"
                                sx={{
                                  width: 300,
                                  height: 28,
                                  backgroundColor: (reference.relationship && reference.relationship.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    height: 28,
                                    fontSize: '0.875rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                  },
                                  '& .MuiInputBase-input': {
                                    paddingLeft: '8px',
                                    fontSize: '0.875rem',
                                    height: 28,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                      <Box sx={{ mx: 3, my: 2, height: 1.5, backgroundColor: '#e0e0e0' }} />
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Reference button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addReference}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                color: 'black',
                minWidth: 180,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #f5f5f5'
                }
              }}
            >
              Reference
            </Button>
          </Box>
        </Box>
      );
    },
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



  const handleResetFormatting = () => {
    const currentTemplate = exportSettings.template;

    if (currentTemplate === 'standard') {
      setExportSettings(prev => ({
        ...prev,
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
      }));
    } else if (currentTemplate === 'compact') {
      setExportSettings(prev => ({
        ...prev,
        fontFamily: 'Times New Roman',
        nameSize: 36,
        sectionHeadersSize: 12,
        subHeadersSize: 10,
        bodyTextSize: 10,
        sectionSpacing: 10,
        entrySpacing: 6,
        lineSpacing: 10,
        topBottomMargin: 25,
        sideMargins: 25,
        alignTextLeftRight: false,
      }));
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
                              ? SECTION_COMPONENTS[section](resumeData, setResumeData)
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
                                  ? SECTION_COMPONENTS[section](resumeData, setResumeData)
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

      {/* Export Resume Panel - Slides out from right */}
      <Drawer
        anchor="right"
        open={exportPanelOpen}
        onClose={handleExportClose}
        onTransitionEnd={() => {
          if (!exportPanelOpen) {
            setExportPanelFullyClosed(true);
            // Clear the fallback timeout if it exists
            if (exportPanelFallbackTimeoutRef.current) {
              clearTimeout(exportPanelFallbackTimeoutRef.current);
              exportPanelFallbackTimeoutRef.current = null;
            }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 1170,
            backgroundColor: 'white',
            borderLeft: '1px solid #e0e0e0',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          },
        }}
      >
        <Box sx={{ py: 2, px: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            pb: 2,
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Typography variant="h6" fontWeight={600}>
              Export Resume
            </Typography>
            <IconButton onClick={handleExportClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content - Two Column Layout */}
          <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden' }}>
            {/* Left Column - Resume Preview */}
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 1,
              // Webkit scrollbar styling - more specific
              '&::-webkit-scrollbar': {
                width: '8px !important',
                backgroundColor: 'transparent !important',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent !important',
                backgroundColor: 'transparent !important',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cccccc !important',
                backgroundColor: '#cccccc !important',
                borderRadius: '4px !important',
                border: 'none !important',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#aaaaaa !important',
                backgroundColor: '#aaaaaa !important',
              },
              '&::-webkit-scrollbar-button': {
                display: 'none !important',
              },
              '&::-webkit-scrollbar-corner': {
                background: 'transparent !important',
              },
              // Firefox scrollbar styling
              scrollbarWidth: 'thin',
              scrollbarColor: '#cccccc transparent',
            }}>




              {/* Resume Preview */}
              <Box sx={{
                overflowY: 'visible',
                overflowX: 'hidden',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                pb: 2,
              }}>
                {previewLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : previewError ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Alert severity="error">{previewError}</Alert>
                  </Box>
                ) : previewHtml ? (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: 'scale(0.80)',
                    transformOrigin: 'top left',
                    minHeight: 'fit-content',
                    width: '100%',
                  }}>
                    <div
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      style={{
                        width: '100%',
                        margin: 0,
                        padding: 0,
                      }}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>

            {/* Right Column - Resume Template Settings */}
            <Box sx={{
              width: '35%',
              overflowY: 'auto',
              px: 0.5,
              // Webkit scrollbar styling
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent !important',
                marginLeft: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cccccc !important',
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#aaaaaa !important',
              },
              '&::-webkit-scrollbar-button': {
                display: 'block',
                height: '8px',
                border: 'none',
              },
              '&::-webkit-scrollbar-button:hover': {
                // No background
              },
              // Firefox scrollbar styling
              scrollbarWidth: 'thin',
              scrollbarColor: '#cccccc transparent',
            }}>
              {/* Resume Template Section */}
              <Box sx={{
                mb: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'white'
              }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Resume Template
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={exportSettings.pageSize}
                    onChange={(e) => {
                      const newPageSize = e.target.value;
                      setExportSettings(prev => ({
                        ...prev,
                        pageSize: newPageSize,
                        pageWidth: newPageSize === 'letter' ? 850 : 794,
                        pageHeight: newPageSize === 'letter' ? 1100 : 1123,
                      }));
                    }}
                    sx={{
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused': {
                          border: `2px solid ${COLORS.primary}`,
                          outline: 'none',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${COLORS.primary} !important`,
                      },
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: COLORS.hover,
                        },
                      },
                    }}
                  >
                    <MenuItem value="letter" sx={{ fontSize: 14 }}>Letter (8.5&quot; x 11&quot;)</MenuItem>
                    <MenuItem value="a4" sx={{ fontSize: 14 }}>A4 (210mm x 297mm)</MenuItem>
                  </Select>
                </FormControl>

                {/* Template Previews */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{
                    flex: 1,
                    height: 80,
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    position: 'relative',
                    cursor: 'pointer',
                    ...(exportSettings.template === 'standard' && {
                      borderColor: COLORS.primary,
                      backgroundColor: COLORS.selectedLightGray,
                      color: 'black',
                    })
                  }}
                    onClick={() => setExportSettings(prev => ({
                      ...prev,
                      template: 'standard',
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
                      alignTextLeftRight: false
                    }))}
                  >
                    <Typography variant="body2" fontWeight={500}>Standard</Typography>
                    {exportSettings.template === 'standard' && (
                      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                        <CheckIcon sx={{ color: COLORS.primary, fontSize: 16 }} />
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                      <StarIcon sx={{ color: '#ffd700', fontSize: 14 }} />
                    </Box>
                  </Box>

                  <Box sx={{
                    flex: 1,
                    height: 80,
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    position: 'relative',
                    cursor: 'pointer',
                    ...(exportSettings.template === 'compact' && {
                      borderColor: COLORS.primary,
                      backgroundColor: COLORS.selectedLightGray,
                      color: 'black',
                    })
                  }}
                    onClick={() => setExportSettings(prev => ({
                      ...prev,
                      template: 'compact',
                      fontFamily: 'Times New Roman',
                      nameSize: 36,
                      sectionHeadersSize: 12,
                      subHeadersSize: 10,
                      bodyTextSize: 10,
                      sectionSpacing: 10,
                      entrySpacing: 6,
                      lineSpacing: 10,
                      topBottomMargin: 25,
                      sideMargins: 25,
                      alignTextLeftRight: false
                    }))}
                  >
                    <Typography variant="body2" fontWeight={500}>Compact</Typography>
                    {exportSettings.template === 'compact' && (
                      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                        <CheckIcon sx={{ color: COLORS.primary, fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <StarIcon sx={{ color: '#ffd700', fontSize: 14 }} />
                  <Typography variant="caption" color="text.secondary">Recommended</Typography>
                  <Tooltip title="This template is optimized for ATS (Applicant Tracking Systems) and follows professional resume standards" arrow>
                    <InfoIcon sx={{ color: '#666', fontSize: 14 }} />
                  </Tooltip>
                </Box>
              </Box>

              {/* Font Section */}
              <Box sx={{
                mb: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'white'
              }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Font
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ position: 'static', transform: 'none', marginBottom: 1, fontSize: 14, fontWeight: 600, color: "black" }}>Font Family</InputLabel>
                  <Select
                    value={exportSettings.fontFamily}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                    sx={{
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: `2px solid ${COLORS.primary} !important`,
                        },
                        '&.Mui-focused': {
                          border: `2px solid ${COLORS.primary} !important`,
                          outline: 'none',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${COLORS.primary} !important`,
                      },
                    }}
                  >
                    <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                    <MenuItem value="Arial">Arial</MenuItem>
                    <MenuItem value="Calibri">Calibri</MenuItem>
                    <MenuItem value="Georgia">Georgia</MenuItem>
                    <MenuItem value="Helvetica">Helvetica</MenuItem>
                    <MenuItem value="Verdana">Verdana</MenuItem>
                    <MenuItem value="Garamond">Garamond</MenuItem>
                    <MenuItem value="Bookman">Bookman</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 600, color: "black" }}>Name</Typography>
                    <Select
                      value={exportSettings.nameSize}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, nameSize: Number(e.target.value) }))}
                      sx={{
                        height: 33,
                        fontSize: 14,
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: `2px solid ${COLORS.primary} !important`,
                          },
                          '&.Mui-focused': {
                            border: `2px solid ${COLORS.primary} !important`,
                            outline: 'none',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: `2px solid ${COLORS.primary} !important`,
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                            '& .MuiMenuItem-root.Mui-selected': {
                              backgroundColor: COLORS.selected,
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: '#ccc',
                              borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                              background: '#999',
                            },
                          },
                        },
                      }}
                    >
                      {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52].map((size) => (
                        <MenuItem key={size} value={size} sx={{ fontSize: 14 }}>{size}</MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 600, color: "black" }}>Section Headers</Typography>
                    <Select
                      value={exportSettings.sectionHeadersSize}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, sectionHeadersSize: Number(e.target.value) }))}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                            '& .MuiMenuItem-root.Mui-selected': {
                              backgroundColor: COLORS.selected,
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        height: 33,
                        fontSize: 14,
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: `2px solid ${COLORS.primary} !important`,
                          },
                          '&.Mui-focused': {
                            border: `2px solid ${COLORS.primary} !important`,
                            outline: 'none',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: `2px solid ${COLORS.primary} !important`,
                        },
                      }}
                    >
                      {[10, 11, 12, 13, 14, 15].map((size) => (
                        <MenuItem key={size} value={size} sx={{ fontSize: 14 }}>{size}</MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 600, color: "black" }}>Sub-Headers</Typography>
                      <Tooltip title="Font size for job titles, company names, and other sub-headers in your resume" arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Select
                      value={exportSettings.subHeadersSize}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, subHeadersSize: Number(e.target.value) }))}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                            '& .MuiMenuItem-root.Mui-selected': {
                              backgroundColor: COLORS.selected,
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        height: 33,
                        fontSize: 14,
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: `2px solid ${COLORS.primary} !important`,
                          },
                          '&.Mui-focused': {
                            border: `2px solid ${COLORS.primary} !important`,
                            outline: 'none',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: `2px solid ${COLORS.primary} !important`,
                        },
                      }}
                    >
                      {[8, 9, 10, 10.5, 11, 12, 13, 14].map((size) => (
                        <MenuItem key={size} value={size} sx={{ fontSize: 14 }}>{size}</MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 600, color: "black" }}>Body Text</Typography>
                    <Select
                      value={exportSettings.bodyTextSize}
                      onChange={(e) => setExportSettings(prev => ({ ...prev, bodyTextSize: Number(e.target.value) }))}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            '& .MuiMenuItem-root': {
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                            '& .MuiMenuItem-root.Mui-selected': {
                              backgroundColor: COLORS.selected,
                              '&:hover': {
                                backgroundColor: COLORS.selected,
                              },
                            },
                          },
                        },
                      }}
                      sx={{
                        height: 33,
                        fontSize: 14,
                        backgroundColor: '#f5f5f5',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: `2px solid ${COLORS.primary} !important`,
                          },
                          '&.Mui-focused': {
                            border: `2px solid ${COLORS.primary} !important`,
                            outline: 'none',
                          },
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: `2px solid ${COLORS.primary} !important`,
                        },
                      }}
                    >
                      {[8, 9, 10, 11, 12].map((size) => (
                        <MenuItem key={size} value={size} sx={{ fontSize: 14 }}>{size}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
              </Box>

              {/* Spacing & Margin Section */}
              <Box sx={{
                mb: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'white'
              }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Spacing & Margin
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Section Spacing</Typography>
                      <Tooltip title="Space between major sections like Work Experience, Education, Skills, etc." arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Slider
                      value={exportSettings.sectionSpacing}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, sectionSpacing: value as number }))}
                      min={4}
                      max={20}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} pt`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'white',
                          border: '1px solid black',
                          transition: 'none',
                          '&:hover': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:focus': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:active': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                          },
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: COLORS.primary,
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#e0e0e0',
                        },
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '8px',
                          padding: '4px 6px',
                          backgroundColor: 'black',
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Entry Spacing</Typography>
                      <Tooltip title="Space between individual entries within a section (e.g., between different jobs in Work Experience)" arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Slider
                      value={exportSettings.entrySpacing}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, entrySpacing: value as number }))}
                      min={4}
                      max={16}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} pt`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'white',
                          border: '1px solid black',
                          transition: 'none',
                          '&:hover': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:focus': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:active': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                          },
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: COLORS.primary,
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#e0e0e0',
                        },
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '8px',
                          padding: '4px 6px',
                          backgroundColor: 'black',
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Line Spacing</Typography>
                      <Tooltip title="Space between lines of text within bullet points and descriptions" arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Slider
                      value={exportSettings.lineSpacing}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, lineSpacing: value as number }))}
                      min={10}
                      max={15}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} pt`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'white',
                          border: '1px solid black',
                          transition: 'none',
                          '&:hover': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:focus': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:active': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                          },
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: COLORS.primary,
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#e0e0e0',
                        },
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '8px',
                          padding: '4px 6px',
                          backgroundColor: 'black',
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Top & Bottom Margin</Typography>
                      <Tooltip title="Space from the top and bottom edges of each page" arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Slider
                      value={exportSettings.topBottomMargin}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, topBottomMargin: value as number }))}
                      min={10}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} pt`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'white',
                          border: '1px solid black',
                          transition: 'none',
                          '&:hover': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:focus': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:active': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                          },
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: COLORS.primary,
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#e0e0e0',
                        },
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '8px',
                          padding: '4px 6px',
                          backgroundColor: 'black',
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Side Margins</Typography>
                      <Tooltip title="Space from the left and right edges of each page" arrow>
                        <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                    <Slider
                      value={exportSettings.sideMargins}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, sideMargins: value as number }))}
                      min={30}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} pt`}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'white',
                          border: '1px solid black',
                          transition: 'none',
                          '&:hover': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:focus': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&:active': {
                            backgroundColor: 'white',
                            boxShadow: 'none',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                          },
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: COLORS.primary,
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: '#e0e0e0',
                        },
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '8px',
                          padding: '4px 6px',
                          backgroundColor: 'black',
                        },
                      }}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <ToggleButton
                        value="align"
                        selected={exportSettings.alignTextLeftRight}
                        onChange={() => setExportSettings(prev => ({ ...prev, alignTextLeftRight: !prev.alignTextLeftRight }))}
                        sx={{
                          mr: -1,
                          width: 50,
                          height: 24,
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: exportSettings.alignTextLeftRight ? COLORS.primary : '#e0e0e0',
                          '&.Mui-selected': {
                            backgroundColor: COLORS.primary,
                          },
                          '&:hover': {
                            backgroundColor: '#e0e0e0',
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: COLORS.primaryLight,
                          },
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '3px',
                            left: exportSettings.alignTextLeftRight ? 'calc(100% - 21px)' : '3px',
                            width: 18,
                            height: 18,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s ease',
                          },
                        }}
                      />
                    }
                    label="Align Text Left & Right"
                    labelPlacement="start"
                    sx={{
                      justifyContent: 'space-between',
                      width: '100%',
                      ml: 0,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Reset Formatting Button */}
              <Box sx={{ mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleResetFormatting}
                  fullWidth
                  startIcon={<RestartAltIcon />}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    color: '#666',
                    textTransform: 'none',
                    py: 1,
                  }}
                >
                  Reset formatting
                </Button>
              </Box>


            </Box>
          </Box>

          {/* Footer - Download Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button
              variant="contained"
              onClick={handleDownloadPDF}
              disabled={pdfDownloading}
              startIcon={pdfDownloading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                borderRadius: 6,
                backgroundColor: '#000',
                color: 'white',
                textTransform: 'none',
                fontSize: 16,
                boxShadow: 'none',
                '&:disabled': {
                  backgroundColor: '#666',
                  color: 'white',
                },
              }}
            >
              {pdfDownloading ? 'Generating PDF...' : 'Download by PDF'}
            </Button>

          </Stack>
        </Box>
      </Drawer>

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

