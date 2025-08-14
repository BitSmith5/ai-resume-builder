// This file shows how to integrate the new refactored components
// into the original ResumeEditorV2.tsx file

import React from 'react';
import { 
  ResumeHeader, 
  PersonalInfoSection, 
  ProfessionalSummarySection,
  TechnicalSkillsSection,
  WorkExperienceSection,
  EducationSection,
  useResumeData, 
  ResumeData, 
  ProfileData,
  useExportSettings
} from './index';

// Example of how to replace the header section in ResumeEditorV2
export const ResumeEditorV2RefactoredExample = () => {
  // These would be your actual state variables from ResumeEditorV2
  const resumeData: ResumeData = {
    title: "Sample Resume",
    jobTitle: "Software Engineer",
    content: { personalInfo: { name: "", email: "", phone: "", city: "", state: "", summary: "" } },
    strengths: [],
    workExperience: [],
    education: [],
    courses: [],
    interests: []
  };
  
  const loading = false;
  const router = { push: (path: string) => console.log(`Navigate to ${path}`) };
  const setEditFormData = (data: any) => console.log('Set edit form data:', data);
  const setEditResumeInfoOpen = (open: boolean) => console.log('Set edit resume info open:', open);
  const handleExportClick = () => console.log('Export clicked');
  const handleDeleteResume = () => console.log('Delete clicked');

  // Replace the original header JSX with:
  return (
    <ResumeHeader
      resumeTitle={resumeData.title}
      jobTitle={resumeData.jobTitle}
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
  );
};

// Example of how to replace the Personal Info section:
export const PersonalInfoSectionExample = () => {
  const [profileData, setProfileData] = React.useState<ProfileData>({
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    location: "New York, NY",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
    portfolioUrl: "https://johndoe.com"
  });

  return (
    <PersonalInfoSection
      profileData={profileData}
      setProfileData={setProfileData}
    />
  );
};

// Example of how to replace the Professional Summary section:
export const ProfessionalSummarySectionExample = () => {
  const [resumeData, setResumeData] = React.useState<ResumeData>({
    title: "Sample Resume",
    content: { personalInfo: { name: "", email: "", phone: "", city: "", state: "", summary: "Experienced software engineer..." } },
    strengths: [], workExperience: [], education: [], courses: [], interests: []
  });

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <ProfessionalSummarySection
      resumeData={resumeData}
      setResumeData={setResumeData}
      onDeleteSection={handleDeleteSection}
    />
  );
};

// Example of how to replace the Technical Skills section:
export const TechnicalSkillsSectionExample = () => {
  const [resumeData, setResumeData] = React.useState<ResumeData>({
    title: "Sample Resume",
    content: { personalInfo: { name: "", email: "", phone: "", city: "", state: "", summary: "" } },
    strengths: [], workExperience: [], education: [], courses: [], interests: [],
    skillCategories: [
      { id: "cat-1", title: "Programming", skills: [{ id: "skill-1", name: "JavaScript" }] }
    ]
  });

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <TechnicalSkillsSection
      resumeData={resumeData}
      setResumeData={setResumeData}
      onDeleteSection={handleDeleteSection}
    />
  );
};

// Example of how to replace the Work Experience section:
export const WorkExperienceSectionExample = () => {
  const [resumeData, setResumeData] = React.useState<ResumeData>({
    title: "Sample Resume",
    content: { personalInfo: { name: "", email: "", phone: "", city: "", state: "", summary: "" } },
    strengths: [], workExperience: [
      {
        id: "work-1",
        company: "Tech Corp",
        position: "Developer",
        location: "San Francisco",
        startDate: "2023",
        endDate: "2024",
        current: false,
        bulletPoints: [{ id: "bp-1", description: "Developed web applications" }]
      }
    ], education: [], courses: [], interests: []
  });

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <WorkExperienceSection
      resumeData={resumeData}
      setResumeData={setResumeData}
      onDeleteSection={handleDeleteSection}
    />
  );
};

// Example of how to replace the Education section:
export const EducationSectionExample = () => {
  const [resumeData, setResumeData] = React.useState<ResumeData>({
    title: "Sample Resume",
    content: { personalInfo: { name: "", email: "", phone: "", city: "", state: "", summary: "" } },
    strengths: [], workExperience: [], education: [
      {
        institution: "University of Tech",
        degree: "Bachelor's",
        field: "Computer Science",
        startDate: "2019",
        endDate: "2023",
        current: false,
        gpa: 3.8
      }
    ], courses: [], interests: []
  });

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <EducationSection
      resumeData={resumeData}
      setResumeData={setResumeData}
      onDeleteSection={handleDeleteSection}
    />
  );
};

// Example of how to use the useResumeData hook:
export const UseResumeDataExample = () => {
  const {
    resumeData, 
    profileData,
    sectionOrder,
    loading, 
    error, 
    success, 
    setResumeData,
    saveResume 
  } = useResumeData("example-resume-id"); // Updated to match new hook signature

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <div>
      {/* Your component JSX */}
      <ResumeHeader
        resumeTitle={resumeData.title}
        loading={loading}
        onClose={() => console.log('Close')}
        onEditResumeInfo={() => console.log('Edit')}
        onExport={() => console.log('Export')}
        onDelete={() => console.log('Delete')}
      />
      
      <PersonalInfoSection
        profileData={{
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          location: "NYC",
          linkedinUrl: "",
          githubUrl: "",
          portfolioUrl: ""
        }}
        setProfileData={(data) => console.log('Profile updated:', data)}
      />

      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <p>Resume Title: {resumeData.title}</p>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {success && <p>Success: {success}</p>}
      
      <button onClick={() => {
        // Example of how to call saveResume with the required parameters
        saveResume(resumeData, profileData, sectionOrder);
      }}>Save Resume</button>
    </div>
  );
};

// Example of how to use the utility functions:
export const UtilsExample = () => {
  // Note: In a real component, you would import these at the top:
  // import { formatPhoneNumber, formatDate } from './utils/dateUtils';
  // This is just a demonstration example
  const formatPhoneNumber = (phone: string) => `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  
  const formattedPhone = formatPhoneNumber('1234567890'); // Returns "(123) 456-7890"
  const formattedDate = formatDate('2024-01-15'); // Returns "Jan 15, 2024"
  
  return (
    <div>
      <p>Phone: {formattedPhone}</p>
      <p>Date: {formattedDate}</p>
    </div>
  );
};

/*
STEPS TO INTEGRATE:

1. Import the new components:
   import { 
     ResumeHeader, 
     PersonalInfoSection, 
     ProfessionalSummarySection,
     TechnicalSkillsSection,
     WorkExperienceSection,
     EducationSection,
     useResumeData 
   } from './ResumeEditor';

2. Replace the header JSX (around line 6477-6620) with:
   <ResumeHeader ... />

3. Replace the Personal Info section JSX (around line 1250-1500) with:
   <PersonalInfoSection ... />

4. Replace the Professional Summary section JSX (around line 1500-1600) with:
   <ProfessionalSummarySection ... />

5. Replace the Technical Skills section JSX (around line 1600-2000) with:
   <TechnicalSkillsSection ... />

6. Replace the Work Experience section JSX (around line 2000-2500) with:
   <WorkExperienceSection ... />

7. Replace the Education section JSX (around line 2500-3000) with:
   <EducationSection ... />

8. Optionally replace the formatPhoneNumber function usage with the imported version

9. Test that everything still works as expected

10. Gradually extract more sections following the same pattern

BENEFITS:
- Cleaner, more readable code
- Easier to find and modify specific sections
- Better separation of concerns
- Improved maintainability
- Easier testing and debugging
- Reduced file size from 8,343+ lines to manageable components
*/
