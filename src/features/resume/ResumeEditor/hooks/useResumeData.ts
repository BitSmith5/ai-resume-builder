import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotificationActions } from '@/hooks';

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

// Save queue for efficient background syncing
class SaveQueue {
  private queue: Array<{ data: ResumeData; profileData: ProfileData; sectionOrder: string[]; timestamp: number }> = [];
  private processing = false;
  private resumeId: string;
  private onError: (error: string) => void;
  private lastSaveTime = 0;
  private saveInterval = 2000; // Save every 2 seconds max
  private maxQueueSize = 5; // Keep last 5 changes

  constructor(resumeId: string, onError: (error: string) => void) {
    this.resumeId = resumeId;
    this.onError = onError;
    
    // Load existing queue from localStorage
    this.loadQueueFromStorage();
  }

  private loadQueueFromStorage() {
    const storedQueue = localStorage.getItem(`save-queue-${this.resumeId}`);
    if (storedQueue) {
      try {
        const parsed = JSON.parse(storedQueue);
        this.queue = parsed.queue || [];
        this.lastSaveTime = parsed.lastSaveTime || 0;
                
        // Process any pending items if enough time has passed
        if (this.queue.length > 0 && Date.now() - this.lastSaveTime >= this.saveInterval) {
          this.process();
        }
      } catch (e) {
        console.warn('Failed to load queue from storage:', e);
        this.queue = [];
        this.lastSaveTime = 0;
      }
    }
  }

  private saveQueueToStorage() {
    const queueData = {
      queue: this.queue,
      lastSaveTime: this.lastSaveTime,
      timestamp: Date.now()
    };
    localStorage.setItem(`save-queue-${this.resumeId}`, JSON.stringify(queueData));
  }

  add(data: ResumeData, profileData: ProfileData, sectionOrder: string[]) {
    const now = Date.now();
    
    // Add to queue with timestamp
    this.queue.push({ data, profileData, sectionOrder, timestamp: now });
    
    // Keep only the last N items to prevent memory bloat
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }
    
    // Save queue to localStorage
    this.saveQueueToStorage();
        
    // Smart processing logic
    if (!this.processing) {
      // If enough time has passed, process immediately
      if (now - this.lastSaveTime >= this.saveInterval) {
        this.process();
      } else {
        // Otherwise, schedule processing after the interval
        setTimeout(() => {
          if (!this.processing && this.queue.length > 0) {
            this.process();
          }
        }, this.saveInterval - (now - this.lastSaveTime));
      }
    }
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      // Get the most recent data (latest wins)
      const latest = this.queue[this.queue.length - 1];
      
      // Clear queue since we're processing the latest
      this.queue = [];
      
      // Update last save time
      this.lastSaveTime = Date.now();
      
      // Update localStorage
      this.saveQueueToStorage();
      
      await this.saveToServer(latest.data, latest.profileData, latest.sectionOrder);
      
    } catch (error) {
      console.error('Background save failed:', error);
      this.onError('Background save failed - changes saved locally');
    } finally {
      this.processing = false;
      
      // Process any new items that came in while processing
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }

  // Get queue status for debugging
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastSaveTime: this.lastSaveTime,
      timeSinceLastSave: Date.now() - this.lastSaveTime,
      hasPendingSaves: this.queue.length > 0
    };
  }

  // Clear queue (useful for cleanup)
  clear() {
    this.queue = [];
    this.lastSaveTime = 0;
    this.saveQueueToStorage();
    console.log('🧹 Save queue cleared');
  }

  private async saveToServer(data: ResumeData, profileData: ProfileData, sectionOrder: string[]) {
    const url = `/api/resumes/${this.resumeId}`;
    
    const savePayload = {
      title: data.title || "Untitled Resume",
      jobTitle: data.jobTitle || "",
      template: data.template || "modern",
      content: data.content,
      profilePicture: data.profilePicture || "",
      deletedSections: data.deletedSections || [],
      sectionOrder: sectionOrder,
      strengths: data.strengths || [],
      skillCategories: data.skillCategories || [],
      workExperience: data.workExperience || [],
      education: data.education || [],
      courses: data.courses || [],
      interests: data.interests || [],
      projects: data.projects || [],
      languages: data.languages || [],
      publications: data.publications || [],
      awards: data.awards || [],
      volunteerExperience: data.volunteerExperience || [],
      references: data.references || [],
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savePayload),
    });

    if (!response.ok) {
      throw new Error(`Save failed: ${response.status}`);
    }
  }
}

export const useResumeData = (resumeId?: string) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationActions();

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

  // Save queue for background syncing
  const saveQueueRef = useRef<SaveQueue | null>(null);
  
  // Track if we have unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use refs to access current values without causing re-renders
  const resumeDataRef = useRef(resumeData);
  const profileDataRef = useRef(profileData);
  const sectionOrderRef = useRef(sectionOrder);
  
  // Store function refs to break dependency cycles
  const loadProfileDataRef = useRef<() => Promise<void>>();
  const loadResumeDataRef = useRef<() => Promise<void>>();

  // Update refs when state changes
  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  useEffect(() => {
    profileDataRef.current = profileData;
  }, [profileData]);

  useEffect(() => {
    sectionOrderRef.current = sectionOrder;
  }, [sectionOrder]);

  // Initialize save queue
  useEffect(() => {
    if (resumeId) {
      saveQueueRef.current = new SaveQueue(resumeId, setError);
    }
  }, [resumeId]);

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

  // Save to localStorage immediately (optimistic)
  const saveToLocalStorage = useCallback((data: ResumeData, profileData: ProfileData, sectionOrder: string[]) => {
    if (!resumeId) return;
    
    const saveData = {
      resumeData: data,
      profileData,
      sectionOrder,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`resume-draft-${resumeId}`, JSON.stringify(saveData));
    setHasUnsavedChanges(true);
  }, [resumeId]);

  // Enhanced setResumeData that saves immediately
  const setResumeDataWithSave = useCallback((updater: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      
      // Save to localStorage immediately
      saveToLocalStorage(newData, profileDataRef.current, sectionOrderRef.current);
      
      // Queue background server sync
      if (saveQueueRef.current) {
        saveQueueRef.current.add(newData, profileDataRef.current, sectionOrderRef.current);
      }
      
      return newData;
    });
  }, [saveToLocalStorage]);

  // Enhanced setProfileData that saves immediately
  const setProfileDataWithSave = useCallback((updater: ProfileData | ((prev: ProfileData) => ProfileData)) => {
    setProfileData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      
      // Save to localStorage immediately
      saveToLocalStorage(resumeDataRef.current, newData, sectionOrderRef.current);
      
      // Queue background server sync
      if (saveQueueRef.current) {
        saveQueueRef.current.add(resumeDataRef.current, newData, sectionOrderRef.current);
      }
      
      return newData;
    });
  }, [saveToLocalStorage]);

  // Enhanced setSectionOrder that saves immediately
  const setSectionOrderWithSave = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setSectionOrder(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      
      // Save to localStorage immediately
      saveToLocalStorage(resumeDataRef.current, profileDataRef.current, newData);
      
      // Queue background server sync
      if (saveQueueRef.current) {
        saveQueueRef.current.add(resumeDataRef.current, profileDataRef.current, newData);
      }
      
      return newData;
    });
  }, [saveToLocalStorage]);

  // Enhanced setError that also shows notification
  const setErrorWithNotification = useCallback((message: string) => {
    setError(message);
    showError(message);
  }, [showError]);

  // Enhanced setSuccess that also shows notification
  const setSuccessWithNotification = useCallback((message: string) => {
    setSuccess(message);
    showSuccess(message);
  }, [showSuccess]);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        setProfileData(profile);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  }, [session?.user?.email, session?.user?.name]);

  // Store the function in ref after it's defined
  useEffect(() => {
    loadProfileDataRef.current = loadProfileData;
  }, [loadProfileData]);

  // Load resume data with localStorage fallback
  const loadResumeData = useCallback(async () => {
    if (!resumeId || !session?.user) return;

    try {
      // Try to load from localStorage first (for instant loading)
      const localDraft = localStorage.getItem(`resume-draft-${resumeId}`);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          const { resumeData: localResumeData, profileData: localProfileData, sectionOrder: localSectionOrder } = parsed;
          
          // Check if local data is recent (within last hour)
          const isRecent = Date.now() - parsed.timestamp < 60 * 60 * 1000;
          
          if (isRecent) {
            setResumeData(localResumeData);
            setProfileData(localProfileData);
            setSectionOrder(localSectionOrder);
            setHasUnsavedChanges(true);
            setLoading(false);
          }
        } catch (e) {
          console.warn('Failed to parse local draft:', e);
        }
      }

      // Load from server (will override local data if more recent)
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.ok) {
        const resume = await response.json();

        const serverData = {
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
          skillCategories: (resume.skillCategories || []).map((category: Record<string, unknown>) => ({
            ...category,
            id: String(category.id || Math.random())
          })),
          workExperience: (resume.workExperience || []).map((exp: Record<string, unknown>) => ({
            ...exp,
            id: String(exp.id || Math.random()),
            startDate: exp.startDate ? formatDate(exp.startDate as string) : "",
            endDate: exp.endDate ? formatDate(exp.endDate as string) : "",
          })),
          education: (resume.education || []).map((edu: Record<string, unknown>) => ({
            ...edu,
            id: String(edu.id || Math.random()),
            startDate: edu.startDate ? formatDate(edu.startDate as string) : "",
            endDate: edu.endDate ? formatDate(edu.endDate as string) : "",
          })),
          courses: (resume.courses || []).map((course: Record<string, unknown>) => ({
            ...course,
            id: String(course.id || Math.random()),
            startDate: course.startDate ? formatDate(course.startDate as string) : "",
            endDate: course.endDate ? formatDate(course.endDate as string) : "",
          })),
          interests: (resume.interests || []).map((interest: Record<string, unknown>) => ({
            ...interest,
            id: String(interest.id || Math.random())
          })),
          projects: (resume.projects || []).map((project: Record<string, unknown>) => ({
            ...project,
            id: String(project.id || Math.random()),
            startDate: project.startDate ? formatDate(project.startDate as string) : "",
            endDate: project.endDate ? formatDate(project.endDate as string) : "",
          })),
          languages: (resume.languages || []).map((language: Record<string, unknown>) => ({
            ...language,
            id: String(language.id || Math.random())
          })),
          publications: (resume.publications || []).map((pub: Record<string, unknown>) => ({
            ...pub,
            id: String(pub.id || Math.random()),
            date: pub.date ? formatDate(pub.date as string) : "",
          })),
          awards: (resume.awards || []).map((award: Record<string, unknown>) => ({
            ...award,
            id: String(award.id || Math.random())
          })),
          volunteerExperience: (resume.volunteerExperience || []).map((vol: Record<string, unknown>) => ({
            ...vol,
            id: String(vol.id || Math.random()),
            startDate: vol.startDate ? formatDate(vol.startDate as string) : "",
            endDate: vol.endDate ? formatDate(vol.endDate as string) : "",
          })),
          references: (resume.references || []).map((ref: Record<string, unknown>) => ({
            ...ref,
            id: String(ref.id || Math.random())
          })),
        };

        setResumeData(serverData);

        // Set section order from resume data or use default
        if (resume.sectionOrder && resume.sectionOrder.length > 0) {
          setSectionOrder(resume.sectionOrder);
        } else {
          setSectionOrder([
            'personalInfo',
            'professionalSummary',
            'workExperience',
            'education',
            'strengths',
            'projects',
            'courses',
            'publications',
            'awards',
            'volunteerExperience',
            'languages',
            'interests',
            'references',
          ]);
        }

        setLoading(false);
      } else {
        // Use direct setError instead of setErrorWithNotification to avoid dependency issues
        setError("Failed to load resume");
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
      // Use direct setError instead of setErrorWithNotification to avoid dependency issues
      setError("Failed to load resume");
      setLoading(false);
    }
  }, [resumeId, session?.user, formatDate]);

  // Store the function in ref after it's defined
  useEffect(() => {
    loadResumeDataRef.current = loadResumeData;
  }, [loadResumeData]);

  // Force save function for immediate saving (no debouncing)
  const forceSave = useCallback(async (dataToSave?: ResumeData, profileDataToSave?: ProfileData, sectionOrderToSave?: string[]) => {
    if (loading || !session?.user) {
      return;
    }
    
    // Use provided data or fall back to current state from refs
    const data = dataToSave || resumeDataRef.current;
    const profile = profileDataToSave || profileDataRef.current;
    const order = sectionOrderToSave || sectionOrderRef.current;
    
    try {
      // Save to localStorage immediately
      saveToLocalStorage(data, profile, order);
      
      // Force immediate server sync
      if (saveQueueRef.current) {
        await saveQueueRef.current.add(data, profile, order);
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('forceSave failed:', error);
      throw error;
    }
  }, [loading, session?.user, saveToLocalStorage]);

  // Clear save queue (useful for cleanup)
  const clearSaveQueue = useCallback(() => {
    if (saveQueueRef.current) {
      saveQueueRef.current.clear();
    }
  }, []);

  // Delete resume
  const deleteResume = useCallback(async () => {
    if (!resumeId) {
      setErrorWithNotification("No resume ID found");
      return false;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessWithNotification("Resume deleted successfully");
        // Clear local storage
        localStorage.removeItem(`resume-draft-${resumeId}`);
        // Clear save queue
        clearSaveQueue();
        router.push('/resume');
        return true;
      } else {
        const errorData = await response.json();
        setErrorWithNotification(errorData.error || "Failed to delete resume");
        return false;
      }
    } catch {
      setErrorWithNotification("An error occurred while deleting the resume");
      return false;
    }
  }, [resumeId, router, setErrorWithNotification, setSuccessWithNotification, clearSaveQueue]);

  // Effects
  useEffect(() => {
    if (session?.user && loadProfileDataRef.current) {
      loadProfileDataRef.current();
    }
  }, [session?.user]); // Only depend on session.user, not the function

  useEffect(() => {
    if (session?.user && loadResumeDataRef.current) {
      loadResumeDataRef.current();
    }
  }, [session?.user]); // Only depend on session.user, not the function

  // Check for unsaved changes on unmount
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Get save queue status for debugging
  const getSaveQueueStatus = useCallback(() => {
    if (saveQueueRef.current) {
      return saveQueueRef.current.getStatus();
    }
    return null;
  }, []);

  return {
    // State
    loading,
    error,
    success,
    resumeData,
    profileData,
    sectionOrder,
    hasUnsavedChanges,

    // Setters (with automatic saving)
    setResumeData: setResumeDataWithSave,
    setProfileData: setProfileDataWithSave,
    setSectionOrder: setSectionOrderWithSave,
    setError: setErrorWithNotification,
    setSuccess: setSuccessWithNotification,

    // Actions
    loadProfileData,
    loadResumeData,
    deleteResume,
    forceSave,
    getSaveQueueStatus,
    clearSaveQueue, // Add this for cleanup
  };
};
