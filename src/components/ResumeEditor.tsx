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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import ModernResumeTemplate from "./ModernResumeTemplate";
// import { generateResumePDF } from './ResumePDF';

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
  const [newSkillIndex, setNewSkillIndex] = useState<number | null>(null);
  const [newWorkIndex, setNewWorkIndex] = useState<number | null>(null);
  const [newEducationIndex, setNewEducationIndex] = useState<number | null>(
    null,
  );
  const skillNameRefs = useRef<(HTMLInputElement | null)[]>([]);
  const workCompanyRefs = useRef<(HTMLInputElement | null)[]>([]);
  const educationInstitutionRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Robust React-based zooming with aspect ratio preservation
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function updateZoom() {
      if (!wrapperRef.current) return;
      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;
      const scaleW = width / 850;
      const scaleH = height / 1100;
      setZoom(Math.min(scaleW, scaleH, 1));
    }
    updateZoom();
    window.addEventListener("resize", updateZoom);
    return () => window.removeEventListener("resize", updateZoom);
  }, []);

  const [resumeData, setResumeData] = useState<ResumeData>({
    title: "",
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
  });

  const loadResume = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.ok) {
        const resume = await response.json();
        setResumeData({
          title: resume.title,
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
        });
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
    if (resumeId) {
      loadResume();
    }
  }, [resumeId, loadResume]);

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
  }, [
    newSkillIndex,
    newWorkIndex,
    newEducationIndex,
    resumeData.strengths.length,
    resumeData.workExperience.length,
    resumeData.education.length,
  ]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";
      const method = resumeId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
        setSuccess("Resume saved successfully!");
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

  const handleDownloadPDF = async () => {
    if (!resumeId) {
      setError("Please save the resume first before downloading");
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/resumes/${resumeId}/pdf`);

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
    }
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

  return (
    <Box sx={{ width: "100%" }}>
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
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
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
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Download PDF
          </Button>
        </Stack>
      </Box>

      {/* Editor Form and Preview Container */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* Editor Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  minWidth: { xs: "auto", sm: 120 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <Tab label="Personal Info" />
              <Tab label="Skills" />
              <Tab label="Work Experience" />
              <Tab label="Education" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Stack spacing={2}>
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

              {activeTab === 1 && (
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

              {activeTab === 2 && (
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

              {activeTab === 3 && (
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
            </Box>
          </Paper>
        </Box>

        {/* Resume Preview with React-based zoom and aspect ratio preservation */}
        <Box
          ref={wrapperRef}
          sx={{
            flex: { md: 1 },
            width: { xs: "90vw", sm: "90%", md: "100%" },
            maxWidth: { xs: 850, md: "none" },
            aspectRatio: "850 / 1100",
            mx: { xs: "auto", md: 0 },
            position: "relative",
            background: "transparent",
            minHeight: 0,
            minWidth: 0,
            px: { xs: 1, sm: 0 },
            mt: { xs: 3, md: 0 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 850,
              height: 1100,
              background: "#fff",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.2s",
            }}
          >
            {template === "modern" && (
              <ModernResumeTemplate data={resumeData} />
            )}
            {/* Add more template previews here as needed */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
