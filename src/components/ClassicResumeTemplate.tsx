import React from 'react';

interface ResumeData {
  title: string;
  jobTitle?: string;
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
  skillCategories?: Array<{
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
    city?: string;
    state?: string;
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
  courses?: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  interests?: Array<{
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
}

interface ClassicResumeTemplateProps {
  data: ResumeData;
}

interface PageContent {
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    city?: string;
    state?: string;
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
  skills: Array<{
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
  interests: Array<{
    name: string;
    icon: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    authors: string;
    journal: string;
    year: string;
    doi: string;
    link: string;
  }>;
  awards: Array<{
    id: string;
    title: string;
    organization: string;
    year: string;
    bulletPoints: Array<{
      id: string;
      description: string;
    }>;
  }>;
  volunteerExperience: Array<{
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
  // Flags to track which sections have already started on previous pages
  workExperienceStarted: boolean;
  coursesStarted: boolean;
  educationStarted: boolean;
  skillCategoriesStarted: boolean;
  projectsStarted: boolean;
  languagesStarted: boolean;
  publicationsStarted: boolean;
  awardsStarted: boolean;
  volunteerExperienceStarted: boolean;
}

const ClassicResumeTemplate: React.FC<ClassicResumeTemplateProps> = ({ data }) => {
  const { personalInfo } = data.content;

  

  
  // Function to format dates as MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Function to format URLs by removing http/https prefix
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Calculate content distribution across pages
  const calculatePages = (): PageContent[] => {
    const pages: PageContent[] = [];
    const maxContentHeight = 1000; // Increased from 900 to allow more content per page
    const bottomMargin = 60; // Reduced from 80 to allow more content
    const headerHeight = 180; // Only on first page
    const itemSpacing = 12; // Reduced from 15 to be more compact
    
    // Helper function to estimate content height
    const estimateContentHeight = (content: ResumeData['workExperience'][0] | ResumeData['education'][0] | NonNullable<ResumeData['courses']>[0] | NonNullable<ResumeData['skillCategories']>[0] | NonNullable<ResumeData['projects']>[0] | NonNullable<ResumeData['languages']>[0] | NonNullable<ResumeData['publications']>[0], type: 'work' | 'education' | 'course' | 'skillCategories' | 'project' | 'language' | 'publication'): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 70; // Reduced from 80
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 18; // Reduced from 22
          }
          break;
        case 'education':
          height = 50; // Reduced from 60
          break;
        case 'course':
          height = 40; // Reduced from 45
          break;
        case 'project':
          height = 70; // Reduced from 80
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 18; // Reduced from 22
          }
          // Add height for technologies
          if ('technologies' in content && content.technologies && content.technologies.length > 0) {
            height += 18; // Reduced from 20
          }
          break;
        case 'skillCategories':
          height = 35; // Reduced from 40
          if ('skills' in content && content.skills && content.skills.length > 0) {
            height += Math.ceil(content.skills.length / 3) * 18; // Reduced from 20
          }
          break;
        case 'language':
          height = 30; // Language name + proficiency
          break;
        case 'publication':
          height = 60; // Publication title + authors + journal + year
          break;
      }
      
      return height;
    };
    
    // Helper function to estimate section header height
    const estimateSectionHeaderHeight = (): number => {
      return 40; // Reduced from 45 - Section title + border + spacing
    };
    
    // NEW APPROACH: Calculate all section heights first
    const sections: Array<{
      type: 'work' | 'courses' | 'education' | 'projects' | 'languages';
      items: ResumeData['workExperience'] | NonNullable<ResumeData['courses']> | ResumeData['education'] | NonNullable<ResumeData['projects']> | NonNullable<ResumeData['languages']>;
      height: number;
    }> = [];
    
    if (data.workExperience && data.workExperience.length > 0) {
      const workHeight = estimateSectionHeaderHeight() + data.workExperience.reduce((total, item) => total + estimateContentHeight(item, 'work') + itemSpacing, 0);
      sections.push({ type: 'work', items: data.workExperience, height: workHeight });
    }
    
    if (data.projects && data.projects.length > 0) {
      const projectsHeight = estimateSectionHeaderHeight() + data.projects.reduce((total, item) => total + estimateContentHeight(item, 'project') + itemSpacing, 0);
      sections.push({ type: 'projects', items: data.projects, height: projectsHeight });
    }
    
    if (data.courses && data.courses.length > 0) {
      const coursesHeight = estimateSectionHeaderHeight() + data.courses.reduce((total, item) => total + estimateContentHeight(item, 'course') + itemSpacing, 0);
      sections.push({ type: 'courses', items: data.courses, height: coursesHeight });
    }
    
    if (data.education && data.education.length > 0) {
      const educationHeight = estimateSectionHeaderHeight() + data.education.reduce((total, item) => total + estimateContentHeight(item, 'education') + itemSpacing, 0);
      sections.push({ type: 'education', items: data.education, height: educationHeight });
    }
    
    if (data.languages && data.languages.length > 0) {
      const languagesHeight = estimateSectionHeaderHeight() + data.languages.reduce((total, item) => total + estimateContentHeight(item, 'language') + itemSpacing, 0);
      sections.push({ type: 'languages', items: data.languages, height: languagesHeight });

    }
    

    

    
    // NEW APPROACH: Process sections in correct visual order but optimize Education placement
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      projects: [],
      skills: [],
      skillCategories: [],
      interests: [],
      languages: [],
      publications: [],
      awards: [],
      workExperienceStarted: false,
      coursesStarted: false,
      educationStarted: false,
      skillCategoriesStarted: false,
      projectsStarted: false,
      languagesStarted: false,
      publicationsStarted: false,
      awardsStarted: false
    };
    
    let currentPageHeight = headerHeight; // Start with header height for first page
    

    

    
    // Process sections in correct visual order: work, projects, courses, education
    for (const section of sections) {
      
      if (section.type === 'education') {
        // For Education, check if it can fit on current page
        
        // Force Education to fit on current page if we're on page 1 or 2
        const currentPageNumber = pages.length + 1;
        
        if (currentPageNumber <= 2 || currentPageHeight + section.height <= maxContentHeight - bottomMargin) {
          // Add Education to current page
          currentPage.education = section.items as ResumeData['education'];
          currentPage.educationStarted = false;
          currentPageHeight += section.height;
        } else {
          // Start new page for Education
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.skillCategories.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            projects: [],
            skills: [],
            skillCategories: [],
            interests: [],
            languages: [],
            publications: [],
            workExperienceStarted: false,
            coursesStarted: false,
            educationStarted: false,
            skillCategoriesStarted: false,
            projectsStarted: false,
            languagesStarted: false,
            publicationsStarted: false
          };
          currentPageHeight = 0;
          
          currentPage.education = section.items as ResumeData['education'];
          currentPage.educationStarted = false;
          currentPageHeight += section.height;
        }
        continue;
      }
      

      
      // For Work Experience and Courses, process items individually to allow splitting
      // For Languages, keep them together as a single unit
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if section header fits
      if (currentPageHeight + sectionHeaderHeight > maxContentHeight - bottomMargin) {
        // Start new page
        if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
          pages.push(currentPage);
        }
        
                  currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            projects: [],
            skills: [],
            skillCategories: [],
            interests: [],
            languages: [],
            publications: [],
            workExperienceStarted: false,
            coursesStarted: false,
            educationStarted: false,
            skillCategoriesStarted: false,
            projectsStarted: false,
            languagesStarted: false,
            publicationsStarted: false
          };
        currentPageHeight = 0;
      }
      
      // Add section header
      currentPageHeight += sectionHeaderHeight;
      switch (section.type) {
        case 'work':
          currentPage.workExperienceStarted = false;
          break;
        case 'courses':
          currentPage.coursesStarted = false;
          break;
        case 'projects':
          currentPage.projectsStarted = false;
          break;
        case 'languages':
          currentPage.languagesStarted = false;
          break;
      }
      
      // Process items individually
      // Special handling for languages - keep them together
      if (section.type === 'languages') {
        // Calculate total height for all languages
        const totalLanguagesHeight = section.items.reduce((total, item) => total + estimateContentHeight(item, 'language'), 0) + (section.items.length - 1) * itemSpacing;
        
        // Check if all languages fit on current page
        if (currentPageHeight + sectionHeaderHeight + totalLanguagesHeight > maxContentHeight - bottomMargin) {
          // Start new page for languages
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            projects: [],
            skills: [],
            skillCategories: [],
            interests: [],
            languages: [],
            publications: [],
            workExperienceStarted: true,
            coursesStarted: true,
            educationStarted: true,
            skillCategoriesStarted: true,
            projectsStarted: true,
            languagesStarted: false,
            publicationsStarted: false
          };
          currentPageHeight = 0;
          
          // Add section header on new page
          currentPageHeight += sectionHeaderHeight;
        }
        
        // Add all languages to current page
        for (const item of section.items) {
          currentPage.languages.push(item as NonNullable<ResumeData['languages']>[0]);
        }
        currentPageHeight += totalLanguagesHeight;
        continue;
      }
      
      // Regular processing for other sections
      for (const item of section.items) {
        const itemHeight = estimateContentHeight(item, section.type === 'courses' ? 'course' : section.type === 'projects' ? 'project' : 'work') + itemSpacing;
        
        // Check if item fits on current page
        if (currentPageHeight + itemHeight > maxContentHeight - bottomMargin) {
          // Start new page
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            projects: [],
            skills: [],
            skillCategories: [],
            interests: [],
            languages: [],
            publications: [],
            workExperienceStarted: true, // Section already started - don't show header again
            coursesStarted: true, // Section already started - don't show header again
            educationStarted: false,
            skillCategoriesStarted: false,
            projectsStarted: true, // Section already started - don't show header again
            languagesStarted: false,
            publicationsStarted: false
          };
          currentPageHeight = 0;
          
          // Re-add section header on new page
          currentPageHeight += sectionHeaderHeight;
          switch (section.type) {
            case 'work':
              currentPage.workExperienceStarted = true; // Don't show header again
              break;
            case 'courses':
              currentPage.coursesStarted = true; // Don't show header again
              break;
                    case 'projects':
          currentPage.projectsStarted = true; // Don't show header again
          break;

      }
        }
        
        // Add item to current page
        switch (section.type) {
          case 'work':
            currentPage.workExperience.push(item as ResumeData['workExperience'][0]);
            break;
          case 'courses':
            currentPage.courses.push(item as NonNullable<ResumeData['courses']>[0]);
            break;
                  case 'projects':
          currentPage.projects.push(item as NonNullable<ResumeData['projects']>[0]);
          break;

      }
        currentPageHeight += itemHeight;
      }
    }
    
    // Add skillCategories to the first page after the summary
    if (data.skillCategories && data.skillCategories.length > 0 && pages.length > 0) {
      const firstPage = pages[0];
      firstPage.skillCategories = [...data.skillCategories];
      firstPage.skillCategoriesStarted = false;
    } else if (data.skillCategories && data.skillCategories.length > 0 && pages.length === 0) {
      // If no pages exist yet, create a page with skill categories
      currentPage.skillCategories = [...data.skillCategories];
      currentPage.skillCategoriesStarted = false;
    }
    
    // Add the final page
    if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0) {
      pages.push(currentPage);
    }
    
    // Add skills and interests to the last page, but check for overflow
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      
      // Estimate skills and interests height
      const skillsHeight = data.strengths && data.strengths.length > 0 ? 50 : 0; // Reduced from 60 - Section header + content
      const interestsHeight = data.interests && data.interests.length > 0 ? 50 : 0; // Reduced from 60 - Section header + content
      const totalSkillsInterestsHeight = skillsHeight + interestsHeight;
      
      // Check if skills/interests would overflow the bottom margin
      if (currentPageHeight + totalSkillsInterestsHeight > maxContentHeight - bottomMargin) {
        // Create a new page for skills and interests
        const newPage: PageContent = {
          workExperience: [],
          education: [],
          courses: [],
          projects: [],
          skills: data.strengths || [],
          skillCategories: [],
          interests: data.interests || [],
          languages: [],
          publications: [],
          workExperienceStarted: true,
          coursesStarted: true,
          educationStarted: true,
          skillCategoriesStarted: true,
          projectsStarted: true,
          languagesStarted: false,
          publicationsStarted: false
        };
        pages.push(newPage);
      } else {
        // Add to current page
        if (data.strengths && data.strengths.length > 0) {
          lastPage.skills = [...data.strengths];
        }
        

        
        if (data.interests && data.interests.length > 0) {
          lastPage.interests = [...data.interests];
        }
      }
    }
    
    // If no pages were created at all, create one with just skills/interests
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        projects: [],
        skills: data.strengths || [],
        skillCategories: data.skillCategories || [],
        interests: data.interests || [],
        languages: [],
        publications: [],
        workExperienceStarted: false,
        coursesStarted: false,
        educationStarted: false,
        skillCategoriesStarted: false,
        projectsStarted: false,
        languagesStarted: false,
        publicationsStarted: false
      });
    }
    

    return pages;
  };

  // Calculate pages
  const pages = calculatePages();
  
  // Render header (same for all pages)
  const renderHeader = () => (
    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
      {data.profilePicture && (
        <div style={{ 
          width: '120px',
          height: '120px',
          borderRadius: '50%', 
          backgroundImage: `url(${data.profilePicture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: '0 auto 12px auto',
          border: '3px solid #000'
        }} />
      )}
      <h1 style={{ 
        fontSize: '40px', 
        fontWeight: 'normal', 
        margin: '0 0 -8px 0',
        fontFamily: 'Times New Roman, serif'
      }}>
        {personalInfo.name}
      </h1>
      {data.jobTitle && (
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'normal', 
          margin: '0 0 2px 0',
          fontFamily: 'Times New Roman, serif',
          color: '#333'
        }}>
          {data.jobTitle}
        </div>
      )}
      <div style={{ 
        fontSize: '12px', 
        color: '#333',
        fontFamily: 'Times New Roman, serif',
        lineHeight: '1.4'
      }}>
        {[
          (personalInfo.city || personalInfo.state) && [personalInfo.city, personalInfo.state].filter(Boolean).join(', '),
          personalInfo.phone,
          personalInfo.email,
          personalInfo.linkedin && (
            <a 
              href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              LinkedIn
            </a>
          ),
          personalInfo.github && (
            <a 
              href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              GitHub
            </a>
          ),
          personalInfo.website && (
            <a 
              href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#333', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Portfolio
            </a>
          )
        ].filter(Boolean).map((item, index, array) => (
          <span key={index}>
            {item}
            {index < array.length - 1 && <span style={{ margin: '0 8px', color: '#666' }}>|</span>}
          </span>
        ))}
      </div>
    </div>
  );

  // Render a single page
  const renderPage = (pageContent: PageContent, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    
    return (
      <div
        key={pageIndex}
        style={{ 
          fontFamily: 'Times New Roman, serif', 
          background: '#fff', 
          color: '#000', 
          padding: '40px',
          width: '850px', // Match modern template width
          height: '1100px', // Letter size aspect ratio: 8.5:11 = 0.773, 850/1100 = 0.773 ✓
          margin: '0 auto',
          marginBottom: pageIndex < pages.length - 1 ? '20px' : '0',
          lineHeight: '1.6',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          border: '1px solid #e0e0e0'
        }}
      >


        {/* Content wrapper that respects bottom margin */}
        <div style={{ 
          paddingBottom: '80px', // Ensure content doesn't overlap with bottom margin
          minHeight: 'calc(100% - 80px)' // Ensure content area respects bottom margin
        }}>
          {/* Header - only on first page */}
          {isFirstPage && renderHeader()}

                  {/* Summary - only on first page */}
        {isFirstPage && personalInfo.summary && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Professional Summary
            </h2>
            <p style={{ fontSize: '14px', margin: '0', textAlign: 'justify' }}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Technical Skills - only on first page */}
        {isFirstPage && pageContent.skillCategories.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.skillCategoriesStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Technical Skills
              </h2>
            )}
            <ul style={{ 
              fontSize: '14px', 
              margin: '0', 
              paddingLeft: '20px',
              listStyleType: 'disc'
            }}>
              {pageContent.skillCategories.map((category, categoryIndex) => (
                <li key={categoryIndex} style={{ 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  {category.title}: {category.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} style={{ 
                      fontWeight: 'normal',
                      marginRight: '4px'
                    }}>
                      {skill.name}{skillIndex < category.skills.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Work Experience */}
        {pageContent.workExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.workExperienceStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Work Experience
              </h2>
            )}
            {pageContent.workExperience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {exp.position}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {exp.company}
                  {(exp.city || exp.state) && (
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                      {' - '}{[exp.city, exp.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: '0', 
                    paddingLeft: '20px',
                    textAlign: 'justify'
                  }}>
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ marginBottom: '2px' }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {pageContent.projects.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.projectsStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Projects
              </h2>
            )}
            {pageContent.projects.map((project, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {project.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  Technologies: {project.technologies.join(', ')}
                </div>
                {project.bulletPoints.length > 0 && (
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: '0', 
                    paddingLeft: '20px',
                    textAlign: 'justify'
                  }}>
                    {project.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ marginBottom: '2px' }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
                {project.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                      {formatUrl(project.link)}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Courses */}
        {pageContent.courses.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.coursesStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Courses & Certifications
              </h2>
            )}
            {pageContent.courses.map((course, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {course.title}
                  </h3>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '3px',
                  fontStyle: 'italic'
                }}>
                  {course.provider}
                </div>
                {course.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <a href={course.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                      {formatUrl(course.link)}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {pageContent.education.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {!pageContent.educationStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Education
              </h2>
            )}
            {pageContent.education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {edu.degree} in {edu.field}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '3px',
                  fontStyle: 'italic'
                }}>
                  {edu.institution}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    GPA: {edu.gpa}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Skills */}
        {pageContent.skills.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Skills
            </h2>
            <div style={{ fontSize: '14px' }}>
              {pageContent.skills.map((strength, index) => (
                <span key={index} style={{ 
                  display: 'inline-block',
                  marginRight: '15px',
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  {strength.skillName} ({strength.rating}/10)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {pageContent.interests.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Interests
            </h2>
            <div style={{ fontSize: '14px' }}>
              {pageContent.interests.map((interest, index) => (
                <span key={index} style={{ 
                  display: 'inline-block',
                  marginRight: '15px',
                  marginBottom: '4px'
                }}>
                  {interest.icon} {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {pageContent.languages.length > 0 && (
          <div style={{ marginBottom: '20px' }}>

            {!pageContent.languagesStarted && (
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '4px'
              }}>
                Languages
              </h2>
            )}
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {pageContent.languages.map((language) => 
                `${language.name} (${language.proficiency})`
              ).join(', ')}
            </div>
          </div>
        )}

        {/* Publications */}
        {data.publications && data.publications.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Publications
            </h2>
            {data.publications.map((publication, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {publication.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {publication.year}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '3px',
                  fontStyle: 'italic'
                }}>
                  {publication.authors}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#666',
                  marginBottom: '3px'
                }}>
                  {publication.journal}
                </div>
                {publication.doi && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    DOI: {publication.doi}
                  </div>
                )}
                {publication.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <a href={publication.link} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>
                      {formatUrl(publication.link)}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Awards and Recognition */}
        {data.awards && data.awards.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Awards and Recognition
            </h2>
            {data.awards.map((award, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {award.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {award.year}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {award.organization}
                </div>
                {award.bulletPoints.length > 0 && (
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: '0', 
                    paddingLeft: '20px',
                    textAlign: 'justify'
                  }}>
                    {award.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ marginBottom: '2px' }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Experience */}
        {data.volunteerExperience && data.volunteerExperience.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000',
              paddingBottom: '4px'
            }}>
              Volunteer Experience
            </h2>
            {data.volunteerExperience.map((volunteer, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    margin: '0',
                    textTransform: 'uppercase'
                  }}>
                    {volunteer.position}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(volunteer.startDate)} - {volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {volunteer.organization}
                  {volunteer.location && (
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                      {' - '}{volunteer.location}
                    </span>
                  )}
                </div>
                {volunteer.hoursPerWeek && (
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {volunteer.hoursPerWeek} hours per week
                  </div>
                )}
                {volunteer.bulletPoints.length > 0 && (
                  <ul style={{ 
                    fontSize: '13px', 
                    margin: '0', 
                    paddingLeft: '20px',
                    textAlign: 'justify'
                  }}>
                    {volunteer.bulletPoints.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} style={{ marginBottom: '2px' }}>
                        {bullet.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        </div> {/* Close content wrapper */}
      </div>
    );
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start',
      width: '100%',
    }}>
      {pages.map((pageContent, pageIndex) => renderPage(pageContent, pageIndex))}
    </div>
  );
};

export default ClassicResumeTemplate; 