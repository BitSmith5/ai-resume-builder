// Test file to verify all components work correctly
// This file is for testing purposes only

import React from 'react';
import { ResumeHeader } from './components/ResumeHeader';
import { PersonalInfoSection } from './components/sections/PersonalInfoSection';
import { ProfessionalSummarySection } from './components/sections/ProfessionalSummarySection';
import { TechnicalSkillsSection } from './components/sections/TechnicalSkillsSection';
import { WorkExperienceSection } from './components/sections/WorkExperienceSection';
import { EducationSection } from './components/sections/EducationSection';
import { useResumeData } from './hooks/useResumeData';

// Define the types we need
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

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
  const { resumeData, loading, error, success, setResumeData } = useResumeData("test-resume-id");

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
