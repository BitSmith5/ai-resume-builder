"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  Download as DownloadIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Close as CloseIcon,
  Star as StarIcon,
  List as ListIcon,
  TrendingFlat as TrendingFlatIcon,
} from "@mui/icons-material";

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
// import { useDebouncedCallback } from 'use-debounce';



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
  const { data: session } = useSession();
  const [loading] = useState(false);
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
  const [datePickerType, setDatePickerType] = useState<'start' | 'end' | null>(null);
  const [datePickerWorkId, setDatePickerWorkId] = useState<string | null>(null);
  const [datePickerCallback, setDatePickerCallback] = useState<((date: string) => void) | null>(null);
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editingDateField, setEditingDateField] = useState<'start' | 'end' | null>(null);
  const datePickerCallbackRef = React.useRef<((date: string) => void) | null>(null);

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

  const [sectionOrder, setSectionOrder] = useState([
    "Personal Info",
    "Professional Summary",
    "Technical Skills",
    "Work Experience",
    "Education & Certificates",
    "Courses",
    "Interests",
  ]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "",
    jobTitle: "",
    template: "modern",
    profilePicture: "",
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
                      backgroundColor: 'rgb(100, 248, 179)',
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
                      backgroundColor: 'rgb(100, 248, 179)',
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
                  color: '#22c55e',
                  '&:hover': {
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
      }
    };
    
    if (session?.user) {
      loadProfileData();
    }
  }, [session]);

  // Auto-populate common sections when creating a new resume
  useEffect(() => {
    if (!resumeId && !loading) {
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
        education: [
          {
            institution: "",
            degree: "Bachelor's Degree",
            field: "",
            startDate: "",
            endDate: "",
            current: false,
          },
        ],
      }));
    }
  }, [resumeId, loading]);

  // Debounced autosave
  // const debouncedSave = useDebouncedCallback(async (data: ResumeData, template: string) => {
  //   setSaveStatus('saving');
  //   try {
  //     const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";
  //     const method = resumeId ? "PUT" : "POST";
  //     const response = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...data, template }),
  //     });
  //     if (response.ok) {
  //       setSaveStatus('saved');
  //     } else {
  //       setSaveStatus('error');
  //     }
  //   } catch {
  //     setSaveStatus('error');
  //   }
  // }, 1000);

  // useEffect(() => {
  //   if (loading) return;
  //   setSaveStatus('idle');
  //   debouncedSave(resumeData, selectedTemplate);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps


  // Handle drag end for section reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(sectionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setSectionOrder(newOrder);
  };

  const handleAddSection = (sectionName: string) => {
    if (!sectionOrder.includes(sectionName)) {
      setSectionOrder(prev => [...prev, sectionName]);
    }
    setAddSectionPopupOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          
          {/* Contact Information Row */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 3, flexWrap: "wrap" }}>
            {profileData.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{profileData.email}</Typography>
              </Box>
            )}
            {profileData.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{formatPhoneNumber(profileData.phone)}</Typography>
              </Box>
            )}
            {profileData.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2">{profileData.location}</Typography>
              </Box>
            )}
          </Box>
          
          {/* Professional Links Row */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{
              bgcolor: '#f5f5f5', 
              borderRadius: 2,
              minWidth: 270,
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

            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              borderRadius: 2,
              minWidth: 270,
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

            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              borderRadius: 2,
              minWidth: 270,
              overflow: 'hidden'
            }}>
              {/* Portfolio */}
              <Box sx={{ 
                display: "flex",
                direction: "row",
                alignItems: "center", 
                gap: 0.3, 
                p: 1,
              }}>
                <WebsiteIcon fontSize="small" />
                <Typography variant="body2" fontWeight={500}>Portfolio</Typography>
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
                  placeholder="https://yourportfolio.com"
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
      );
    },
    "Professional Summary": (resumeData, setResumeData) => (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Professional Summary
          </Typography>
                      <IconButton
              size="small"
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
      const skillCategories = resumeData.skillCategories || [
        {
          id: 'web-development',
          title: 'Web Development',
          skills: resumeData.strengths.map(skill => ({ id: Math.random().toString(), name: skill.skillName }))
        }
      ];



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
            {...attributes}
            {...listeners}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: isDragging ? '#e3f2fd' : '#f5f5f5',
              borderRadius: 2,
              px: 0.5,
              py: 1,
              border: isDragging ? '2px solid #2196f3' : 'none',
              margin: 0.5,
              flexShrink: 0,
              transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'none',
              transition: 'all 0.2s ease',
              boxShadow: isDragging ? '0 4px 12px rgba(33, 150, 243, 0.3)' : 'none',
              zIndex: isDragging ? 1000 : 'auto',
              cursor: 'grab',
              '&:hover': {
                bgcolor: '#e8f5e8',
                transform: 'scale(1.02)',
              },
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 20, mr: 0.5, color: '#999' }} />
            <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
              {skill.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onDelete(categoryId, skill.id)}
              sx={{ p: 0.5, backgroundColor: 'white', borderRadius: "50%", mr: 0.5 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Technical Skills
            </Typography>
            <IconButton
              size="small"
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
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 100 }}>
                  {(resumeData.skillCategories || skillCategories).map((category, categoryIndex) => (
                    <Draggable key={category.id} draggableId={category.id} index={categoryIndex}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 2,
                            background: snapshot.isDragging ? '#f5f5f5' : 'white',
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
          <Box>
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

      const deleteBulletPoint = (workId: string, bulletId: string) => {
        setResumeData(prev => ({
          ...prev,
          workExperience: (prev.workExperience || workExperience).map(work =>
            work.id === workId ? { ...work, bulletPoints: work.bulletPoints.filter(bullet => bullet.id !== bulletId) } : work
          )
        }));
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



      // Custom Sortable Bullet Point Component
      const SortableBulletPoint = ({ bullet, workId, onDelete, onUpdate }: {
        bullet: { id: string; description: string };
        workId: string;
        onDelete: (workId: string, bulletId: string) => void;
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
                },
              }}
            >
              {isEditing ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0 }}>•</Typography>
                <Box sx={{ flex: 1 }}>
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
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    paddingLeft: '0',
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
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                <Typography sx={{ ml: 1, mr: 0.5, color: 'black', fontSize: '0.875rem', flexShrink: 0 }}>•</Typography>
                <Typography 
                  component="span" 
                  onClick={() => setEditingBulletId(bullet.id)}
                  sx={{ 
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    color: isPlaceholder ? '#999' : 'black',
                    flex: 1,
                    cursor: 'text',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                    }
                  }}
                >
                  {bullet.description}
                </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Professional Experience
            </Typography>
            <IconButton
              size="small"
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
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 3,
                              background: snapshot.isDragging ? '#f5f5f5' : 'white',
                              p: 2,
                            }}
                          >
                            {/* Work Experience Header with Drag Handle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
                                      onDelete={deleteBulletPoint}
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
          <Box>
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
    // Add more sections as needed...
  };

  return (
    <Box sx={{ 
      width: "100%", 
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: "relative",
      height: "calc(100vh - 64px)",
    }}>
      {/* Save status indicator */}
      {/* <Box sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        p: 2,
        minHeight: 40,
      }}>
        {saveStatus === 'saving' && <Typography color="text.secondary" fontSize={14}>Saving...</Typography>}
        {saveStatus === 'saved' && <Typography color="success.main" fontSize={14}>Saved</Typography>}
        {saveStatus === 'error' && <Typography color="error.main" fontSize={14}>Error saving</Typography>}
      </Box> */}
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
          <IconButton size="small" sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
                background: 'linear-gradient(90deg,rgb(165, 235, 168) 0%,rgb(135, 241, 245) 100%)',
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
            background: 'linear-gradient(90deg, #86efac 0%, #ffffff 100%)',
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
          <Box sx={{
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="main-section-list" type="main-section">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {sectionOrder.map((section, idx) => (
                      <React.Fragment key={section}>
                        <Draggable draggableId={section} index={idx}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'stretch',
                                background: snapshot.isDragging ? '#fff' : 'none',
                                border: snapshot.isDragging ? '1px solid #e0e0e0' : 'none',
                                borderRadius: 2,
                                mb: 0,
                                zIndex: snapshot.isDragging ? 1200 : 'auto',
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
          right: 30,
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          size="large"
          sx={{ 
            borderRadius: "50%", 
            width: 60, 
            height: 60, 
            background: 'rgb(100, 248, 179)',
            boxShadow: 'none',
            '&:hover': {
              background: 'rgb(80, 228, 159)',
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
              <List sx={{ px: 0, pt: 0, pb: 0 }}>
                {sectionOrder.map((section) => (
                  <ListItem
                    key={section}
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
                    }}
                    secondaryAction={
                      <IconButton size="small" edge="end" sx={{ ml: 1 }}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.2, cursor: 'grab' }}>
                      <DragIndicatorIcon sx={{ color: '#bdbdbd', fontSize: 22 }} />
                    </Box>
                    <ListItemText
                      primary={section}
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem', color: '#222' }}
                    />
                  </ListItem>
                ))}
              </List>
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
            
            {/* Add New Section Popup - Overlay within Edit Resume Layout */}
            {isClient && addSectionPopupOpen && (
              <>
                {/* Backdrop overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 18,
                    borderBottomLeftRadius: 18,
                    borderBottomRightRadius: 18,  
                    background: 'rgba(0,0,0,0.3)',
                    zIndex: 1,
                  }}
                  onClick={() => setAddSectionPopupOpen(false)}
                />
                {/* Popup content */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    borderRadius: '18px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    m: 1,
                    zIndex: 2,
                    maxHeight: '300px',
                    overflowY: 'hidden',
                  }}
                >
                  <List sx={{ px: 0, pt: 0, pb: 0 }}>
                    {[
                      'Work Experience',
                      'Education',
                      'Certifications',
                      'Projects',
                      'Languages',
                      'Publications',
                      'Awards',
                      'Volunteer Experience',
                      'Interests',
                      'References'
                    ].filter(section => !sectionOrder.includes(section)).map((section) => (
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
              </>
            )}
          </Box>
        </>
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
                onClick={() => {
                  setResumeData(prev => ({
                    ...prev,
                    title: editFormData.title,
                    jobTitle: editFormData.jobTitle,
                  }));
                  setEditResumeInfoOpen(false);
                }}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  background: 'rgb(100, 248, 179)',
                  color: '#222',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    background: 'rgb(80, 228, 159)',
                  },
                }}
              >
                Update
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
);
} 