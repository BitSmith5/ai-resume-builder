import React from 'react';
import ModernResumeTemplate from './ModernResumeTemplate';
import ClassicResumeTemplate from './ClassicResumeTemplate';

export interface ResumeData {
  id: number;
  title: string;
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
    id: number;
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    id: number;
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
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  courses?: Array<{
    id: number;
    title: string;
    provider: string;
    link?: string;
  }>;
  interests?: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
  createdAt: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional two-column layout',
    preview: 'Modern template with sidebar and main content area'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout',
    preview: 'Classic template with traditional formatting'
  },
  // Add more templates here as they become available
  // {
  //   id: 'minimal',
  //   name: 'Minimal',
  //   description: 'Simple and clean design',
  //   preview: 'Minimal template with focus on content'
  // }
];

interface ResumeTemplateRegistryProps {
  data: ResumeData;
  templateId: string;
}

const ResumeTemplateRegistry: React.FC<ResumeTemplateRegistryProps> = ({ data, templateId }) => {
  // Transform the data to match the template interface
  const transformedData = {
    title: data.title,
    profilePicture: data.profilePicture,
    content: data.content,
    strengths: data.strengths.map(s => ({
      skillName: s.skillName,
      rating: s.rating
    })),
    workExperience: data.workExperience.map(exp => ({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      bulletPoints: exp.bulletPoints
    })),
    education: data.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: edu.current,
      gpa: edu.gpa
    })),
    courses: data.courses?.map(course => ({
      title: course.title,
      provider: course.provider,
      link: course.link
    })),
    interests: data.interests?.map(interest => ({
      name: interest.name,
      icon: interest.icon
    }))
  };

  switch (templateId) {
    case 'modern':
      return <ModernResumeTemplate data={transformedData} />;
    case 'classic':
      return <ClassicResumeTemplate data={transformedData} />;
    // Add more cases as templates are added
    // case 'minimal':
    //   return <MinimalResumeTemplate data={transformedData} />;
    default:
      return <ModernResumeTemplate data={transformedData} />;
  }
};

export default ResumeTemplateRegistry; 