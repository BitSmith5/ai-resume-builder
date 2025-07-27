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
  Drawer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  FormControlLabel,
  Stack,
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
import ClassicResumeTemplate from './ClassicResumeTemplate';

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

// ============================================================================
// GLOBAL COLOR SYSTEM - Change colors from one location
// ============================================================================

// ============================================================================
// MASTER COLOR - IDE-FRIENDLY RGBA FORMAT
// ============================================================================

// MASTER COLOR - RGBA format for IDE color picker
const MASTER_COLOR_RGBA = 'rgb(173, 126, 233)'; // Light mint green with 30% opacity

// ============================================================================
// COLOR SYSTEM - SIMPLIFIED FOR RGBA MASTER COLOR
// ============================================================================

// All colors are now direct values for IDE color picker support

// ============================================================================
// COLOR UTILITIES FOR DYNAMIC PALETTE GENERATION
// ============================================================================

// Extract RGB values from the master color
const extractRgbFromString = (colorString: string): { r: number, g: number, b: number } => {
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]), 
      b: parseInt(match[3])
    };
  }
  return { r: 145, g: 253, b: 145 }; // Fallback to your current color
};

// RGB to Hex conversion with bounds checking
const rgbToHex = (r: number, g: number, b: number): string => {
  // Clamp values to 0-255 range
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `#${((1 << 24) + (clampedR << 16) + (clampedG << 8) + clampedB).toString(16).slice(1)}`;
};

// RGB to RGBA conversion with bounds checking
const rgbToRgba = (r: number, g: number, b: number, alpha: number): string => {
  // Clamp values to 0-255 range
  const clampedR = Math.max(0, Math.min(255, Math.round(r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(b)));
  return `rgba(${clampedR}, ${clampedG}, ${clampedB}, ${alpha})`;
};

// ============================================================================
// DYNAMIC COLOR PALETTE GENERATION
// ============================================================================

// Extract RGB from master color
const MASTER_RGB = extractRgbFromString(MASTER_COLOR_RGBA);

// Generate color palette dynamically from master color
const COLORS = {
  // Primary colors - Generated from master color
  primary: rgbToHex(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b),
  primaryLight: rgbToHex(MASTER_RGB.r + 30, MASTER_RGB.g + 30, MASTER_RGB.b + 30),
  primaryDark: rgbToHex(MASTER_RGB.r - 30, MASTER_RGB.g - 30, MASTER_RGB.b - 30),
  
  // Background colors - Generated from master color
  background: rgbToHex(MASTER_RGB.r + 50, MASTER_RGB.g + 50, MASTER_RGB.b + 50),
  backgroundLight: rgbToHex(MASTER_RGB.r + 80, MASTER_RGB.g + 80, MASTER_RGB.b + 80),
  
  // RGBA variations - Generated from master color
  shadow: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.3),
  overlay: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.1),
  
  // Hover states - Generated from master color
  hover: rgbToHex(MASTER_RGB.r + 20, MASTER_RGB.g + 20, MASTER_RGB.b + 20),
  hoverLight: rgbToHex(MASTER_RGB.r + 40, MASTER_RGB.g + 40, MASTER_RGB.b + 40),
  
  // Selection and interactive states - Generated from master color
  selected: rgbToHex(MASTER_RGB.r + 100, MASTER_RGB.g + 100, MASTER_RGB.b + 100), // Very light version for selections
  selectedBackground: rgbToRgba(MASTER_RGB.r, MASTER_RGB.g, MASTER_RGB.b, 0.05), // Very light background for selections
  selectedLightGray: '#f5f5f5', // Light gray for template selection buttons
  
  // UI element colors - Generated from master color
  uiBackground: rgbToHex(MASTER_RGB.r + 60, MASTER_RGB.g + 60, MASTER_RGB.b + 60), // For UI elements like buttons
  uiBackgroundLight: rgbToHex(MASTER_RGB.r + 90, MASTER_RGB.g + 90, MASTER_RGB.b + 90), // Lighter UI elements
};

// ============================================================================
// END GLOBAL COLOR SYSTEM
// ============================================================================

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
  const [error] = useState("");
  const [success] = useState("");
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const exportPanelFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exportSettings, setExportSettings] = useState({
    template: 'standard',
    fontFamily: 'Times New Roman',
    nameSize: 25,
    sectionHeadersSize: 11,
    subHeadersSize: 10.5,
    bodyTextSize: 10,
    sectionSpacing: 2,
    entrySpacing: 0,
    lineSpacing: 12,
    topBottomMargin: 26,
    sideMargins: 36,
    alignTextLeftRight: false,
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
                background: '#c0c0c0',
                borderRadius: '2px',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a0a0a0',
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
                background: '#c0c0c0',
                borderRadius: '2px',
                margin: '0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a0a0a0',
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
        console.log('Loading profile data...');
        const response = await fetch('/api/profile');
        console.log('Profile response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('Profile data received:', userData);
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
          console.log('Loaded resume data:', resume);
          console.log('deletedSections from API:', resume.deletedSections);
          
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
              return dbWorkExperience.map((dbWork: Record<string, unknown>, index: number) => {
                const contentWork = contentWorkExperience[index] || {};
                
                // Convert Date objects back to "MMM YYYY" format
                const formatDate = (date: Date | string): string => {
                  if (!date) return '';
                  const d = new Date(date);
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
            })(),
            education: (resume.education || []).map((edu: Record<string, unknown>) => {
              // Convert Date objects back to "MMM YYYY" format
              const formatDate = (date: Date | string): string => {
                if (!date) return '';
                const d = new Date(date);
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
                const d = new Date(date);
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
                const d = new Date(date);
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
            console.log('Loading sectionOrder from database:', resume.sectionOrder);
            // Filter out deleted sections from the loaded section order
            const deletedSections = resume.deletedSections || [];
            const filteredSectionOrder = resume.sectionOrder.filter((section: string) => !deletedSections.includes(section));
            console.log('Filtered sectionOrder after loading:', filteredSectionOrder);
            setSectionOrder(filteredSectionOrder);
            
            // Also set sectionOrder in resumeData
            setResumeData(prev => ({
              ...prev,
              sectionOrder: filteredSectionOrder
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
    
    console.log('Autosave triggered with data:', data);
    console.log('deletedSections in autosave:', data.deletedSections);
    console.log('sectionOrder in autosave:', currentSectionOrder);
    

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
      console.log('Filtering data for deleted sections:', deletedSections);
      
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
        strengths: filteredData.strengths || [],
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
      
      console.log('Saving resume with payload:', savePayload);
      console.log('Save URL:', url, 'Method:', method);
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });

      console.log('Save response status:', response.status, response.statusText);
      
      if (response.ok) {
        const savedResume = await response.json();
        console.log('Save successful, saved resume:', savedResume);
        
        // If this was a new resume, update the URL with the new ID
        if (!resumeId && savedResume.id) {
          router.replace(`/dashboard/resumes/${savedResume.id}/edit`);
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
    
    console.log('Autosave triggered - sectionOrder:', sectionOrder);
    debouncedSave(resumeData, profileData, sectionOrder);
  }, [resumeData, profileData, sectionOrder, loading, session?.user, resumeId, debouncedSave]);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.log('Section drag end - source:', result.source.index, 'destination:', result.destination.index);
    console.log('Current sectionOrder:', sectionOrder);
    
    const newOrder = Array.from(sectionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    
    console.log('New sectionOrder:', newOrder);
    setSectionOrder(newOrder);
  };

  const handleAddSection = (sectionName: string) => {
    if (!sectionOrder.includes(sectionName)) {
      setSectionOrder(prev => [...prev, sectionName]);
      // Remove from deleted sections if it was previously deleted
      setResumeData(prev => ({
        ...prev,
        deletedSections: prev.deletedSections?.filter(section => section !== sectionName) || []
        // Note: When re-adding a section, the data will be empty arrays which is correct
        // since the data was cleared when the section was deleted
      }));
    }
    setAddSectionPopupOpen(false);
  };

  const handleDeleteSection = (sectionName: string) => {
    console.log('Deleting section:', sectionName);
    console.log('Current sectionOrder before deletion:', sectionOrder);
    console.log('Current deletedSections before deletion:', resumeData.deletedSections);
    
    // Remove from section order
    setSectionOrder(prev => {
      const newOrder = prev.filter(section => section !== sectionName);
      console.log('New sectionOrder after deletion:', newOrder);
      return newOrder;
    });
    
    // Add to deleted sections and clear the data for that section
    setResumeData(prev => {
      const newDeletedSections = [...(prev.deletedSections || []), sectionName];
      console.log('New deletedSections after deletion:', newDeletedSections);
      
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
      
      console.log('Updated resumeData after deletion:', updatedData);
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
    "Personal Info": () => {
      console.log('Rendering Personal Info with profileData:', profileData);
      console.log('Session data:', session?.user);
      const hasProfileData = profileData.name || profileData.email || profileData.phone || profileData.location || profileData.linkedinUrl || profileData.githubUrl || profileData.portfolioUrl;
      
      if (!hasProfileData) {
        return (
          <Box sx={{ py: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Profile Information Required
              </Typography>
              <Typography variant="body2">
                To display your contact information in this resume, please complete your profile details in the Profile section. 
                Navigate to Dashboard → Profile to add your phone number, location, and professional links.
              </Typography>
            </Alert>
            <Typography variant="h5" fontWeight={700} mb={2} sx={{ fontSize: '1.5rem' }}>
              {profileData.name || "Your Name"}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 3, flexWrap: "wrap" }}>
              {profileData.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{profileData.email}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      }

      return (
        <Box sx={{ py: 2 }}>
          {/* Name */}
          <Typography variant="h5" fontWeight={700} mb={2} sx={{ fontSize: '1.5rem' }}>
            {profileData.name || "Your Name"}
          </Typography>
          
          {/* Contact Information and Links Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3, maxWidth: '900px' }}>
            {/* Email Column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{profileData.email || "Email"}</Typography>
              </Box>
              <Box sx={{
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                {/* LinkedIn */}
                <Box sx={{ 
                  display: "flex",
                  direction: "row",
                  alignItems: "center", 
                  gap: 0.3, 
                  p: 1,
                }}>
                  <LinkedInIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>LinkedIn</Typography>
                </Box>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1, 
                  borderBottom: '1px solid #e0e0e0',
                }}/>
                <Box sx={{ p: 1 }}>
                  <TextField
                    size="small"
                    value={profileData.linkedinUrl || ""}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    variant="standard"
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      style: { fontSize: '0.875rem', fontWeight: 500 }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Phone Column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{profileData.phone ? formatPhoneNumber(profileData.phone) : "Phone number"}</Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                {/* GitHub */}
                <Box sx={{ 
                  display: "flex",
                  direction: "row",
                  alignItems: "center", 
                  gap: 0.3, 
                  p: 1,
                }}>
                  <GitHubIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>GitHub</Typography>
                </Box>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1, 
                  borderBottom: '1px solid #e0e0e0',
                }}/>
                <Box sx={{ p: 1 }}>
                  <TextField
                    size="small"
                    value={profileData.githubUrl || ""}
                    onChange={(e) => setProfileData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/yourusername"
                    variant="standard"
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      style: { fontSize: '0.875rem', fontWeight: 500 }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Location Column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2">{profileData.location || "Location"}</Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                {/* Website */}
                <Box sx={{ 
                  display: "flex",
                  direction: "row",
                  alignItems: "center", 
                  gap: 0.3, 
                  p: 1,
                }}>
                  <WebsiteIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>Website</Typography>
                </Box>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1, 
                  borderBottom: '1px solid #e0e0e0',
                }}/>
                <Box sx={{ p: 1 }}>
                  <TextField
                    size="small"
                    value={profileData.portfolioUrl || ""}
                    onChange={(e) => setProfileData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    variant="standard"
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      style: { fontSize: '0.875rem', fontWeight: 500 }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    },
    "Professional Summary": (resumeData, setResumeData) => (
      <Box sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Professional Summary
            </Typography>
                      <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete button clicked for section: Professional Summary');
                handleDeleteSection('Professional Summary');
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
        <TextField
          multiline
          maxRows={15}
          value={resumeData.content.personalInfo.summary}
          onChange={(e) =>
            setResumeData((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                personalInfo: {
                  ...prev.content.personalInfo,
                  summary: e.target.value,
                },
              },
            }))
          }
          onPaste={(e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            
            // Process pasted text to remove line breaks and normalize spacing
            let processedText = pastedText;
            
            // Replace multiple spaces with single space
            processedText = processedText.replace(/\s+/g, ' ');
            
            // Remove line breaks and replace with spaces
            processedText = processedText.replace(/\n/g, ' ');
            
            // Trim extra spaces
            processedText = processedText.trim();
            
            setResumeData((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                personalInfo: {
                  ...prev.content.personalInfo,
                  summary: processedText,
                },
              },
            }));
          }}
          placeholder="Write a compelling professional summary..."
          variant="standard"
          sx={{
            width: '80%',
            '& .MuiInputBase-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
              },
              '& .MuiInputBase-input': {
                padding: '5px 12px 5px 12px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
              },
            },
          }}
          InputProps={{
            disableUnderline: true,
            style: { fontSize: '0.875rem' }
          }}
        />
      </Box>
    ),
    "Technical Skills": (resumeData, setResumeData) => {
      // Initialize skill categories if not exists
      const skillCategories = resumeData.skillCategories || [];



      const addSkillCategory = () => {
        const newCategory = {
          id: `category-${Date.now()}`,
          title: 'New Category',
          skills: []
        };
        setResumeData(prev => ({
          ...prev,
          skillCategories: [...(prev.skillCategories || skillCategories), newCategory]
        }));
      };

      const updateSkillCategory = (categoryId: string, updates: Partial<{ title: string; skills: Array<{ id: string; name: string }> }>) => {
        setResumeData(prev => ({
          ...prev,
          skillCategories: (prev.skillCategories || skillCategories).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
            cat.id === categoryId ? { ...cat, ...updates } : cat
          )
        }));
      };

      const deleteSkillCategory = (categoryId: string) => {
        setResumeData(prev => ({
          ...prev,
          skillCategories: (prev.skillCategories || skillCategories).filter((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) => cat.id !== categoryId)
        }));
      };

      const addSkillToCategory = (categoryId: string, skillName: string) => {
        if (!skillName.trim()) return;
        const newSkill = { id: Math.random().toString(), name: skillName.trim() };
        setResumeData(prev => ({
          ...prev,
          skillCategories: (prev.skillCategories || skillCategories).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
            cat.id === categoryId ? { ...cat, skills: [...cat.skills, newSkill] } : cat
          )
        }));
      };

      const deleteSkillFromCategory = (categoryId: string, skillId: string) => {
        setResumeData(prev => ({
          ...prev,
          skillCategories: (prev.skillCategories || skillCategories).map((cat: { id: string; title: string; skills: Array<{ id: string; name: string }> }) =>
            cat.id === categoryId ? { ...cat, skills: cat.skills.filter(skill => skill.id !== skillId) } : cat
          )
        }));
      };



      // Custom Sortable Skill Component with real-time feedback
      const SortableSkill = ({ skill, categoryId, onDelete }: { 
        skill: { id: string; name: string }; 
        categoryId: string; 
        onDelete: (categoryId: string, skillId: string) => void; 
      }) => {
        const {
          attributes,
          listeners,
          setNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: skill.id });

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
              border: isDragging ? '2px solid #e0e0e0' : 'none',
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
            
            {/* Skill name */}
            <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
              {skill.name}
            </Typography>
            
            {/* Delete button - separate from drag area */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(categoryId, skill.id);
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

      const handleCategoryDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const newCategories = Array.from(resumeData.skillCategories || skillCategories);
        const [removed] = newCategories.splice(result.source.index, 1);
        newCategories.splice(result.destination.index, 0, removed);
        
        setResumeData(prev => ({ ...prev, skillCategories: newCategories }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Technical Skills
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteSection('Technical Skills');
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
          
          <DragDropContext onDragEnd={handleCategoryDragEnd}>
            <Droppable droppableId="skill-categories" type="skill-category">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.skillCategories || skillCategories).length === 0 ? 10 : 100 }}>
                  {(resumeData.skillCategories || skillCategories).map((category, categoryIndex) => (
                    <Draggable key={category.id} draggableId={category.id} index={categoryIndex}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                                                      sx={{
                              mb: 2,
                              background: 'transparent',
                              ml: -3.5,
                            }}
                        >
                          {/* Category Header with Drag Handle */}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'grab',
                                userSelect: 'none',
                                color: '#bbb',
                              }}
                            >
                              <DragIndicatorIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <TextField
                              value={category.title}
                              onChange={(e) => updateSkillCategory(category.id, { title: e.target.value })}
                              variant="standard"
                              sx={{ 
                                fontWeight: 600,
                                px: 1,
                                mr: 1,
                                borderRadius: 2,
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
                              onClick={() => deleteSkillCategory(category.id)}
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

                          {/* Skills in this category */}
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                                                         onDragEnd={(event: DragEndEvent) => {
                               const { active, over } = event;
                               
                               if (active.id !== over?.id) {
                                 const currentCategory = (resumeData.skillCategories || skillCategories).find(cat => cat.id === category.id);
                                 if (!currentCategory) return;
                                 
                                 const oldIndex = currentCategory.skills.findIndex((skill: { id: string; name: string }) => skill.id === active.id);
                                 const newIndex = currentCategory.skills.findIndex((skill: { id: string; name: string }) => skill.id === over?.id);
                                 
                                 const newSkills = arrayMove(currentCategory.skills, oldIndex, newIndex) as Array<{ id: string; name: string }>;
                                 updateSkillCategory(category.id, { skills: newSkills });
                               }
                             }}
                          >
                            <SortableContext items={category.skills.map(skill => skill.id)} strategy={horizontalListSortingStrategy}>
                              <Box sx={{ display: "flex", minHeight: 40, flexWrap: "wrap", pl: 3 }}>
                                {category.skills.map((skill) => (
                                  <SortableSkill
                                    key={skill.id}
                                    skill={skill}
                                    categoryId={category.id}
                                    onDelete={deleteSkillFromCategory}
                                  />
                                ))}
                              </Box>
                            </SortableContext>
                          </DndContext>

                          {/* Add skill input for this category */}
                          <Box sx={{ display: "flex", alignItems: "center", width: 300, pl: 3, mx: 0.5, mt: 0.5 }}>
                            <TextField
                              size="small"
                              placeholder="Add skill..."
                              sx={{ 
                                flex: 1, 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    border: 'none',
                                  },
                                  '&:hover fieldset': {
                                    border: 'none',
                                  },
                                  '&.Mui-focused fieldset': {
                                    border: 'none',
                                  },
                                },
                              }}
                              onKeyPress={(e) => {
                                const target = e.target as HTMLInputElement;
                                if (e.key === 'Enter' && target.value.trim()) {
                                  addSkillToCategory(category.id, target.value);
                                  target.value = '';
                                }
                              }}
                            />
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  addSkillToCategory(category.id, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* + Skills button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addSkillCategory}
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
              Skill Category
            </Button>
          </Box>
        </Box>
      );
    },
    "Work Experience": (resumeData, setResumeData) => {
      // Initialize work experience if not exists
      const workExperience = resumeData.workExperience || [
        {
          id: `work-${Date.now()}`,
          company: "Playgig Inc.",
          position: "Game Engineer (Contract)",
          location: "",
          startDate: "Mar 2025",
          endDate: "May 2025",
          current: false,
          bulletPoints: [
            { id: Math.random().toString(), description: "Utilized AI-driven tools to accelerate development workflows, improving iteration speed and team efficiency." },
            { id: Math.random().toString(), description: "Optimized performance for a mobile title, significantly increasing frame rates and enhancing player experience." },
            { id: Math.random().toString(), description: "Refactored matchmaking systems to improve reliability and scalability." },
            { id: Math.random().toString(), description: "Implemented custom gear effects and ability systems." }
          ]
        },
        {
          id: `work-${Date.now() + 1}`,
          company: "Battlebound Inc.",
          position: "Game Engineer",
          location: "",
          startDate: "Jan 2024",
          endDate: "Feb 2025",
          current: false,
          bulletPoints: [
            { id: Math.random().toString(), description: "Enhanced gameplay systems (abilities, stats, quests, camera, AI, UI) for multiple games, including a Web3 Steam title, significantly boosting player engagement and improving game functionality." },
            { id: Math.random().toString(), description: "Engineered hoverboard racing and turtle racing games with engaging mechanics." },
            { id: Math.random().toString(), description: "Maintained a live online game with a large user base, submitting updates and hot fixes rapidly." }
          ]
        }
      ];

      const addWorkExperience = () => {
        const newWork = {
          id: `work-${Date.now()}`,
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bulletPoints: []
        };
        setResumeData(prev => ({
          ...prev,
          workExperience: [...(prev.workExperience || workExperience), newWork]
        }));
      };

      const updateWorkExperience = (workId: string, updates: Partial<{
        company: string;
        position: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        bulletPoints: Array<{ id: string; description: string }>;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).map(work =>
            work.id === workId ? { ...work, ...updates } : work
          )
        }));
      };

      const deleteWorkExperience = (workId: string) => {
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).filter(work => work.id !== workId)
        }));
      };

      const addBulletPoint = (workId: string, description: string = "") => {
        const newBulletId = Math.random().toString();
        const newBullet = { id: newBulletId, description: description };
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).map(work =>
            work.id === workId ? { ...work, bulletPoints: [...work.bulletPoints, newBullet] } : work
          )
        }));
        setEditingBulletId(newBulletId);
      };



      const updateBulletPoint = (workId: string, bulletId: string, description: string) => {
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).map(work =>
            work.id === workId ? {
              ...work,
              bulletPoints: work.bulletPoints.map(bullet =>
                bullet.id === bulletId ? { ...bullet, description } : bullet
              )
            } : work
          )
        }));
      };

      const deleteBulletPoint = (workId: string, bulletId: string) => {
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).map(work =>
            work.id === workId ? {
              ...work,
              bulletPoints: work.bulletPoints.filter(bullet => bullet.id !== bulletId)
            } : work
          )
        }));
      };



      // Custom Sortable Bullet Point Component
      const SortableBulletPoint = ({ bullet, workId, onUpdate }: {
        bullet: { id: string; description: string };
        workId: string;
        onUpdate: (workId: string, bulletId: string, description: string) => void;
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
                  onChange={(e) => onUpdate(workId, bullet.id, e.target.value)}
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
                  onClick={() => deleteBulletPoint(workId, bullet.id)}
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

      const handleWorkDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const newWorkExperience = Array.from((resumeData.workExperience || workExperience));
        const [removed] = newWorkExperience.splice(result.source.index, 1);
        newWorkExperience.splice(result.destination.index, 0, removed);
        
        setResumeData((prev: ResumeData) => ({ ...prev, workExperience: newWorkExperience }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Professional Experience
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete button clicked for section: Work Experience');
                handleDeleteSection('Work Experience');
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
          
          <DragDropContext onDragEnd={handleWorkDragEnd}>
            <Droppable droppableId="work-experience" type="work-experience">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.workExperience || workExperience).length === 0 ? 10 : 100 }}>
                  {(resumeData.workExperience || workExperience).map((work, workIndex) => (
                    <React.Fragment key={work.id}>
                      <Draggable draggableId={work.id} index={workIndex}>
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
                            {/* Work Experience Header with Drag Handle */}
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
                                value={work.company || ''}
                                onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                                placeholder="New Company..."
                                variant="standard"
                                sx={{ 
                                  fontWeight: 600,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (work.company && work.company.trim()) ? 'transparent' : '#f5f5f5',
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
                                onClick={() => deleteWorkExperience(work.id)}
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

                            {/* Dates */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={work.startDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      console.log('Updating start date:', date);
                                      updateWorkExperience(work.id, { startDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="Start Date"
                                sx={{ 
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (work.startDate && work.startDate.trim()) ? 'transparent' : '#f5f5f5',
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
                                value={work.endDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      console.log('Updating end date:', date);
                                      updateWorkExperience(work.id, { endDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="End Date"
                                sx={{ 
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (work.endDate && work.endDate.trim()) ? 'transparent' : '#f5f5f5',
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

                            {/* Location */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={work.location || ''}
                                onChange={(e) => updateWorkExperience(work.id, { location: e.target.value })}
                                placeholder="Location..."
                                sx={{ 
                                  width: 240,
                                  height: 28,
                                  backgroundColor: (work.location && work.location.trim()) ? 'transparent' : '#f5f5f5',
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

                            {/* Job Title */}
                            <Box sx={{ mb: 1, pl: 3 }}>
                              <TextField
                                value={work.position || ''}
                                onChange={(e) => updateWorkExperience(work.id, { position: e.target.value })}
                                placeholder="Job Title..."
                                variant="standard"
                                sx={{ 
                                  fontWeight: 400,
                                  pl: 1,
                                  height: 28,
                                  width: 240,
                                  backgroundColor: (work.position && work.position.trim()) ? 'transparent' : '#f5f5f5',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 2,
                                  }
                                }}
                                InputProps={{
                                  style: { fontWeight: 400, fontSize: '0.875rem', height: 28 },
                                  disableUnderline: true,
                                }}
                              />
                            </Box>

                            {/* Bullet Points */}
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event: DragEndEvent) => {
                                const { active, over } = event;
                                
                                if (active.id !== over?.id) {
                                  const currentWork = (resumeData.workExperience || workExperience).find(w => w.id === work.id);
                                  if (!currentWork) return;
                                  
                                  const oldIndex = currentWork.bulletPoints.findIndex(bullet => bullet.id === active.id);
                                  const newIndex = currentWork.bulletPoints.findIndex(bullet => bullet.id === over?.id);
                                  
                                  const newBulletPoints = arrayMove(currentWork.bulletPoints, oldIndex, newIndex);
                                  updateWorkExperience(work.id, { bulletPoints: newBulletPoints });
                                }
                              }}
                            >
                              <SortableContext items={work.bulletPoints.map(bullet => bullet.id)}>
                                <Box sx={{ pl: 3, mb: 1 }}>
                                  {work.bulletPoints.map((bullet) => (
                                                                      <SortableBulletPoint
                                    key={bullet.id}
                                    bullet={bullet}
                                    workId={work.id}
                                    onUpdate={updateBulletPoint}
                                  />
                                  ))}
                                </Box>
                              </SortableContext>
                            </DndContext>

                            {/* Add bullet point button */}
                            <Box sx={{ pl: 3 }}>
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addBulletPoint(work.id)}
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

          {/* Add Work Experience button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addWorkExperience}
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
              Work Experience
            </Button>
          </Box>
        </Box>
      );
    },
    "Education": (resumeData, setResumeData) => {
      // Initialize education if not exists
      const education = resumeData.education || [
        {
          institution: "University of Technology",
          degree: "Bachelor's Degree",
          field: "Computer Science",
          startDate: "Sep 2020",
          endDate: "May 2024",
          current: false,
          gpa: 3.8,
        }
      ];

      const addEducation = () => {
        const newEducation = {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          current: false,
          gpa: undefined,
        };
        setResumeData(prev => ({
          ...prev,
          education: [...(prev.education || education), newEducation]
        }));
      };

      const updateEducation = (index: number, updates: Partial<{
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
        current: boolean;
        gpa?: number;
      }>) => {
        setResumeData(prev => ({
          ...prev,
          education: (prev.education || education).map((edu, i) =>
            i === index ? { ...edu, ...updates } : edu
          )
        }));
      };

      const deleteEducation = (index: number) => {
        setResumeData(prev => ({
          ...prev,
          education: (prev.education || education).filter((_, i) => i !== index)
        }));
      };

      const handleEducationDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const newEducation = Array.from((resumeData.education || education));
        const [removed] = newEducation.splice(result.source.index, 1);
        newEducation.splice(result.destination.index, 0, removed);
        
        setResumeData(prev => ({ ...prev, education: newEducation }));
      };

      return (
        <Box sx={{ py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Education
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete button clicked for section: Education');
                handleDeleteSection('Education');
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
          
          <DragDropContext onDragEnd={handleEducationDragEnd}>
            <Droppable droppableId="education" type="education">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.education || education).length === 0 ? 10 : 100 }}>
                  {(resumeData.education || education).map((edu, eduIndex) => (
                    <React.Fragment key={eduIndex}>
                      <Draggable draggableId={`education-${eduIndex}`} index={eduIndex}>
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
                            {/* Education Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 600 }}>
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
                                value={edu.institution || ''}
                                onChange={(e) => updateEducation(eduIndex, { institution: e.target.value })}
                                placeholder="Institution..."
                                variant="standard"
                                sx={{ 
                                  fontWeight: 600,
                                  width: 380,
                                  px: 1,
                                  mr: 1,
                                  borderRadius: 2,
                                  backgroundColor: (edu.institution && edu.institution.trim()) ? 'transparent' : '#f5f5f5',
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
                                onClick={() => deleteEducation(eduIndex)}
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

                            {/* Degree and Field */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 1, pl: 3 }}>
                              <TextField
                                size="small"
                                value={edu.degree || ''}
                                onChange={(e) => updateEducation(eduIndex, { degree: e.target.value })}
                                placeholder="Degree"
                                sx={{ 
                                  width: 150,
                                  height: 28,
                                  backgroundColor: (edu.degree && edu.degree.trim()) ? 'transparent' : '#f5f5f5',
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
                                value={edu.field || ''}
                                onChange={(e) => updateEducation(eduIndex, { field: e.target.value })}
                                placeholder="Field of Study"
                                sx={{ 
                                  width: 180,
                                  height: 28,
                                  backgroundColor: (edu.field && edu.field.trim()) ? 'transparent' : '#f5f5f5',
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
                                value={edu.startDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateEducation(eduIndex, { startDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="Start Date"
                                sx={{ 
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (edu.startDate && edu.startDate.trim()) ? 'transparent' : '#f5f5f5',
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
                                value={edu.endDate || ''}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDatePickerPosition({
                                    x: rect.left,
                                    y: rect.bottom + 5
                                  });
                                  datePickerCallbackRef.current = (date: string) => {
                                    if (date) {
                                      updateEducation(eduIndex, { endDate: date });
                                    }
                                  };
                                  setDatePickerOpen(true);
                                }}
                                placeholder="End Date"
                                sx={{ 
                                  width: 90,
                                  height: 28,
                                  backgroundColor: (edu.endDate && edu.endDate.trim()) ? 'transparent' : '#f5f5f5',
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

                            {/* GPA */}
                            <Box sx={{ pl: 3 }}>
                              <TextField
                                size="small"
                                value={typeof edu.gpa === 'string' ? edu.gpa : (edu.gpa || '')}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow typing decimal numbers more freely
                                  if (value === '') {
                                    updateEducation(eduIndex, { gpa: undefined });
                                  } else if (/^\d*\.?\d*$/.test(value)) {
                                    // Allow partial decimal input during typing
                                    if (value.endsWith('.') || value === '.') {
                                      // Store as string temporarily during typing
                                      updateEducation(eduIndex, { gpa: value as unknown as number });
                                    } else {
                                      const numValue = parseFloat(value);
                                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 4.0) {
                                        updateEducation(eduIndex, { gpa: numValue });
                                      }
                                    }
                                  }
                                }}
                                placeholder="GPA (optional)"
                                sx={{ 
                                  width: 120,
                                  height: 28,
                                  backgroundColor: (edu.gpa !== undefined && edu.gpa !== null) ? 'transparent' : '#f5f5f5',
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

          {/* Add Education button */}
          <Box sx={{ ml: -1.5 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addEducation}
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
              Education
            </Button>
          </Box>
        </Box>
      );
    },
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
                console.log('Delete button clicked for section: Courses');
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
                console.log('Delete button clicked for section: Interests');
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
                console.log('Delete button clicked for section: Projects');
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
                console.log('Delete button clicked for section: Languages');
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
                console.log('Delete button clicked for section: Publications');
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
                console.log('Delete button clicked for section: Awards');
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
                console.log('Delete button clicked for section: Volunteer Experience');
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
                console.log('Delete button clicked for section: References');
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
    // TODO: Implement PDF download with export settings
    console.log('Downloading PDF with settings:', exportSettings);
    // For now, just close the panel
    setExportPanelOpen(false);
  };

  const handleDownloadWord = async () => {
    // TODO: Implement Word download with export settings
    console.log('Downloading Word with settings:', exportSettings);
    // For now, just close the panel
    setExportPanelOpen(false);
  };

  const handleResetFormatting = () => {
    setExportSettings({
      template: 'standard',
      fontFamily: 'Times New Roman',
      nameSize: 25,
      sectionHeadersSize: 11,
      subHeadersSize: 10.5,
      bodyTextSize: 10,
      sectionSpacing: 2,
      entrySpacing: 0,
      lineSpacing: 12,
      topBottomMargin: 26,
      sideMargins: 36,
      alignTextLeftRight: false,
    });
  };

  return (
    <Box sx={{ 
      mr: {xs: 0, md: 20},
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

      {/* Resume Tab Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        {/* Left: Close, PRIMARY badge, Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton 
            size="small" 
            sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            onClick={() => router.push('/dashboard/resume')}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e0e0e0',
                borderRadius: 2,
                px: 0.2,
                py: 0.1,
                minHeight: 28,
              }}
            >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: 1.5,
                background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                mr: 1,
              }}
            >
              <StarIcon sx={{ fontSize: 14, color: 'black' }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
                fontSize: '0.875rem',
                pr: 1,
              }}
            >
              {resumeData.title || 'Resume Title'}
            </Typography>
                      </Box>
        </Box>
        {/* Right: Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button
                variant="text"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditFormData({
                    title: resumeData.title,
                    jobTitle: resumeData.jobTitle || "",
                  });
                  setEditResumeInfoOpen(true);
                }}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 500,
                backgroundColor: 'white',
                border: 'none',
                color: 'black',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#fafafa',
                }
              }}
            >
            Edit Resume Info
          </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportClick}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 500,
                backgroundColor: 'white',
                border: 'none',
                color: 'black',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#fafafa',
                }
              }}
            >
              Export
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 500,
                backgroundColor: 'white',
                border: 'none',
                color: '#ccc',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#fafafa',
                }
              }}
              disabled
            >
            Delete
          </Button>
        </Box>
      </Box>
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
                background: '#e0e0e0',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#c0c0c0',
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
                console.log('Available sections:', availableSections);
                console.log('Current sectionOrder:', sectionOrder);
                console.log('Deleted sections:', resumeData.deletedSections);
                console.log('Filtered sections:', filteredSections);
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
          console.log('DatePicker onClose called');
          setDatePickerOpen(false);
          // Don't clear the callback at all - let onSelect handle it
        }}
        onSelect={(date: string) => {
          console.log('Date selected:', date);
          console.log('datePickerCallbackRef exists:', !!datePickerCallbackRef.current);
          
          if (datePickerCallbackRef.current) {
            console.log('Calling datePickerCallbackRef with date:', date);
            datePickerCallbackRef.current(date);
            console.log('datePickerCallbackRef completed');
          } else {
            console.log('No callback available, date picker will not update the field');
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
            width: 1150,
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
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                marginLeft: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#b0b0b0',
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#909090',
              },
              '&::-webkit-scrollbar-button': {
                display: 'block',
                height: '8px',
                border: 'none',
              },
              '&::-webkit-scrollbar-button:hover': {
                // No background
              },
            }}>

              


              {/* Resume Preview */}
              <Box sx={{ 
                overflow: 'visible',
                height: 'calc(100vh - 200px)', // Extend to bottom of export panel
              }}>
                {/* Transform data for ClassicResumeTemplate */}
                {(() => {
                  // Debug: Log the section order being passed to template
                  console.log('🎯 ResumeEditorV2 - Current sectionOrder:', sectionOrder);
                  console.log('🎯 ResumeEditorV2 - ResumeData sectionOrder:', resumeData.sectionOrder);
                  
                  const transformedData = {
                    title: resumeData.title,
                    jobTitle: resumeData.jobTitle,
                    profilePicture: resumeData.profilePicture,
                    sectionOrder: sectionOrder, // Add sectionOrder to transformed data
                    content: resumeData.content,
                    strengths: resumeData.strengths,
                    skillCategories: resumeData.skillCategories,
                    workExperience: resumeData.workExperience.map(exp => ({
                      company: exp.company,
                      position: exp.position,
                      startDate: exp.startDate,
                      endDate: exp.endDate,
                      current: exp.current,
                      city: exp.location,
                      bulletPoints: exp.bulletPoints
                    })),
                    education: resumeData.education,
                    courses: resumeData.courses,
                    interests: resumeData.interests,
                    projects: resumeData.projects,
                    languages: resumeData.languages,
                    publications: resumeData.publications,
                    awards: resumeData.awards,
                    volunteerExperience: resumeData.volunteerExperience,
                    references: resumeData.references
                  };

                  
                  return (
                    <Box sx={{ 
                      transform: 'scale(0.80)', 
                      transformOrigin: 'top left',
                      width: '125%', // 100% / 0.80 = 125%
                      height: '125%',
                    }}>
                      <ClassicResumeTemplate data={transformedData} />
                    </Box>
                  );
                })()}
              </Box>
            </Box>

            {/* Right Column - Resume Template Settings */}
            <Box sx={{ 
              width: '35%',
              overflowY: 'auto', 
              px: 0.5,
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                marginLeft: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#b0b0b0',
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#909090',
              },
              '&::-webkit-scrollbar-button': {
                display: 'block',
                height: '8px',
                border: 'none',
              },
              '&::-webkit-scrollbar-button:hover': {
                // No background
              },
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
                    value={exportSettings.template}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, template: e.target.value }))}
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
                    <MenuItem value="standard" sx={{ fontSize: 14 }}>Letter (8.5&quot; x 11&quot;)</MenuItem>
                    <MenuItem value="compact" sx={{ fontSize: 14 }}>Compact</MenuItem>
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
                  onClick={() => setExportSettings(prev => ({ ...prev, template: 'standard' }))}
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
                  onClick={() => setExportSettings(prev => ({ ...prev, template: 'compact' }))}
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
                  <InfoIcon sx={{ color: '#666', fontSize: 14 }} />
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
                          },
                        },
                      }}
                    >
                      {[18, 19, 20, 21, 22, 23, 24, 25, 26].map((size) => (
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                    </Box>
                    <Slider
                      value={exportSettings.sectionSpacing}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, sectionSpacing: value as number }))}
                      min={0}
                      max={10}
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
                    </Box>
                    <Slider
                      value={exportSettings.entrySpacing}
                      onChange={(_, value) => setExportSettings(prev => ({ ...prev, entrySpacing: value as number }))}
                      min={0}
                      max={10}
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
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
                      <InfoIcon sx={{ color: '#666', fontSize: 16 }} />
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
              sx={{
                borderRadius: 6,
                backgroundColor: '#000',
                color: 'white',
                textTransform: 'none',
                fontSize: 16,
                boxShadow: 'none',
              }}
            >
              Download by PDF
            </Button>
            <Button
              variant="contained"
              onClick={handleDownloadWord}
              sx={{
                borderRadius: 6,
                backgroundColor: '#000',
                color: 'white',
                textTransform: 'none',
                fontSize: 16,
                boxShadow: 'none',
              }}
            >
              Download by Word(.docx)
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
);
} 

