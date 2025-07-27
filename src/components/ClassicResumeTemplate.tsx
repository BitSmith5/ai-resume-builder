import React from 'react';

interface ResumeData {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  sectionOrder?: string[]; // Array of section names in display order
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
  references?: Array<{
    id: string;
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
  // Professional Summary flag to track if it should be rendered on this page
  hasProfessionalSummary?: boolean;
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
  referencesStarted?: boolean;
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
    const maxContentHeight = 1050; // Increased to allow more content per page
    const bottomMargin = 50; // Reduced to allow more content
    const headerHeight = 180; // Only on first page
    const itemSpacing = 12; // Reduced from 15 to be more compact
    
    // Helper function to estimate content height
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const estimateContentHeight = (content: any, type: 'work' | 'education' | 'course' | 'skillCategories' | 'project' | 'language' | 'publication' | 'award' | 'volunteer' | 'reference' | 'skill' | 'interest' | 'summary'): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          // Simplified height calculation for work experience
          // Base height for position, company, and dates
          height = 60; // Reduced from complex calculation
          
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            // Each bullet point: 20px per bullet (reduced from 24px)
            height += content.bulletPoints.length * 20;
          }
          break;
        case 'education':
          height = 50; // Reduced from 60
          break;
        case 'course':
          height = 40; // Reduced from 45
          break;
        case 'project':
          // Simplified height calculation for projects
          height = 60; // Reduced base height for project title and dates
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 16; // Reduced from 18px per bullet
          }
          // Add height for technologies
          if ('technologies' in content && content.technologies && content.technologies.length > 0) {
            height += 15; // Reduced from 18px for technologies
          }
          break;
        case 'skillCategories':
          // Simplified height calculation for skill categories
          height = 30; // Reduced base height for category title
          if ('skills' in content && content.skills && content.skills.length > 0) {
            // Each row of skills (3 skills per row): 15px per row (reduced from 18px)
            height += Math.ceil(content.skills.length / 3) * 15;
          }
          break;
        case 'language':
          height = 30; // Language name + proficiency
          break;
        case 'publication':
          height = 60; // Publication title + authors + journal + year
          break;
        case 'award':
          height = 70; // Award title + organization + year + bullet points
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 18;
          }
          break;
        case 'volunteer':
          height = 70; // Volunteer position + organization + dates + bullet points
          if ('bulletPoints' in content && content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 18;
          }
          break;
        case 'reference':
          height = 80; // Reference name + title + company + contact info
          break;
        case 'skill':
          height = 20; // Skill name + rating
          break;
        case 'interest':
          height = 20; // Interest name + icon
          break;
        case 'summary':
          height = 40; // Summary text
          break;
      }
      
      return height;
    };
    
    // Helper function to estimate section header height
    const estimateSectionHeaderHeight = (): number => {
      return 40; // Reduced from 45 - Section title + border + spacing
    };
    

    
    // NEW APPROACH: Use sectionOrder from data to determine section order
    // Create a mapping from section names to data properties and their types
    const sectionMapping: Record<string, {
      dataKey: keyof ResumeData;
      type: 'work' | 'education' | 'course' | 'project' | 'language' | 'publication' | 'award' | 'volunteer' | 'reference' | 'skill' | 'interest' | 'skillCategories' | 'summary';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[];
    }> = {
      'Professional Summary': { dataKey: 'content', type: 'summary', items: data.content.personalInfo.summary ? [data.content.personalInfo] : [] },
      'Work Experience': { dataKey: 'workExperience', type: 'work', items: data.workExperience || [] },
      'Education': { dataKey: 'education', type: 'education', items: data.education || [] },
      'Projects': { dataKey: 'projects', type: 'project', items: data.projects || [] },
      'Courses': { dataKey: 'courses', type: 'course', items: data.courses || [] },
      'Languages': { dataKey: 'languages', type: 'language', items: data.languages || [] },
      'Publications': { dataKey: 'publications', type: 'publication', items: data.publications || [] },
      'Awards': { dataKey: 'awards', type: 'award', items: data.awards || [] },
      'Volunteer Experience': { dataKey: 'volunteerExperience', type: 'volunteer', items: data.volunteerExperience || [] },
      'References': { dataKey: 'references', type: 'reference', items: data.references || [] },
      'Skills': { dataKey: 'strengths', type: 'skill', items: data.strengths || [] },
      'Technical Skills': { dataKey: 'skillCategories', type: 'skillCategories', items: data.skillCategories || [] },
      'Interests': { dataKey: 'interests', type: 'interest', items: data.interests || [] },
    };

    // Get the section order from data, or use a default order if not provided
    const sectionOrder = data.sectionOrder || [
      'Professional Summary',
      'Technical Skills',
      'Work Experience',
      'Education',
      'Projects',
      'Courses',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References',
      'Skills',
      'Interests'
    ];



    // Filter sections to only include those that have data and are in the sectionOrder
    const orderedSections: Array<{
      name: string;
      type: 'work' | 'education' | 'course' | 'project' | 'language' | 'publication' | 'award' | 'volunteer' | 'reference' | 'skill' | 'interest' | 'skillCategories' | 'summary';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[];
      height: number;
    }> = [];

    for (const sectionName of sectionOrder) {
      const mapping = sectionMapping[sectionName];
      if (mapping && mapping.items.length > 0) {
        const sectionHeight = estimateSectionHeaderHeight() + mapping.items.reduce((total, item) => total + estimateContentHeight(item, mapping.type) + itemSpacing, 0);
        orderedSections.push({
          name: sectionName,
          type: mapping.type,
          items: mapping.items,
          height: sectionHeight
        });
      }
    }

    // Initialize current page
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
      volunteerExperience: [],
      references: [],
      workExperienceStarted: false,
      coursesStarted: false,
      educationStarted: false,
      skillCategoriesStarted: false,
      projectsStarted: false,
      languagesStarted: false,
      publicationsStarted: false,
      awardsStarted: false,
      volunteerExperienceStarted: false,
      referencesStarted: false
    };
    
    let currentPageHeight = headerHeight; // Start with header height for first page

    // Process sections in the order specified by sectionOrder
    for (const section of orderedSections) {
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if section header fits
      if (currentPageHeight + sectionHeaderHeight > maxContentHeight - bottomMargin) {
        // Start new page
        if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0 || currentPage.publications.length > 0 || currentPage.awards.length > 0 || currentPage.volunteerExperience.length > 0 || (currentPage.references?.length || 0) > 0) {
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
          awards: [],
          volunteerExperience: [],
          references: [],
          workExperienceStarted: true,
          coursesStarted: true,
          educationStarted: true,
          skillCategoriesStarted: true,
          projectsStarted: true,
          languagesStarted: true,
          publicationsStarted: true,
          awardsStarted: true,
          volunteerExperienceStarted: true,
          referencesStarted: true
        };
        currentPageHeight = 0;
      }
      
      // Add section header
      currentPageHeight += sectionHeaderHeight;
      
      // Set the appropriate started flag
      switch (section.name) {
        case 'Professional Summary':
          // Professional Summary doesn't need a started flag since it's always rendered
          break;
        case 'Technical Skills':
          currentPage.skillCategoriesStarted = false;
          break;
        case 'Work Experience':
          currentPage.workExperienceStarted = false;
          break;
        case 'Education':
          currentPage.educationStarted = false;
          break;
        case 'Projects':
          currentPage.projectsStarted = false;
          break;
        case 'Courses':
          currentPage.coursesStarted = false;
          break;
        case 'Languages':
          currentPage.languagesStarted = false;
          break;
        case 'Publications':
          currentPage.publicationsStarted = false;
          break;
        case 'Awards':
          currentPage.awardsStarted = false;
          break;
        case 'Volunteer Experience':
          currentPage.volunteerExperienceStarted = false;
          break;
        case 'References':
          currentPage.referencesStarted = false;
          break;
      }
      
              // Process items individually for sections that should be kept together
        // Note: Technical Skills is now processed individually like Projects and Work Experience
        if (section.type === 'language' || section.type === 'skill' || section.type === 'interest' || section.type === 'summary') {
        // These sections should be kept together
        const totalHeight = section.items.reduce((total, item) => total + estimateContentHeight(item, section.type), 0) + (section.items.length - 1) * itemSpacing;
        
                 if (currentPageHeight + totalHeight > maxContentHeight - bottomMargin) {
           // Start new page for this section
           if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0 || currentPage.publications.length > 0 || currentPage.awards.length > 0 || currentPage.volunteerExperience.length > 0 || (currentPage.references?.length || 0) > 0) {
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
            awards: [],
            volunteerExperience: [],
            references: [],
            workExperienceStarted: true,
            coursesStarted: true,
            educationStarted: true,
            skillCategoriesStarted: false, // Set to false since Technical Skills is starting on this page
            projectsStarted: true,
            languagesStarted: false,
            publicationsStarted: true,
            awardsStarted: true,
            volunteerExperienceStarted: true,
            referencesStarted: true
          };
          currentPageHeight = 0;
          currentPageHeight += sectionHeaderHeight;
        }
        
        // Add all items to current page
        switch (section.name) {
          case 'Professional Summary':
            // Mark this page as having the Professional Summary
            currentPage.hasProfessionalSummary = true;
            break;
          case 'Languages':
            currentPage.languages = section.items;
            break;
          case 'Skills':
            currentPage.skills = section.items;
            break;
          case 'Interests':
            currentPage.interests = section.items;
            break;
        }
        currentPageHeight += totalHeight;
        continue;
      }
      
      // For other sections, process items individually to allow splitting
      // Skip Professional Summary as it's handled in the "kept together" section
      if (section.name === 'Professional Summary') {
        continue;
      }
      for (let i = 0; i < section.items.length; i++) {
        const item = section.items[i];
        const itemHeight = estimateContentHeight(item, section.type) + itemSpacing;
        
        // Check if this item fits on the current page
        const availableHeight = maxContentHeight - bottomMargin - currentPageHeight;
        
        // Debug logging for work experience, projects, and technical skills items (commented out for production)
        // if (section.name === 'Work Experience') {
        //   console.log(`Work Experience Item ${i + 1}:`, {
        //     itemHeight,
        //     availableHeight,
        //     currentPageHeight,
        //     maxContentHeight,
        //     bottomMargin,
        //     willFit: itemHeight <= availableHeight
        //   });
        // }
        // if (section.name === 'Projects') {
        //   console.log(`Project ${i + 1}:`, {
        //     itemHeight,
        //     availableHeight,
        //     currentPageHeight,
        //     maxContentHeight,
        //     bottomMargin,
        //     willFit: itemHeight <= availableHeight
        //   });
        // }
        // if (section.name === 'Technical Skills') {
        //   console.log(`Technical Skills Category ${i + 1}:`, {
        //     itemHeight,
        //     availableHeight,
        //     currentPageHeight,
        //     maxContentHeight,
        //     bottomMargin,
        //     willFit: itemHeight <= availableHeight
        //   });
        // }
        
        if (itemHeight > availableHeight) {
           // This item won't fit - start new page
           if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.projects.length > 0 || currentPage.languages.length > 0 || currentPage.skillCategories.length > 0 || currentPage.publications.length > 0 || currentPage.awards.length > 0 || currentPage.volunteerExperience.length > 0 || (currentPage.references?.length || 0) > 0) {
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
            awards: [],
            volunteerExperience: [],
            references: [],
            workExperienceStarted: section.name === 'Work Experience' ? true : false,
            coursesStarted: section.name === 'Courses' ? true : false,
            educationStarted: section.name === 'Education' ? true : false,
            skillCategoriesStarted: section.name === 'Technical Skills' ? false : true,
            projectsStarted: section.name === 'Projects' ? true : false,
            languagesStarted: false,
            publicationsStarted: section.name === 'Publications' ? true : false,
            awardsStarted: section.name === 'Awards' ? true : false,
            volunteerExperienceStarted: section.name === 'Volunteer Experience' ? true : false,
            referencesStarted: section.name === 'References' ? true : false
          };
          currentPageHeight = 0;
          currentPageHeight += sectionHeaderHeight;
        }
        
        // Add this item to current page
        switch (section.name) {
          case 'Professional Summary':
            // Professional Summary is handled separately in rendering, but we account for its height
            break;
          case 'Technical Skills':
            currentPage.skillCategories.push(item);
            break;
          case 'Work Experience':
            currentPage.workExperience.push(item);
            break;
          case 'Education':
            currentPage.education.push(item);
            break;
          case 'Projects':
            currentPage.projects.push(item);
            break;
          case 'Courses':
            currentPage.courses.push(item);
            break;
          case 'Publications':
            currentPage.publications.push(item);
            break;
          case 'Awards':
            currentPage.awards.push(item);
            break;
          case 'Volunteer Experience':
            currentPage.volunteerExperience.push(item);
            break;
          case 'References':
            if (!currentPage.references) {
              currentPage.references = [];
            }
            currentPage.references.push(item);
            break;
        }
        currentPageHeight += itemHeight;
      }
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
          awards: [],
          volunteerExperience: [],
          workExperienceStarted: true,
          coursesStarted: true,
          educationStarted: true,
          skillCategoriesStarted: true,
          projectsStarted: true,
          languagesStarted: false,
          publicationsStarted: false,
          awardsStarted: false,
          volunteerExperienceStarted: false
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
        awards: [],
        volunteerExperience: [],
        workExperienceStarted: false,
        coursesStarted: false,
        educationStarted: false,
        skillCategoriesStarted: false,
        projectsStarted: false,
        languagesStarted: false,
        publicationsStarted: false,
        awardsStarted: false,
        volunteerExperienceStarted: false
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

  // Section render functions
  const renderProfessionalSummary = () => {
    if (!personalInfo.summary) return null;
    return (
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
    );
  };

  const renderTechnicalSkills = (pageContent: PageContent) => {
    if (pageContent.skillCategories.length === 0) return null;
    return (
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
    );
  };

  const renderWorkExperience = (pageContent: PageContent) => {
    if (pageContent.workExperience.length === 0) return null;
    return (
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
    );
  };

  const renderProjects = (pageContent: PageContent) => {
    if (pageContent.projects.length === 0) return null;
    return (
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
    );
  };

  const renderCourses = (pageContent: PageContent) => {
    if (pageContent.courses.length === 0) return null;
    return (
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
    );
  };

  const renderEducation = (pageContent: PageContent) => {
    if (pageContent.education.length === 0) return null;
    return (
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
    );
  };

  const renderSkills = (pageContent: PageContent) => {
    if (pageContent.skills.length === 0) return null;
    return (
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
    );
  };

  const renderInterests = (pageContent: PageContent) => {
    if (pageContent.interests.length === 0) return null;
    return (
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
    );
  };

  const renderLanguages = (pageContent: PageContent) => {
    if (pageContent.languages.length === 0) return null;
    return (
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
    );
  };

  const renderPublications = (pageContent: PageContent) => {
    if (pageContent.publications.length === 0) return null;
    return (
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
        {pageContent.publications.map((publication, index) => (
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
    );
  };

  const renderAwards = (pageContent: PageContent) => {
    if (pageContent.awards.length === 0) return null;
    return (
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
        {pageContent.awards.map((award, index) => (
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
    );
  };

  const renderReferences = (pageContent: PageContent) => {
    if (!pageContent.references || pageContent.references.length === 0) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          borderBottom: '1px solid #000',
          paddingBottom: '4px'
        }}>
          References
        </h2>
        {pageContent.references!.map((reference, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              margin: '0 0 5px 0',
              textTransform: 'uppercase'
            }}>
              {reference.name}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '4px',
              fontStyle: 'italic'
            }}>
              {reference.title}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              marginBottom: '4px'
            }}>
              {reference.company}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              marginBottom: '2px'
            }}>
              {reference.email}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              marginBottom: '2px'
            }}>
              {reference.phone}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              {reference.relationship}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVolunteerExperience = (pageContent: PageContent) => {
    if (pageContent.volunteerExperience.length === 0) return null;
    return (
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
        {pageContent.volunteerExperience.map((volunteer, index) => (
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
    );
  };

  // Render a single page
  const renderPage = (pageContent: PageContent, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    
    // Create a mapping from section names to render functions
    const sectionRenderers: Record<string, () => React.ReactNode> = {
      'Professional Summary': () => pageContent.hasProfessionalSummary ? renderProfessionalSummary() : null,
      'Technical Skills': () => renderTechnicalSkills(pageContent),
      'Work Experience': () => renderWorkExperience(pageContent),
      'Projects': () => renderProjects(pageContent),
      'Courses': () => renderCourses(pageContent),
      'Education': () => renderEducation(pageContent),
      'Skills': () => renderSkills(pageContent),
      'Interests': () => renderInterests(pageContent),
      'Languages': () => renderLanguages(pageContent),
      'Publications': () => renderPublications(pageContent),
      'Awards': () => renderAwards(pageContent),
      'References': () => renderReferences(pageContent),
      'Volunteer Experience': () => renderVolunteerExperience(pageContent),
    };

    // Get the section order from data, or use a default order if not provided
    const sectionOrder = data.sectionOrder || [
      'Professional Summary',
      'Technical Skills',
      'Work Experience',
      'Education',
      'Projects',
      'Courses',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References',
      'Skills',
      'Interests'
    ];



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



          {/* Render sections in the specified order */}
          {sectionOrder.map((sectionName, index) => {
            const renderer = sectionRenderers[sectionName];
            return renderer ? (
              <React.Fragment key={`${sectionName}-${index}`}>
                {renderer()}
              </React.Fragment>
            ) : null;
          })}
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
      {pages.map((pageContent, pageIndex) => (
        <React.Fragment key={`page-${pageIndex}`}>
          {renderPage(pageContent, pageIndex)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ClassicResumeTemplate; 