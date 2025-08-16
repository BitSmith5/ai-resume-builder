import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface ResumeData {
  title: string;
  jobTitle?: string;
  template?: string;
  profilePicture?: string;
  deletedSections?: string[];
  sectionOrder?: string[];
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

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export const useResumeData = (resumeId?: string) => {
  const router = useRouter();
  const { data: session } = useSession();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });

  const [sectionOrder, setSectionOrder] = useState([
    "Personal Info",
    "Professional Summary",
    "Technical Skills",
    "Work Experience",
    "Education",
  ]);

  // Helper function to format dates
  const formatDate = useCallback((date: Date | string): string => {
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
  }, []);

  // Load profile data
  const loadProfileData = useCallback(async () => {
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
  }, [session]);

  // Load resume data
  const loadResumeData = useCallback(async () => {
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
          education: (resume.education || []).map((edu: Record<string, unknown>) => ({
            ...edu,
            id: String(edu.id || Math.random()),
            startDate: formatDate(edu.startDate as string | Date),
            endDate: formatDate(edu.endDate as string | Date),
          })),
          courses: resume.courses || [],
          interests: (resume.interests || []).map((interest: Record<string, unknown>) => ({
            ...interest,
            id: String(interest.id || Math.random())
          })),
          projects: (resume.projects || []).map((project: Record<string, unknown>) => ({
            ...project,
            id: String(project.id || Math.random()),
            startDate: formatDate(project.startDate as string | Date),
            endDate: formatDate(project.endDate as string | Date),
            bulletPoints: ((project.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
              ...bullet,
              id: String(bullet.id || Math.random())
            }))
          })),
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
          volunteerExperience: (resume.volunteerExperience || []).map((volunteer: Record<string, unknown>) => ({
            ...volunteer,
            id: String(volunteer.id || Math.random()),
            startDate: formatDate(volunteer.startDate as string | Date),
            endDate: formatDate(volunteer.endDate as string | Date),
            bulletPoints: ((volunteer.bulletPoints as Array<Record<string, unknown>>) || []).map((bullet: Record<string, unknown>) => ({
              ...bullet,
              id: String(bullet.id || Math.random())
            }))
          })),
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
      } else {
        console.error('Failed to load resume:', response.status);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  }, [resumeId, session, formatDate]);

  // Save resume data
  const saveResume = useCallback(async (data: ResumeData, profileData: ProfileData, currentSectionOrder: string[]) => {
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

      const url = resumeId ? `/api/resumes/${resumeId}` : "/api/resumes";
      const method = resumeId ? "PUT" : "POST";

      const savePayload = {
        title: filteredData.title || "Untitled Resume",
        jobTitle: filteredData.jobTitle || "",
        template: filteredData.template || "modern",
        content: filteredData.content,
        profilePicture: filteredData.profilePicture || "",
        deletedSections: filteredData.deletedSections || [],
        sectionOrder: currentSectionOrder,
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
  }, [resumeId, session, router]);

  // Delete resume
  const deleteResume = useCallback(async () => {
    if (!resumeId) {
      setError("No resume ID found");
      return;
    }

    try {
      setLoading(true);

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
  }, [resumeId, router]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(saveResume, 2000);

  // Effects
  useEffect(() => {
    if (session?.user) {
      loadProfileData();
    }
  }, [session, loadProfileData]);

  useEffect(() => {
    if (session?.user) {
      loadResumeData();
    }
  }, [session, loadResumeData]);

  // Autosave effect
  useEffect(() => {
    if (loading || !session?.user) return;

    // Don't save if we're still loading initial data
    // Allow saving if there's any meaningful content, not just title and work experience
    if (resumeId && 
        !resumeData.title && 
        resumeData.workExperience.length === 0 && 
        resumeData.education.length === 0 && 
        resumeData.references.length === 0 && 
        resumeData.projects.length === 0 && 
        resumeData.languages.length === 0 && 
        resumeData.publications.length === 0 && 
        resumeData.awards.length === 0 && 
        resumeData.volunteerExperience.length === 0 && 
        resumeData.interests.length === 0 && 
        resumeData.courses.length === 0 && 
        resumeData.strengths.length === 0) return;



    debouncedSave(resumeData, profileData, sectionOrder);
  }, [resumeData, profileData, sectionOrder, loading, session?.user, resumeId, debouncedSave]);

  return {
    // State
    loading,
    error,
    success,
    resumeData,
    profileData,
    sectionOrder,

    // Setters
    setResumeData,
    setProfileData,
    setSectionOrder,
    setError,
    setSuccess,

    // Actions
    loadProfileData,
    loadResumeData,
    saveResume,
    deleteResume,
    debouncedSave,
  };
};
