// Shared data transformation logic for PDF generation
// This ensures consistency between preview and download

export interface TransformedResumeData {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  sectionOrder: string[];
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
  skillCategories: Array<{
    id: string;
    title: string;
    skills: Array<{
      id: string;
      name: string;
    }>;
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
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
  publications: Array<{
    title: string;
    authors: string;
    journal: string;
    year: string;
    link?: string;
  }>;
  awards: Array<{
    title: string;
    issuer: string;
    year: string;
    description?: string;
  }>;
  volunteerExperience: Array<{
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  references: Array<{
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  interests: Array<{
    name: string;
    icon: string;
  }>;
}

export function transformResumeData(resume: any, dateFormat: 'iso' | 'formatted' = 'iso'): TransformedResumeData {
  // Date formatting function
  const formatDate = (date: Date | string | null, format: 'iso' | 'formatted'): string => {
    if (!date) return '';
    
    // Convert string to Date if needed
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    if (format === 'iso') {
      return dateObj.toISOString().split('T')[0];
    } else {
      try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${month} ${year}`;
      } catch {
        return '';
      }
    }
  };

  // Parse the resume content JSON to get the actual personal info and skillCategories
  const resumeContent = resume.content as { 
    personalInfo?: { name?: string; email?: string; phone?: string; city?: string; state?: string; summary?: string; website?: string; linkedin?: string; github?: string };
    skillCategories?: Array<{
      id: string;
      title: string;
      skills: Array<{
        id: string;
        name: string;
      }>;
    }>;
  };
  const personalInfo = resumeContent?.personalInfo || {};
  const skillCategories = resumeContent?.skillCategories || [];

  // Transform work experience data
  const workExperience = resume.workExperience.map((work: any) => ({
    company: work.company || '',
    position: work.position || '',
    startDate: formatDate(work.startDate, dateFormat),
    endDate: work.endDate ? formatDate(work.endDate, dateFormat) : '',
    current: work.current || false,
    bulletPoints: Array.isArray(work.bulletPoints) 
      ? (work.bulletPoints as Array<{ description: string }>).map(bullet => ({ description: bullet.description }))
      : []
  }));

  // Transform education data
  const education = resume.education.map((edu: any) => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    field: edu.field || '',
    startDate: formatDate(edu.startDate, dateFormat),
    endDate: edu.endDate ? formatDate(edu.endDate, dateFormat) : '',
    current: edu.current || false,
    gpa: edu.gpa || undefined
  }));

  // Transform courses data
  const courses = resume.courses.map((course: any) => ({
    title: course.title || '',
    provider: course.provider || '',
    link: course.link || undefined
  }));

  // Transform projects data
  const projects = resume.projects.map((project: any) => ({
    title: project.title || '',
    description: Array.isArray(project.bulletPoints) 
      ? (project.bulletPoints as Array<{ description: string }>).map(bullet => bullet.description).join(' ')
      : '',
    technologies: Array.isArray(project.technologies) 
      ? (project.technologies as any[]).filter(tech => typeof tech === 'string').map(tech => tech as string)
      : [],
    link: project.link || undefined
  }));

  // Transform languages data
  const languages = resume.languages.map((language: any) => ({
    name: language.name || '',
    proficiency: language.proficiency || ''
  }));

  // Transform publications data
  const publications = resume.publications.map((publication: any) => ({
    title: publication.title || '',
    authors: publication.authors || '',
    journal: publication.journal || '',
    year: publication.year || '',
    link: publication.link || undefined
  }));

  // Transform awards data
  const awards = resume.awards.map((award: any) => ({
    title: award.title || '',
    issuer: award.organization || '',
    year: award.year || '',
    description: Array.isArray(award.bulletPoints) 
      ? (award.bulletPoints as Array<{ description: string }>).map(bullet => bullet.description).join(' ')
      : undefined
  }));

  // Transform volunteer experience data
  const volunteerExperience = resume.volunteerExperience.map((volunteer: any) => ({
    organization: volunteer.organization || '',
    position: volunteer.position || '',
    startDate: formatDate(volunteer.startDate, dateFormat),
    endDate: volunteer.endDate ? formatDate(volunteer.endDate, dateFormat) : '',
    current: volunteer.current || false,
    description: Array.isArray(volunteer.bulletPoints) 
      ? (volunteer.bulletPoints as Array<{ description: string }>).map(bullet => bullet.description).join(' ')
      : ''
  }));

  // Transform references data
  const references = resume.references.map((reference: any) => ({
    name: reference.name || '',
    title: reference.title || '',
    company: reference.company || '',
    email: reference.email || '',
    phone: reference.phone || '',
    relationship: reference.relationship || ''
  }));

  return {
    title: resume.title,
    jobTitle: resume.jobTitle || undefined,
    profilePicture: resume.profilePicture || undefined,
    sectionOrder: Array.isArray(resume.sectionOrder) ? resume.sectionOrder as string[] : [],
    content: {
      personalInfo: {
        name: personalInfo.name || resume.user.name || '',
        email: personalInfo.email || resume.user.email || '',
        phone: personalInfo.phone || resume.user.phone || '',
        city: personalInfo.city || resume.user.location || '',
        state: personalInfo.state || '',
        summary: personalInfo.summary || '',
        website: personalInfo.website || resume.user.portfolioUrl || '',
        linkedin: personalInfo.linkedin || resume.user.linkedinUrl || '',
        github: personalInfo.github || ''
      }
    },
    strengths: (resume.strengths || []).map((strength: any) => ({
      skillName: strength.skillName || '',
      rating: strength.rating || 0
    })),
    skillCategories,
    workExperience,
    education,
    projects,
    courses,
    languages,
    publications,
    awards,
    volunteerExperience,
    references,
    interests: (resume.interests || []).map((interest: any) => ({
      name: interest.name || '',
      icon: interest.icon || ''
    }))
  };
} 