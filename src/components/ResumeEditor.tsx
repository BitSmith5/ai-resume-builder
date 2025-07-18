"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import ResumeTemplateRegistry, {
  AVAILABLE_TEMPLATES,
} from "./ResumeTemplateRegistry";
import { storeImage, getImage, deleteImage } from "@/lib/imageStorage";
// import { generateResumePDF } from './ResumePDF';

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
  { value: '🏔️', label: 'Hiking' },
  { value: '🏖️', label: 'Beach' },
  { value: '🎿', label: 'Skiing' },
  { value: '🏄‍♂️', label: 'Surfing' },
  { value: '🎾', label: 'Tennis' },
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
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{
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

interface ResumeEditorProps {
  resumeId?: string;
  onSave?: () => void;
  template?: string;
  showPreview?: boolean;
}

export default function ResumeEditor({
  resumeId,
  onSave,
  template,
}: ResumeEditorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    template || "modern",
  );
  const [newSkillIndex, setNewSkillIndex] = useState<number | null>(null);
  const [newWorkIndex, setNewWorkIndex] = useState<number | null>(null);
  const [newEducationIndex, setNewEducationIndex] = useState<number | null>(
    null,
  );
  const [newCourseIndex, setNewCourseIndex] = useState<number | null>(null);
  const [newInterestIndex, setNewInterestIndex] = useState<number | null>(null);
  const skillNameRefs = useRef<(HTMLInputElement | null)[]>([]);
  const workCompanyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const educationInstitutionRefs = useRef<(HTMLInputElement | null)[]>([]);
  const courseTitleRefs = useRef<(HTMLInputElement | null)[]>([]);
  const interestNameRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicError, setProfilePicError] = useState("");
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(null);
  const [removedProfilePicture, setRemovedProfilePicture] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Robust React-based zooming with aspect ratio preservation
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function updateZoom() {
      if (!wrapperRef.current) return;
      const width = wrapperRef.current.offsetWidth;
      const scaleW = width / 850;
      // Ensure we scale down on small screens, but not too much
      const newZoom = Math.max(Math.min(scaleW, 1), 0.3);
      setZoom(newZoom);
    }
    
    // Only calculate zoom when client-side rendering is ready
    if (!isClient) return;
    
    // Initial calculation
    updateZoom();
    
    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateZoom();
    });
    
    // Also use a small delay to catch any late layout changes
    const timeoutId = setTimeout(updateZoom, 100);
    
    // Use ResizeObserver to detect container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (wrapperRef.current) {
      resizeObserver = new ResizeObserver(updateZoom);
      resizeObserver.observe(wrapperRef.current);
    }
    
    window.addEventListener("resize", updateZoom);
    
    return () => {
      window.removeEventListener("resize", updateZoom);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [selectedTemplate, isClient]); // Recalculate when template changes or client is ready

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

  const loadResume = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.ok) {
        const resume = await response.json();
        

        // Try to load the profile picture from localStorage
        let profilePictureUrl = resume.profilePicture || "";
        if (profilePictureUrl && !profilePictureUrl.startsWith('data:')) {
          // This is an image ID, try to get the actual image from localStorage
          const storedImage = getImage(profilePictureUrl);
          if (storedImage) {
            profilePictureUrl = storedImage;
          } else {
            // Image not found in localStorage, clear the reference
            profilePictureUrl = "";
          }
        }

        setResumeData({
          title: resume.title,
          jobTitle: resume.jobTitle || "",
          template: resume.template || "modern",
          profilePicture: profilePictureUrl,
          content: {
            ...resume.content,
            personalInfo: {
              name: resume.content.personalInfo?.name || "",
              email: resume.content.personalInfo?.email || "",
              phone: resume.content.personalInfo?.phone || "",
              city: resume.content.personalInfo?.city || "",
              state: resume.content.personalInfo?.state || "",
              summary: resume.content.personalInfo?.summary || "",
              website: resume.content.personalInfo?.website || "",
              linkedin: resume.content.personalInfo?.linkedin || "",
              github: resume.content.personalInfo?.github || "",
            },
          },
          strengths: resume.strengths,
          workExperience: resume.workExperience,
          education: resume.education,
          courses: resume.courses || [],
          interests: resume.interests || [],
        });
        
        // Clear any local profile picture state when loading from database
        setLocalProfilePicture(null);
        setRemovedProfilePicture(null);
      } else {
        setError("Failed to load resume");
      }
    } catch {
      setError("Failed to load resume");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Recalculate zoom when client becomes ready
  useEffect(() => {
    if (isClient && wrapperRef.current) {
      const updateZoom = () => {
        if (!wrapperRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const scaleW = width / 850;
        const newZoom = Math.max(Math.min(scaleW, 1), 0.3);
        setZoom(newZoom);
      };
      
      // Immediate calculation
      updateZoom();
      
      // Delayed calculation to ensure layout is stable
      const timeoutId = setTimeout(updateZoom, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isClient]);

  useEffect(() => {
    if (resumeId && isClient) {
      loadResume();
    }
  }, [resumeId, loadResume, isClient]);

  // Update selectedTemplate when resume data is loaded (only if different from current)
  useEffect(() => {
    if (resumeData.template && !loading && isClient && resumeData.template !== selectedTemplate) {
      setSelectedTemplate(resumeData.template);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData.template, loading, isClient]); // Removed selectedTemplate to prevent infinite loop

  // Handle template prop changes
  useEffect(() => {
    if (template && template !== selectedTemplate) {
      setSelectedTemplate(template);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]); // Removed selectedTemplate to prevent infinite loop

  // Cleanup effect for local profile picture
  useEffect(() => {
    return () => {
      // Clear local profile picture when component unmounts
      setLocalProfilePicture(null);
    };
  }, []);

  // Focus on new fields when items are added
  useEffect(() => {
    // Focus on new skill name field
    if (newSkillIndex !== null && skillNameRefs.current[newSkillIndex]) {
      const input = skillNameRefs.current[newSkillIndex];
      if (input) {
        input.focus();
        setNewSkillIndex(null);
      }
    }

    // Focus on new work experience company field
    if (newWorkIndex !== null && workCompanyRefs.current[newWorkIndex]) {
      const input = workCompanyRefs.current[newWorkIndex];
      if (input) {
        input.focus();
        setNewWorkIndex(null);
      }
    }

    // Focus on new education institution field
    if (
      newEducationIndex !== null &&
      educationInstitutionRefs.current[newEducationIndex]
    ) {
      const input = educationInstitutionRefs.current[newEducationIndex];
      if (input) {
        input.focus();
        setNewEducationIndex(null);
      }
    }

    // Focus on new course title field
    if (newCourseIndex !== null && courseTitleRefs.current[newCourseIndex]) {
      const input = courseTitleRefs.current[newCourseIndex];
      if (input) {
        input.focus();
        setNewCourseIndex(null);
      }
    }

    // Focus on new interest name field
    if (newInterestIndex !== null && interestNameRefs.current[newInterestIndex]) {
      const input = interestNameRefs.current[newInterestIndex];
      if (input) {
        input.focus();
        setNewInterestIndex(null);
      }
    }
  }, [
    newSkillIndex,
    newWorkIndex,
    newEducationIndex,
    newCourseIndex,
    newInterestIndex,
    resumeData.strengths.length,
    resumeData.workExperience.length,
    resumeData.education.length,
    resumeData.courses.length,
    resumeData.interests.length,
  ]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let finalProfilePicture = resumeData.profilePicture;
      
      // If there's a local profile picture, process it
      if (localProfilePicture && localProfilePicture.startsWith("data:")) {
        try {
          // Convert base64 to blob
          const response = await fetch(localProfilePicture);
          const blob = await response.blob();
          
          // Create a File object from the blob
          const file = new File([blob], "profile-picture.jpg", { type: blob.type });
          
          // Create FormData and get image ID from server
          const formData = new FormData();
          formData.append("file", file);
          
          const uploadResponse = await fetch("/api/resumes/upload-profile-picture", {
            method: "POST",
            body: formData,
          });
          
          const uploadData = await uploadResponse.json();
          if (uploadResponse.ok && uploadData.filePath) {
            // Store the image in localStorage with the returned ID
            await storeImage(uploadData.filePath, file);
            finalProfilePicture = uploadData.filePath;
            // Clear local image after successful storage
            setLocalProfilePicture(null);
          } else {
            throw new Error(uploadData.error || "Failed to process profile picture");
          }
        } catch (uploadError) {
          console.error("Error processing profile picture:", uploadError);
          setError("Failed to process profile picture. Please try again.");
          setSaving(false);
          return;
        }
      }
      
      // If there's a removed profile picture, delete it from localStorage
      if (removedProfilePicture) {
        try {
          // Delete from localStorage
          deleteImage(removedProfilePicture);
          
          // Also notify the server (for cleanup purposes)
          const deleteResponse = await fetch("/api/resumes/delete-profile-picture", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              filePath: removedProfilePicture,
              source: "save-resume" 
            }),
          });
          
          if (!deleteResponse.ok) {
            console.warn("Failed to notify server about profile picture deletion");
          }
        } catch (error) {
          console.warn("Error deleting profile picture:", error);
        }
        // Clear the removed profile picture reference
        setRemovedProfilePicture(null);
      }

      const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";
      const method = resumeId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...resumeData,
          template: selectedTemplate,
          profilePicture: finalProfilePicture,
        }),
      });

      if (response.ok) {
        setSuccess("Resume saved successfully!");
        // Update the resume data with the uploaded profile picture
        setResumeData((prev) => ({ ...prev, profilePicture: finalProfilePicture }));
        onSave?.();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save resume");
      }
    } catch {
      setError("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const addStrength = () => {
    setResumeData((prev) => {
      const newIndex = prev.strengths.length;
      setNewSkillIndex(newIndex);
      return {
        ...prev,
        strengths: [...prev.strengths, { skillName: "", rating: 5 }],
      };
    });
  };

  const updateStrength = (
    index: number,
    field: "skillName" | "rating",
    value: string | number,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      strengths: prev.strengths.map((strength, i) =>
        i === index ? { ...strength, [field]: value } : strength,
      ),
    }));
  };

  const removeStrength = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index),
    }));
  };

  const addWorkExperience = () => {
    setResumeData((prev) => {
      const newIndex = prev.workExperience.length;
      setNewWorkIndex(newIndex);
      return {
        ...prev,
        workExperience: [
          ...prev.workExperience,
          {
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            bulletPoints: [],
          },
        ],
      };
    });
  };

  const updateWorkExperience = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp,
      ),
    }));
  };

  const addBulletPoint = (workIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === workIndex
          ? {
              ...exp,
              bulletPoints: [...exp.bulletPoints, { description: "" }],
            }
          : exp,
      ),
    }));
  };

  const updateBulletPoint = (
    workIndex: number,
    bulletIndex: number,
    description: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === workIndex
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.map((bullet, j) =>
                j === bulletIndex ? { ...bullet, description } : bullet,
              ),
            }
          : exp,
      ),
    }));
  };

  const removeBulletPoint = (workIndex: number, bulletIndex: number) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) =>
        i === workIndex
          ? {
              ...exp,
              bulletPoints: exp.bulletPoints.filter(
                (_, j) => j !== bulletIndex,
              ),
            }
          : exp,
      ),
    }));
  };

  const removeWorkExperience = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => {
      const newIndex = prev.education.length;
      setNewEducationIndex(newIndex);
      return {
        ...prev,
        education: [
          ...prev.education,
          {
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            current: false,
            gpa: undefined,
          },
        ],
      };
    });
  };

  const updateEducation = (
    index: number,
    field: string,
    value: string | boolean | number | undefined,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu,
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCourse = () => {
    setResumeData((prev) => {
      const newIndex = prev.courses.length;
      setNewCourseIndex(newIndex);
      return {
        ...prev,
        courses: [
          ...prev.courses,
          {
            title: "",
            provider: "",
            link: "",
          },
        ],
      };
    });
  };

  const updateCourse = (
    index: number,
    field: "title" | "provider" | "link",
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === index ? { ...course, [field]: value } : course,
      ),
    }));
  };

  const removeCourse = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index),
    }));
  };

  const addInterest = () => {
    setResumeData((prev) => {
      const newIndex = prev.interests.length;
      setNewInterestIndex(newIndex);
      return {
        ...prev,
        interests: [...prev.interests, { name: "", icon: "🎵" }],
      };
    });
  };

  const updateInterest = (
    index: number,
    field: "name" | "icon",
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      interests: prev.interests.map((interest, i) =>
        i === index ? { ...interest, [field]: value } : interest,
      ),
    }));
  };

  const removeInterest = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleDownloadPDF = async () => {
    if (!resumeId) {
      setError("Please save the resume first before downloading");
      return;
    }

    try {
      setError("");
      setGeneratingPDF(true);
      const response = await fetch(`/api/resumes/${resumeId}/pdf?template=${selectedTemplate}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.title || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading || !isClient) {
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

  return (
    <Box sx={{ 
      width: "100%", 
      display: {xs: "flex", md: "block"},
      flexDirection: {xs: "column", md: "row"},
      alignItems: {xs: "stretch", md: "stretch"}
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

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        width="100%"
        justifyContent="space-between"
        alignItems={{ xs: "center", md: "center" }}
        gap={{ xs: 2, md: 3 }}
        mb={3}
      >
        <TextField
          label="Resume Title"
          value={resumeData.title}
          onChange={(e) =>
            setResumeData((prev) => ({ ...prev, title: e.target.value }))
          }
          sx={{
            minWidth: { xs: "100%", md: 300 },
            "& .MuiInputBase-input:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 1000px white inset !important",
              WebkitTextFillColor: "black !important",
            },
            "& .MuiInputBase-input:-webkit-autofill:hover": {
              WebkitBoxShadow: "0 0 0 1000px white inset !important",
              WebkitTextFillColor: "black !important",
            },
            "& .MuiInputBase-input:-webkit-autofill:focus": {
              WebkitBoxShadow: "0 0 0 1000px white inset !important",
              WebkitTextFillColor: "black !important",
            },
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {saving ? "Saving..." : "Save Resume"}
          </Button>
          <Button
            variant="outlined"
            startIcon={generatingPDF ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {generatingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </Stack>
      </Box>

      {/* Template Selector */}
      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, mb: 3, width: "100%" }}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={{ xs: 1, sm: 2 }}
        >
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              Template Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a template to preview your resume
            </Typography>
          </Box>
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            sx={{
              width: { xs: "100%", sm: "auto" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {isClient ? (
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "100%", sm: "none" },
                }}
              >
                <InputLabel>Template</InputLabel>
                                              <Select
                  value={isClient ? selectedTemplate : "modern"}
                  label="Template"
                  onChange={(e) => {
                    console.log('Template changed from', selectedTemplate, 'to', e.target.value);
                    setSelectedTemplate(e.target.value);
                  }}
                >
                  {AVAILABLE_TEMPLATES.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "100%", sm: "none" },
                  height: 40,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Editor Form and Preview Container */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3} width="100%">
        {/* Editor Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            {isClient && (
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              >
                <Tab label="Personal Info" />
                <Tab label="Skills" />
                <Tab label="Work Experience" />
                <Tab label="Education" />
                <Tab label="Courses" />
                <Tab label="Interests" />
              </Tabs>
            )}

            <Box sx={{ mt: 3 }}>
              {isClient && activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Stack spacing={2}>
                    {/* Profile Picture Upload */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Profile Picture
                      </Typography>
                      {isClient && (
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          {(localProfilePicture || resumeData.profilePicture) && (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: "10%",
                                backgroundImage: `url(${localProfilePicture || resumeData.profilePicture})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                border: "2px solid #e0e0e0",
                                flexShrink: 0,
                              }}
                              onClick={() => {
                                console.log("Profile picture debug:", {
                                  localProfilePicture,
                                  resumeDataProfilePicture: resumeData.profilePicture,
                                  displayUrl: localProfilePicture || resumeData.profilePicture
                                });
                              }}
                            />
                          )}
                          <Box sx={{ flex: 1}}>
                            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                              <Button
                                variant="outlined"
                                component="label"
                                disabled={uploadingProfilePic}
                              >
                                {uploadingProfilePic ? "Processing..." : "Select Image"}
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/heic, image/heif"
                                  hidden
                                  onChange={async (e) => {
                                    setProfilePicError("");
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (!["image/png", "image/jpeg", "image/heic", "image/heif"].includes(file.type)) {
                                      setProfilePicError("Only PNG, JPG, or HEIC/HEIF allowed");
                                      return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                      setProfilePicError("File size must be less than 5MB");
                                      return;
                                    }
                                    setUploadingProfilePic(true);
                                    try {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const base64 = event.target?.result as string;
                                        setLocalProfilePicture(base64);
                                        // Clear any existing profile picture path and set the new base64 data
                                        setResumeData((prev) => ({ ...prev, profilePicture: base64 }));
                                        setUploadingProfilePic(false);
                                        e.target.value = "";
                                      };
                                      reader.onerror = () => {
                                        setProfilePicError("Failed to read image file");
                                        setUploadingProfilePic(false);
                                        e.target.value = "";
                                      };
                                      reader.readAsDataURL(file);
                                    } catch {
                                      setProfilePicError("Failed to process image");
                                      setUploadingProfilePic(false);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  const currentProfilePicture = resumeData.profilePicture;
                                  // Store the removed profile picture path for later deletion on save
                                  if (currentProfilePicture && !currentProfilePicture.startsWith('data:')) {
                                    setRemovedProfilePicture(currentProfilePicture);
                                  }
                                  // Clear from local state and resume data
                                  setResumeData((prev) => ({ ...prev, profilePicture: "" }));
                                  setLocalProfilePicture(null);
                                }}
                                disabled={uploadingProfilePic}
                              >
                                Remove
                              </Button>
                            </Box>
                            {profilePicError && (
                              <Typography color="error" variant="caption">{profilePicError}</Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Max 5MB. PNG, JPG, or HEIC/HEIF (Apple Photos) allowed.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {!isClient && (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "10%",
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={resumeData.content.personalInfo.name}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            personalInfo: {
                              ...prev.content.personalInfo,
                              name: e.target.value,
                            },
                          },
                        }))
                      }
                      sx={{
                        "& .MuiInputBase-input:-webkit-autofill": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:hover": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:focus": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                      }}
                    />
                    <Box
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        label="Email"
                        value={resumeData.content.personalInfo.email}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                email: e.target.value,
                              },
                            },
                          }))
                        }
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        value={resumeData.content.personalInfo.phone}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                phone: formatPhoneNumber(e.target.value),
                              },
                            },
                          }))
                        }
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                    </Box>
                    <Box
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        label="City"
                        value={resumeData.content.personalInfo.city}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                city: e.target.value,
                              },
                            },
                          }))
                        }
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="State"
                        value={resumeData.content.personalInfo.state}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                state: e.target.value,
                              },
                            },
                          }))
                        }
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                    </Box>
                    <Box
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      gap={2}
                    >
                      <TextField
                        fullWidth
                        label="Website"
                        value={resumeData.content.personalInfo.website || ""}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                website: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="https://your-website.com"
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="LinkedIn"
                        value={resumeData.content.personalInfo.linkedin || ""}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              personalInfo: {
                                ...prev.content.personalInfo,
                                linkedin: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="https://linkedin.com/in/your-profile"
                        sx={{
                          "& .MuiInputBase-input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                          "& .MuiInputBase-input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 1000px white inset !important",
                            WebkitTextFillColor: "black !important",
                          },
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="GitHub"
                      value={resumeData.content.personalInfo.github || ""}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            personalInfo: {
                              ...prev.content.personalInfo,
                              github: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="https://github.com/your-username"
                      sx={{
                        "& .MuiInputBase-input:-webkit-autofill": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:hover": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:focus": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={resumeData.jobTitle || ""}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          jobTitle: e.target.value,
                        }))
                      }
                      placeholder="e.g., Senior Software Engineer, Marketing Manager"
                      sx={{
                        "& .MuiInputBase-input:-webkit-autofill": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:hover": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                        "& .MuiInputBase-input:-webkit-autofill:focus": {
                          WebkitBoxShadow:
                            "0 0 0 1000px white inset !important",
                          WebkitTextFillColor: "black !important",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Professional Summary"
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
                    />
                  </Stack>
                </Box>
              )}

              {isClient && activeTab === 1 && (
                <Box>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Skills & Strengths</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addStrength}
                      variant="outlined"
                      size="small"
                    >
                      Add Skill
                    </Button>
                  </Box>
                  {resumeData.strengths.map((strength, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        gap={2}
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <TextField
                          fullWidth
                          label="Skill Name"
                          value={strength.skillName}
                          onChange={(e) =>
                            updateStrength(index, "skillName", e.target.value)
                          }
                          inputRef={(el) => {
                            skillNameRefs.current[index] = el;
                          }}
                          sx={{
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                            "& .MuiInputBase-input:-webkit-autofill:hover": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                            "& .MuiInputBase-input:-webkit-autofill:focus": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                          }}
                        />
                        <TextField
                          type="number"
                          label="Rating (1-10)"
                          value={strength.rating}
                          onChange={(e) =>
                            updateStrength(
                              index,
                              "rating",
                              parseInt(e.target.value) || 5,
                            )
                          }
                          inputProps={{ min: 1, max: 10 }}
                          sx={{
                            width: { xs: "100%", sm: 150 },
                            "& .MuiInputBase-input:-webkit-autofill": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                            "& .MuiInputBase-input:-webkit-autofill:hover": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                            "& .MuiInputBase-input:-webkit-autofill:focus": {
                              WebkitBoxShadow:
                                "0 0 0 1000px white inset !important",
                              WebkitTextFillColor: "black !important",
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => removeStrength(index)}
                          color="error"
                          sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {isClient && activeTab === 2 && (
                <Box>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Work Experience</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addWorkExperience}
                      variant="outlined"
                      size="small"
                    >
                      Add Experience
                    </Button>
                  </Box>
                  {resumeData.workExperience.map((exp, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Company"
                            value={exp.company}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "company",
                                e.target.value,
                              )
                            }
                            inputRef={(el) => {
                              workCompanyRefs.current[index] = el;
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Position"
                            value={exp.position}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "position",
                                e.target.value,
                              )
                            }
                          />
                        </Box>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "startDate",
                                e.target.value,
                              )
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={exp.endDate}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "endDate",
                                e.target.value,
                              )
                            }
                            InputLabelProps={{ shrink: true }}
                            disabled={exp.current}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={exp.current}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "current",
                                    e.target.checked,
                                  )
                                }
                              />
                            }
                            label="Current Position"
                            sx={{ minWidth: "fit-content" }}
                          />
                          <IconButton
                            onClick={() => removeWorkExperience(index)}
                            color="error"
                            sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        {/* Bullet Points Section */}
                        <Box>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                          >
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Bullet Points ({exp.bulletPoints.length})
                            </Typography>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={() => addBulletPoint(index)}
                              variant="outlined"
                              size="small"
                            >
                              Add Bullet Point
                            </Button>
                          </Box>
                          {exp.bulletPoints.map((bullet, bulletIndex) => (
                            <Box
                              key={bulletIndex}
                              sx={{
                                mb: 2,
                                p: 2,
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <Box
                                display="flex"
                                gap={2}
                                alignItems="flex-start"
                              >
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  label={`Bullet Point ${bulletIndex + 1}`}
                                  value={bullet.description}
                                  onChange={(e) =>
                                    updateBulletPoint(
                                      index,
                                      bulletIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Describe your responsibilities, achievements, or contributions..."
                                />
                                <IconButton
                                  onClick={() =>
                                    removeBulletPoint(index, bulletIndex)
                                  }
                                  color="error"
                                  size="small"
                                  sx={{ flexShrink: 0 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                          {exp.bulletPoints.length === 0 && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontStyle: "italic",
                                textAlign: "center",
                                py: 2,
                              }}
                            >
                              No bullet points added yet. Click &quot;Add Bullet
                              Point&quot; to get started.
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}

              {isClient && activeTab === 3 && (
                <Box>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Education</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addEducation}
                      variant="outlined"
                      size="small"
                    >
                      Add Education
                    </Button>
                  </Box>
                  {resumeData.education.map((edu, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Institution"
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "institution",
                                e.target.value,
                              )
                            }
                            inputRef={(el) => {
                              educationInstitutionRefs.current[index] = el;
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Degree"
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(index, "degree", e.target.value)
                            }
                          />
                        </Box>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                        >
                          <TextField
                            fullWidth
                            label="Field of Study"
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(index, "field", e.target.value)
                            }
                          />
                          <TextField
                            fullWidth
                            type="number"
                            label="GPA (optional)"
                            value={edu.gpa || ""}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "gpa",
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                            inputProps={{ min: 0, max: 4, step: 0.01 }}
                          />
                        </Box>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={edu.startDate}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "startDate",
                                e.target.value,
                              )
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={edu.endDate}
                            onChange={(e) =>
                              updateEducation(index, "endDate", e.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                            disabled={edu.current}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={edu.current}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "current",
                                    e.target.checked,
                                  )
                                }
                              />
                            }
                            label="Currently Studying"
                            sx={{ minWidth: "fit-content" }}
                          />
                          <IconButton
                            onClick={() => removeEducation(index)}
                            color="error"
                            sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}

              {isClient && activeTab === 4 && (
                <Box>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Courses & Trainings</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addCourse}
                      variant="outlined"
                      size="small"
                    >
                      Add Course
                    </Button>
                  </Box>
                  {resumeData.courses.map((course, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Box 
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            width="100%"
                          >
                            <TextField
                              fullWidth
                              label="Course Title"
                              value={course.title}
                              onChange={(e) =>
                                updateCourse(index, "title", e.target.value)
                              }
                              inputRef={(el) => {
                                courseTitleRefs.current[index] = el;
                              }}
                              sx={{
                                "& .MuiInputBase-input:-webkit-autofill": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:hover": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:focus": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Provider"
                              value={course.provider}
                              onChange={(e) =>
                                updateCourse(index, "provider", e.target.value)
                              }
                              placeholder="e.g., Coursera, Udemy, University Name"
                              sx={{
                                "& .MuiInputBase-input:-webkit-autofill": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:hover": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:focus": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                              }}
                            />
                            <TextField
                              fullWidth
                              label="Link (optional)"
                              value={course.link || ""}
                              onChange={(e) =>
                                updateCourse(index, "link", e.target.value)
                              }
                              placeholder="https://course-url.com"
                              sx={{
                                "& .MuiInputBase-input:-webkit-autofill": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:hover": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                                "& .MuiInputBase-input:-webkit-autofill:focus": {
                                  WebkitBoxShadow:
                                    "0 0 0 1000px white inset !important",
                                  WebkitTextFillColor: "black !important",
                                },
                              }}
                            />
                          </Box>
                          <IconButton
                            onClick={() => removeCourse(index)}
                            color="error"
                            sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                  {resumeData.courses.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontStyle: "italic",
                        textAlign: "center",
                        py: 4,
                      }}
                    >
                      No courses added yet. Click &quot;Add Course&quot; to get started.
                    </Typography>
                  )}
                </Box>
              )}

              {isClient && activeTab === 5 && (
                <Box>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={2}
                    mb={2}
                  >
                    <Typography variant="h6">Interests & Hobbies</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addInterest}
                      variant="outlined"
                      size="small"
                    >
                      Add Interest
                    </Button>
                  </Box>
                  {resumeData.interests.map((interest, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 3,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={2}>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", sm: "row" }}
                          gap={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          <TextField
                            fullWidth
                            label="Interest Name"
                            value={interest.name}
                            onChange={(e) =>
                              updateInterest(index, "name", e.target.value)
                            }
                            inputRef={(el) => {
                              interestNameRefs.current[index] = el;
                            }}
                            placeholder="e.g., Photography, Chess, Hiking"
                            sx={{
                              "& .MuiInputBase-input:-webkit-autofill": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                              "& .MuiInputBase-input:-webkit-autofill:hover": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                              "& .MuiInputBase-input:-webkit-autofill:focus": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                            }}
                          />
                          <FormControl
                            sx={{
                              width: { xs: "100%", sm: 200 },
                              "& .MuiInputBase-input:-webkit-autofill": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                              "& .MuiInputBase-input:-webkit-autofill:hover": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                              "& .MuiInputBase-input:-webkit-autofill:focus": {
                                WebkitBoxShadow:
                                  "0 0 0 1000px white inset !important",
                                WebkitTextFillColor: "black !important",
                              },
                            }}
                          >
                            <InputLabel>Icon</InputLabel>
                            <Select
                              value={interest.icon}
                              label="Icon"
                              onChange={(e) =>
                                updateInterest(index, "icon", e.target.value)
                              }
                              renderValue={(value) => (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <span style={{ fontSize: "1.2em" }}>{value}</span>
                                  <span>{AVAILABLE_ICONS.find(icon => icon.value === value)?.label || "Custom"}</span>
                                </Box>
                              )}
                            >
                              {AVAILABLE_ICONS.map((icon) => (
                                <MenuItem key={icon.value} value={icon.value}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span style={{ fontSize: "1.2em" }}>{icon.value}</span>
                                    <span>{icon.label}</span>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <IconButton
                            onClick={() => removeInterest(index)}
                            color="error"
                            sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                  {resumeData.interests.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontStyle: "italic",
                        textAlign: "center",
                        py: 4,
                      }}
                    >
                      No interests added yet. Click &quot;Add Interest&quot; to get started.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Resume Preview with React-based zoom and aspect ratio preservation */}
        <Box
          ref={wrapperRef}
          sx={{
            flex: { md: 1 },
            width: { xs: "100%", sm: "90%", md: "100%" },
            maxWidth: { xs: "100%", sm: 850, md: "none" },
            mx: { xs: 0, sm: "auto", md: 0 },
            position: "relative",
            background: "transparent",
            minWidth: 0,
            px: { xs: 0, sm: 0 },
            mt: { xs: 0, md: 0 },
            overflow: "visible", // Allow shadow to be visible
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 850,
              height: "fit-content",
              background: "#fff",
              transform: isClient ? `scale(${zoom})` : "scale(1)",
              transformOrigin: "top left",
              transition: "transform 0.2s",
              // Add padding to accommodate shadow
              boxSizing: "border-box",
            }}
          >
            {isClient && (() => {
              try {
                // Ensure selectedTemplate is valid
                const validTemplate = selectedTemplate || "modern";
                console.log('Rendering template:', validTemplate);
                
                const templateData = {
                  id: 0,
                  title: resumeData.title,
                  jobTitle: resumeData.jobTitle,
                  profilePicture: localProfilePicture || resumeData.profilePicture,
                  content: resumeData.content,
                  strengths: resumeData.strengths.map((s, index) => ({
                    id: index,
                    skillName: s.skillName,
                    rating: s.rating,
                  })),
                  workExperience: resumeData.workExperience.map((exp, index) => ({
                    id: index,
                    company: exp.company,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    current: exp.current,
                    bulletPoints: exp.bulletPoints,
                  })),
                  education: resumeData.education.map((edu, index) => ({
                    id: index,
                    institution: edu.institution,
                    degree: edu.degree,
                    field: edu.field,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    current: edu.current,
                    gpa: edu.gpa,
                  })),
                  courses: resumeData.courses.map((course, index) => ({
                    id: index,
                    title: course.title,
                    provider: course.provider,
                    link: course.link,
                  })),
                  interests: resumeData.interests.map((interest, index) => ({
                    id: index,
                    name: interest.name,
                    icon: interest.icon,
                  })),
                  createdAt: new Date().toISOString(),
                };

                return (
                  <ResumeTemplateRegistry
                    data={templateData}
                    templateId={validTemplate}
                  />
                );
              } catch (error) {
                console.error('Error in ResumeTemplateRegistry:', error);
                return <div style={{ color: 'red' }}>Error rendering template: {error instanceof Error ? error.message : 'Unknown error'}</div>;
              }
            })()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
