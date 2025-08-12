// Test file to verify all components work correctly
// This file is for testing purposes only

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
  ProfileData 
} from './index';

// Test data
const testResumeData: ResumeData = {
  title: "Test Resume",
  jobTitle: "Test Engineer",
  content: { 
    personalInfo: { 
      name: "Test User", 
      email: "test@example.com", 
      phone: "1234567890", 
      city: "Test City", 
      state: "TS", 
      summary: "Test summary" 
    } 
  },
  strengths: [],
  workExperience: [
    {
      id: "work-1",
      company: "Test Company",
      position: "Test Position",
      location: "Test Location",
      startDate: "Jan 2024",
      endDate: "Dec 2024",
      current: false,
      bulletPoints: [
        { id: "bullet-1", description: "Test bullet point 1" },
        { id: "bullet-2", description: "Test bullet point 2" }
      ]
    }
  ],
  education: [
    {
      institution: "Test University",
      degree: "Bachelor's",
      field: "Computer Science",
      startDate: "2018",
      endDate: "2022",
      current: false,
      gpa: 3.8
    }
  ],
  courses: [],
  interests: [],
  skillCategories: [
    {
      id: "cat-1",
      title: "Programming Languages",
      skills: [
        { id: "skill-1", name: "JavaScript" },
        { id: "skill-2", name: "TypeScript" },
        { id: "skill-3", name: "React" }
      ]
    }
  ]
};

const testProfileData: ProfileData = {
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  location: "Test City, TS",
  linkedinUrl: "https://linkedin.com/in/testuser",
  githubUrl: "https://github.com/testuser",
  portfolioUrl: "https://testuser.com"
};

// Test component that renders all our extracted components
export const TestAllComponents: React.FC = () => {
  const { resumeData, loading, error, success, setResumeData } = useResumeData({
    initialData: testResumeData,
    onSave: async (data) => {
      console.log('Test save:', data);
    }
  });

  const handleDeleteSection = (sectionName: string) => {
    console.log('Delete section:', sectionName);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Component Test Page</h1>
      
      <h2>1. ResumeHeader Component</h2>
      <ResumeHeader
        resumeTitle={resumeData.title}
        jobTitle={resumeData.jobTitle}
        loading={loading}
        onClose={() => console.log('Close clicked')}
        onEditResumeInfo={() => console.log('Edit resume info clicked')}
        onExport={() => console.log('Export clicked')}
        onDelete={() => console.log('Delete clicked')}
      />
      
      <h2>2. PersonalInfoSection Component</h2>
      <PersonalInfoSection
        profileData={testProfileData}
        setProfileData={(data) => console.log('Profile data updated:', data)}
      />

      <h2>3. ProfessionalSummarySection Component</h2>
      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <h2>4. TechnicalSkillsSection Component</h2>
      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <h2>5. WorkExperienceSection Component</h2>
      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />

      <h2>6. EducationSection Component</h2>
      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={handleDeleteSection}
      />
      
      <h2>7. useResumeData Hook Status</h2>
      <div>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Success:</strong> {success || 'None'}</p>
        <p><strong>Resume Title:</strong> {resumeData.title}</p>
      </div>
      
      <h2>8. Test Instructions</h2>
      <ul>
        <li>Check that all components display correctly</li>
        <li>Verify that forms can be filled out and updated</li>
        <li>Test add/delete functionality for skills, work experience, and education</li>
        <li>Click the buttons to see console logs</li>
        <li>Check that there are no console errors</li>
      </ul>
    </div>
  );
};

// Export for testing
export default TestAllComponents;
