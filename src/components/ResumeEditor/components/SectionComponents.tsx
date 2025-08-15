import React from 'react';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ProfessionalSummarySection } from './sections/ProfessionalSummarySection';
import { TechnicalSkillsSection } from './sections/TechnicalSkillsSection';
import { WorkExperienceSection } from './sections/WorkExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { CoursesSection } from './sections/CoursesSection';
import { InterestsSection } from './sections/InterestsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { PublicationsSection } from './sections/PublicationsSection';
import { AwardsSection } from './sections/AwardsSection';
import { VolunteerExperienceSection } from './sections/VolunteerExperienceSection';
import { ReferencesSection } from './sections/ReferencesSection';

interface SectionComponentsProps {
  profileData: any;
  resumeData: any;
  setProfileData: (data: any) => void;
  setResumeData: (data: any) => void;
  onDeleteSection: (sectionName: string) => void;
  setDatePickerOpen: (open: boolean) => void;
  setDatePickerPosition: (position: { x: number; y: number }) => void;
  datePickerCallbackRef: React.MutableRefObject<((date: string) => void) | null>;
}

export const createSectionComponents = ({
  profileData,
  resumeData,
  setProfileData,
  setResumeData,
  onDeleteSection,
  setDatePickerOpen,
  setDatePickerPosition,
  datePickerCallbackRef
}: SectionComponentsProps): Record<string, () => JSX.Element> => {
  return {
    "Personal Info": () => (
      <PersonalInfoSection
        profileData={profileData}
        setProfileData={setProfileData}
      />
    ),
    "Professional Summary": () => (
      <ProfessionalSummarySection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Technical Skills": () => (
      <TechnicalSkillsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Work Experience": () => (
      <WorkExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Education": () => (
      <EducationSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Courses": () => (
      <CoursesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Interests": () => (
      <InterestsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Projects": () => (
      <ProjectsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Languages": () => (
      <LanguagesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Publications": () => (
      <PublicationsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Awards": () => (
      <AwardsSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
    "Volunteer Experience": () => (
      <VolunteerExperienceSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
        setDatePickerOpen={setDatePickerOpen}
        setDatePickerPosition={setDatePickerPosition}
        datePickerCallbackRef={datePickerCallbackRef}
      />
    ),
    "References": () => (
      <ReferencesSection
        resumeData={resumeData}
        setResumeData={setResumeData}
        onDeleteSection={onDeleteSection}
      />
    ),
  };
};
