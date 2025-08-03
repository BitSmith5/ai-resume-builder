// Direct HTML generation for PDF creation with template styling

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
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  publications?: Array<{
    title: string;
    authors: string;
    journal: string;
    year: string;
    link?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer: string;
    year: string;
    description?: string;
  }>;
  volunteerExperience?: Array<{
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  references?: Array<{
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
}

//Page content for modern template
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
  leftColumnContent: {
    skills: Array<{
      skillName: string;
      rating: number;
    }>;
    interests: Array<{
      name: string;
      icon: string;
    }>;
  };
}

interface ContentItem {
  bulletPoints?: Array<{
    description: string;
  }>;
  [key: string]: unknown;
}



/* eslint-disable @typescript-eslint/no-unused-vars */
// Temporary function to satisfy linter - not used in new PDF generation approach
function getWebSafeFont(fontFamily: string): string {
  return 'Arial, Helvetica, sans-serif';
}

// Type definitions for classic template
interface ClassicPageContent {
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    city?: string;
    state?: string;
    bulletPoints?: Array<{
      description: string;
    }>;
    institution?: string;
    degree?: string;
    field?: string;
    gpa?: number;
    title?: string;
    provider?: string;
    link?: string;
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
  skills: Array<{
    skillName: string;
    rating: number;
  }>;
  interests: Array<{
    name: string;
    icon: string;
  }>;
  workExperienceStarted: boolean;
  coursesStarted: boolean;
  educationStarted: boolean;
}

interface ExportSettings {
  template?: string;
  pageSize?: 'letter' | 'a4';
  fontFamily?: string;
  nameSize?: number;
  sectionHeadersSize?: number;
  subHeadersSize?: number;
  bodyTextSize?: number;
  sectionSpacing?: number;
  entrySpacing?: number;
  lineSpacing?: number;
  topBottomMargin?: number;
  sideMargins?: number;
  alignTextLeftRight?: boolean;
  pageWidth?: number;
  pageHeight?: number;
}

interface ClassicSection {
  type: 'work' | 'courses' | 'education';
  items: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    city?: string;
    state?: string;
    bulletPoints?: Array<{
      description: string;
    }>;
    institution?: string;
    degree?: string;
    field?: string;
    gpa?: number;
    title?: string;
    provider?: string;
    link?: string;
  }>;
  height: number;
}

export function renderResumeToHtml(data: ResumeData, template: string, exportSettings?: ExportSettings): string {
  if (template === 'classic') {
    return renderClassicTemplate(data, exportSettings);
  } else {
    return renderModernTemplateWithPageBreaks(data, exportSettings);
  }
}

function renderModernTemplateWithPageBreaks(data: ResumeData, exportSettings?: ExportSettings): string {
  // Use the same page calculation logic as the React component
  const calculatePages = (): PageContent[] => {
    const pages: PageContent[] = [];
    // Match the actual template dimensions: 1100px page height - margins and padding
    const maxContentHeight = 1000; // Increased to match template's actual available space
    const maxLeftColumnHeight = 620;
    
    let currentPage: PageContent = {
      workExperience: [],
      education: [],
      courses: [],
      leftColumnContent: {
        skills: [],
        interests: []
      }
    };
    
    let currentHeight = 0;
    const headerHeight = 180; // Match React component
    const sectionSpacing = 32;
    const itemSpacing = 12;
    
    const estimateContentHeight = (content: ContentItem, type: string): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 90; // Base height for work experience items
          if (content.bulletPoints && content.bulletPoints.length > 0) {
            height += content.bulletPoints.length * 25;
          }
          break;
        case 'education':
          height = 70;
          break;
        case 'course':
          height = 45;
          break;
      }
      
      return height;
    };
    
    const addSectionToPage = (section: ContentItem[], type: string) => {
      const sectionHeight = 50;
      
      // Use the actual template dimensions for accurate page breaks
      const effectiveMaxHeight = maxContentHeight;
      
      if (currentHeight + sectionHeight > effectiveMaxHeight) {
        pages.push(currentPage);
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          leftColumnContent: {
            skills: [],
            interests: []
          }
        };
        currentHeight = 0;
      }
      
      currentHeight += sectionHeight;
      
      for (const item of section) {
        const itemHeight = estimateContentHeight(item, type);
        
        // For courses and education, be more conservative about page breaks
        if (currentHeight + itemHeight > effectiveMaxHeight) {
          pages.push(currentPage);
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            leftColumnContent: {
              skills: [],
              interests: []
            }
          };
          currentHeight = sectionHeight;
        }
        
        switch (type) {
          case 'work':
            currentPage.workExperience.push(item as PageContent['workExperience'][0]);
            break;
          case 'education':
            currentPage.education.push(item as PageContent['education'][0]);
            break;
          case 'course':
            currentPage.courses.push(item as PageContent['courses'][0]);
            break;
        }
        
        currentHeight += itemHeight + itemSpacing;
      }
      
      currentHeight += sectionSpacing;
    };
    
    currentHeight = headerHeight;
    
    if (data.workExperience && data.workExperience.length > 0) {
      addSectionToPage(data.workExperience, 'work');
    }
    
    if (data.courses && data.courses.length > 0) {
      addSectionToPage(data.courses, 'course');
    }
    
    if (data.education && data.education.length > 0) {
      addSectionToPage(data.education, 'education');
    }
    
    if (currentPage.workExperience.length > 0 || 
        currentPage.education.length > 0 || 
        currentPage.courses.length > 0) {
      pages.push(currentPage);
    }
    
    if (pages.length === 0) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        leftColumnContent: {
          skills: [],
          interests: []
        }
      });
    }
    
    // Helper function to distribute left column content
    const distributeLeftColumnContent = () => {
      let skillIndex = 0;
      let interestIndex = 0;
      
      // First, distribute all skills across pages
      if (data.strengths && data.strengths.length > 0) {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const skillsSectionHeight = 50; // Skills section header height
          let pageLeftHeight = skillsSectionHeight;
          
          // Reserve space for interests on each page
          const reservedForInterests = 150;
          const availableForSkills = maxLeftColumnHeight - reservedForInterests;
          
          // Add skills to this page, but respect the reserved space for interests
          while (skillIndex < data.strengths.length && pageLeftHeight < availableForSkills) {
            const skillHeight = 35; // Skill item height
            if (pageLeftHeight + skillHeight <= availableForSkills) {
              page.leftColumnContent.skills.push(data.strengths[skillIndex]);
              pageLeftHeight += skillHeight + 12; // 12px spacing
              skillIndex++;
            } else {
              break;
            }
          }
        }
      }
      
      // Then, add interests to the page that contains the last skill
      if (data.interests && data.interests.length > 0) {
        // Find the page with the last skill
        let lastSkillPageIndex = -1;
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i].leftColumnContent.skills.length > 0) {
            lastSkillPageIndex = i;
            break;
          }
        }
        
        // If we found a page with skills, add interests to that page
        if (lastSkillPageIndex >= 0) {
          const page = pages[lastSkillPageIndex];
          const interestsSectionHeight = 50; // Interests section header height
          let pageLeftHeight = interestsSectionHeight;
          
          // Calculate how much space is already used by skills on this page
          const skillsUsedHeight = page.leftColumnContent.skills.length * 35 + 
                                  (page.leftColumnContent.skills.length - 1) * 12 + // spacing between skills
                                  50; // skills section header
          
          // Reserve space for interests - ensure at least 150px is available
          const availableForInterests = Math.max(150, maxLeftColumnHeight - skillsUsedHeight);
          
          // Add interests to this page
          while (interestIndex < data.interests.length && pageLeftHeight < availableForInterests) {
            const interestHeight = 30; // Interest item height
            if (pageLeftHeight + interestHeight <= availableForInterests) {
              page.leftColumnContent.interests.push(data.interests[interestIndex]);
              pageLeftHeight += interestHeight + 8; // 8px spacing
              interestIndex++;
            } else {
              break;
            }
          }
        }
      }
    };
    
    distributeLeftColumnContent();
    
    return pages;
  };
  
  const pages = calculatePages();
  
  // Generate HTML for each page
  const pagesHtml = pages.map((pageContent, pageIndex) => {
    const isFirstPage = pageIndex === 0;
    
    // Track which sections have started across all pages
    const sectionsStarted = {
      workExperience: pageIndex > 0 || pages.slice(0, pageIndex).some(page => page.workExperience.length > 0),
      courses: pageIndex > 0 || pages.slice(0, pageIndex).some(page => page.courses.length > 0),
      education: pageIndex > 0 || pages.slice(0, pageIndex).some(page => page.education.length > 0)
    };
    
            return generatePageHtml(data, pageContent, isFirstPage, pageIndex, pages, sectionsStarted, exportSettings);
  });
  
  return pagesHtml.join('');
}

function generatePageHtml(data: ResumeData, pageContent: PageContent, isFirstPage: boolean, pageIndex: number, allPages: PageContent[], sectionsStarted: { workExperience: boolean; courses: boolean; education: boolean }, exportSettings?: ExportSettings): string {
  const { personalInfo } = data.content;
  
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Ensure URL has proper protocol for links
  const ensureUrlProtocol = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

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

  // Calculate underline width based on job title (matching React template)
  const calculateUnderlineWidth = (jobTitle: string): number => {
    // More accurate width calculation based on font size and character count
    // Using 16px font size and more precise character width calculation
    // This approximates the canvas measurement used in React template
    const charWidth = 8.5; // More accurate width per character for 16px font weight 500
    const baseWidth = jobTitle.length * charWidth;
    const calculatedWidth = baseWidth + 20; // Add 20px padding like React template
    return Math.min(calculatedWidth, 300); // Max 300px like React template fallback
  };

  // Contact info for left sidebar
  const contactInfo = [
    personalInfo.email && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">EMAIL</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${personalInfo.email}</div></div>`,
    personalInfo.phone && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">PHONE</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${personalInfo.phone}</div></div>`,
    (personalInfo.city || personalInfo.state) && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">LOCATION</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</div></div>`,
    personalInfo.website && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">WEBSITE</div><a href="${personalInfo.website}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.website)}</a></div>`,
    personalInfo.linkedin && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">LINKEDIN</div><a href="${ensureUrlProtocol(personalInfo.linkedin)}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.linkedin)}</a></div>`,
    personalInfo.github && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px; font-weight: bold;">GITHUB</div><a href="${personalInfo.github}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.github)}</a></div>`
  ].filter(Boolean).join('');

  // Header section
  const headerHtml = `
    <div class="header-background" style="margin-bottom: 16px; background: #c8665b; padding: 12px; border-radius: 0;">
      <div style="
        font-size: 30px; 
        font-weight: 500; 
        color: white; 
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        line-height: 1;
        margin-bottom: 4px;
      ">${personalInfo.name}</div>
      ${data.jobTitle ? `
        <div style="
          font-size: 16px; 
          font-weight: 500; 
          color: white;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1.2;
        ">${data.jobTitle}</div>
        <div style="
          width: ${calculateUnderlineWidth(data.jobTitle)}px; 
          height: 1px; 
          background: white; 
          margin: 6px 0 12px 0;
        "></div>
      ` : ''}
      <div style="
        font-size: 12px; 
        color: white;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        line-height: 1;
        margin-right: 14px;
      ">${personalInfo.summary}</div>
    </div>
  `;

  // Work experience HTML
  const workExperienceHtml = pageContent.workExperience.map((work) => {
    const dateRange = work.current 
      ? `${formatDate(work.startDate)} - PRESENT`
      : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
    
    const bulletPoints = work.bulletPoints.map((bullet) => 
      `<div style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><div style="width: 5px; height: 5px; border: 1px solid #c8665b; background: transparent; margin-right: 8px; flex-shrink: 0; margin-top: 6px; border-radius: 0;"></div><div style="flex: 1; font-size: 12px; line-height: 1.4; text-align: justify;">${bullet.description}</div></div>`
    ).join('');

    return `
      <div class="work-experience-item" style="margin-bottom: 12px; margin-left: 20px;">
        <div style="font-weight: 700; font-size: 16px; color: #c8665b; margin-bottom: 8px;">${work.position}</div>
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${work.company}</div>
        <div style="font-size: 10px; color: #c8665b; font-style: italic; margin-bottom: 8px;">${dateRange}</div>
        ${bulletPoints ? `<div style="font-size: 12px; line-height: 1.4;">${bulletPoints}</div>` : ''}
      </div>
    `;
  }).join('');

  // Education HTML
  const educationHtml = pageContent.education.map((edu) => {
    const dateRange = edu.current 
      ? `${formatDate(edu.startDate)} - PRESENT`
      : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
    
    return `
      <div style="margin-bottom: 12px; margin-left: 20px;">
        <div style="font-weight: 600; font-size: 16px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; line-height: 1; margin-bottom: 4px;">${edu.degree} in ${edu.field}</div>
        <div style="font-size: 14px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 0.7; margin-bottom: 7px;">${edu.institution}</div>
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
          <div style="font-size: 10px; color: #c8665b; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; font-style: italic;">${dateRange}</div>
          ${edu.gpa ? `<div style="font-size: 10px; color: #c8665b; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; font-style: italic;">GPA: ${edu.gpa}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Courses HTML
  const coursesHtml = pageContent.courses && pageContent.courses.length > 0 ? pageContent.courses.map((course) => 
    `<div style="margin-bottom: 8px; margin-left: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
        <div style="font-size: 14px; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; flex: 1;">${course.title}</div>
        ${course.link ? `<a href="${course.link}" target="_blank" rel="noopener noreferrer" style="color: #c8665b; display: flex; align-items: center; text-decoration: none; font-weight: bold;">LINK</a>` : ''}
      </div>
      <div style="font-size: 10px; color: #888; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2; font-style: italic;">${course.provider}</div>
    </div>`
  ).join('') : '';

  return `
    <div class="resume-page" style="
      display: flex;
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      color: #333;
      width: 100%; /* Use full available width from parent container */
      min-height: 1100px; /* Minimum height for Letter size, but allow content to expand */
      position: relative;
      margin: 0 auto;
      margin-bottom: ${pageIndex > 0 ? '20px' : '0'};
      page-break-after: ${pageIndex > 0 ? 'always' : 'auto'};
      flex-shrink: 0;
    ">
      <div class="left-column" style="
        width: 221px;
        padding: 24px 24px 90px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      ">
        ${isFirstPage && data.profilePicture && data.profilePicture.trim() !== '' && data.profilePicture.startsWith('data:') ? `<div style="width: 160px; height: 160px; border-radius: 10%; margin-bottom: 20px; overflow: hidden; flex-shrink: 0;"><img src="${data.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10%; display: block;" onerror="this.parentElement.style.display='none';" /></div>` : ''}
        ${isFirstPage ? `<div style="width: 160px; margin-bottom: 24px;">${contactInfo}</div>` : ''}
        ${pageContent.leftColumnContent.skills && pageContent.leftColumnContent.skills.length > 0 ? `
        <div style="width: 100%; max-width: 180px; margin-bottom: 32px;">
          ${(() => {
            // Check if this is the first page that has skills
            let isFirstPageWithSkills = false;
            for (let i = 0; i <= pageIndex; i++) {
              if (i === pageIndex) {
                isFirstPageWithSkills = true;
                break;
              }
              if (allPages[i].leftColumnContent.skills.length > 0) {
                break;
              }
            }
            return isFirstPageWithSkills;
          })() ? `
          <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 16;">
            <div style="font-weight: 700; font-size: 16px; color: #c8665b; text-align: left;">TECHNICAL SKILLS</div>
            <div style="width: 100%; height: 2px; background: #c8665b; margin: 2px 0 0 0;"></div>
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 10;">
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
            </div>
          </div>
          ` : ''}
          ${pageContent.leftColumnContent.skills.map((skill) => 
            `<div class="skill-item" style="margin-bottom: 12px; font-size: 12px;">
              <div style="margin-bottom: 4px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2;">${skill.skillName}</div>
              <div style="width: 100%; height: 10px; background: transparent; border: 2px solid #c8665b; overflow: hidden;">
                <div class="skill-bar-fill" style="width: ${(skill.rating / 10) * 100}%; height: 100%; background: #c8665b; padding: 1px;"></div>
              </div>
            </div>`
          ).join('')}
        </div>
        ` : ''}
        ${pageContent.leftColumnContent.interests && pageContent.leftColumnContent.interests.length > 0 ? `
        <div style="width: 100%; max-width: 180px; justify-content: flex-start;">
          <div style="font-weight: 700; font-size: 16px; color: #c8665b; text-align: left;">INTERESTS</div>
                                             <div style="width: 100%; height: 2px; background: #c8665b; margin: 2px 0 12px 0;"></div>
          ${pageContent.leftColumnContent.interests.map((interest) => 
            `<div style="margin-bottom: 8px; font-size: 12px;">• ${interest.name}</div>`
          ).join('')}
        </div>
        ` : ''}
      </div>
      <div class="right-column" style="
        width: 629px;
        margin: 24px 24px 90px 0;
        box-sizing: border-box;
      ">
        ${isFirstPage && data.jobTitle ? headerHtml : ''}
        ${pageContent.workExperience.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            ${!sectionsStarted.workExperience ? `
              <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 4; margin-left: 20px;">WORK EXPERIENCE</div>
              <div style="width: 100%; height: 2px; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ` : ''}
            ${workExperienceHtml}
          </div>
        ` : ''}
        ${pageContent.courses && pageContent.courses.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">COURSES & TRAININGS</div>
            <div style="width: 100%; height: 2px; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${coursesHtml}
          </div>
        ` : ''}
        ${pageContent.education.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">EDUCATION</div>
            <div style="width: 100%; height: 2px; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${educationHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderClassicTemplate(data: ResumeData, exportSettings?: ExportSettings): string {
  const { personalInfo } = data.content;

  // Format date helper - matches React component exactly
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      let date: Date;
      
      // Handle YYYY-MM-DD format (from API) to avoid timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed
      } else if (/^[A-Za-z]{3} \d{4}$/.test(dateString)) { // Handle "MMM YYYY" format
        const [monthStr, yearStr] = dateString.split(' ');
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthStr);
        const year = parseInt(yearStr);
        if (monthIndex !== -1 && !isNaN(year)) {
          date = new Date(year, monthIndex, 1); // Set to 1st day of the month to avoid timezone issues with month end
        } else {
          date = new Date(dateString); // Fallback if parsing fails
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const result = `${month} ${year}`;
      return result;
    } catch {
      return dateString;
    }
  };

  // Format URL helper - matches React component
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Phone number formatting function - matches React component
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");

    // Limit to 10 digits
    const trimmed = phoneNumber.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (trimmed.length === 0) return "";
    if (trimmed.length <= 3) return `(${trimmed}`;
    if (trimmed.length <= 6)
      return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  };

  // Get font family with fallback - matches React component
  const getFontFamily = () => {
    return exportSettings?.fontFamily || 'Times New Roman, serif';
  };

  // Get font sizes with fallbacks - matches React component
  const getNameSize = () => exportSettings?.nameSize || 40;
  const getSectionHeadersSize = () => exportSettings?.sectionHeadersSize || 18;
  const getSubHeadersSize = () => exportSettings?.subHeadersSize || 16;
  const getBodyTextSize = () => exportSettings?.bodyTextSize || 14;
  const getSectionSpacing = () => exportSettings?.sectionSpacing || 20;
  const getEntrySpacing = () => exportSettings?.entrySpacing || 12;
  const getLineSpacing = () => exportSettings?.lineSpacing || 14;
  const getTopBottomMargin = () => exportSettings?.topBottomMargin || 40;
  const getSideMargins = () => exportSettings?.sideMargins || 40;
  const getPageWidth = () => exportSettings?.pageWidth || 850;
  const getPageHeight = () => exportSettings?.pageHeight || 1100;
  const getAlignTextLeftRight = () => exportSettings?.alignTextLeftRight || false;

  // Use the section order from data or fall back to default order
  const defaultSectionOrder = [
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
  
  const sectionOrder = data.sectionOrder || defaultSectionOrder;
  
  // Filter out sections that have no data
  const sectionsWithData = sectionOrder.filter(section => {
    switch (section) {
      case 'Professional Summary':
        return personalInfo.summary && personalInfo.summary.trim() !== '';
      case 'Technical Skills':
        return (data.strengths && data.strengths.length > 0) || (data.skillCategories && data.skillCategories.length > 0);
      case 'Work Experience':
        return (data.workExperience && data.workExperience.length > 0);
      case 'Education':
        return (data.education && data.education.length > 0);
      case 'Projects':
        return (data.projects && data.projects.length > 0);
      case 'Courses':
        return (data.courses && data.courses.length > 0);
      case 'Languages':
        return (data.languages && data.languages.length > 0);
      case 'Publications':
        return (data.publications && data.publications.length > 0);
      case 'Awards':
        return (data.awards && data.awards.length > 0);
      case 'Volunteer Experience':
        return (data.volunteerExperience && data.volunteerExperience.length > 0);
      case 'References':
        return (data.references && data.references.length > 0);
      case 'Skills':
        return (data.strengths && data.strengths.length > 0);
      case 'Interests':
        return (data.interests && data.interests.length > 0);
      default:
        return false;
    }
  });

  // Helper function to get subsections for each section
  const getSubsections = (sectionName: string) => {
    switch (sectionName) {
      case 'Professional Summary':
        return [{ id: 'professional-summary', name: 'Professional Summary', isFirst: true }];
      case 'Technical Skills':
        const subsections = [];
        
        // Add strengths as first subsection
        if (data.strengths && data.strengths.length > 0) {
          subsections.push({ 
            id: 'technical-skills-strengths', 
            name: 'Strengths', 
            isFirst: true 
          });
        }
        
        // Add skill categories as separate subsections
        if (data.skillCategories && data.skillCategories.length > 0) {
          data.skillCategories.forEach((category, index) => {
            subsections.push({ 
              id: `technical-skills-category-${index}`, 
              name: category.title, 
              isFirst: index === 0 && subsections.length === 0 // First category is first if no strengths exist
            });
          });
        }
        
        // If no strengths or categories, return a default subsection
        if (subsections.length === 0) {
          subsections.push({ 
            id: 'technical-skills', 
            name: 'Technical Skills', 
            isFirst: true 
          });
        }
        
        return subsections;
      case 'Work Experience':
        return (data.workExperience || []).map((work, index) => ({
          id: `work-${index}`,
          name: `${work.position} at ${work.company}`,
          isFirst: index === 0
        }));
      case 'Education':
        return (data.education || []).map((edu, index) => ({
          id: `education-${index}`,
          name: `${edu.degree} at ${edu.institution}`,
          isFirst: index === 0
        }));
      case 'Courses':
        return (data.courses || []).map((course, index) => ({
          id: `course-${index}`,
          name: `${course.title} - ${course.provider}`,
          isFirst: index === 0
        }));
      case 'Projects':
        return (data.projects || []).map((project, index) => ({
          id: `project-${index}`,
          name: project.title,
          isFirst: index === 0
        }));
      case 'Languages':
        return [{ id: 'languages', name: 'Languages', isFirst: true }];
      case 'Publications':
        return (data.publications || []).map((pub, index) => ({
          id: `publication-${index}`,
          name: pub.title,
          isFirst: index === 0
        }));
      case 'Awards':
        return (data.awards || []).map((award, index) => ({
          id: `award-${index}`,
          name: award.title,
          isFirst: index === 0
        }));
      case 'Volunteer Experience':
        return (data.volunteerExperience || []).map((volunteer, index) => ({
          id: `volunteer-${index}`,
          name: `${volunteer.position} at ${volunteer.organization}`,
          isFirst: index === 0
        }));
      case 'References':
        return (data.references || []).map((reference, index) => ({
          id: `reference-${index}`,
          name: `${reference.name} - ${reference.title}`,
          isFirst: index === 0
        }));
      case 'Interests':
        return [{ id: 'interests', name: 'Interests', isFirst: true }];
      default:
        return [{ id: sectionName.toLowerCase().replace(/\s+/g, '-'), name: sectionName, isFirst: true }];
    }
  };

  // Helper function to estimate subsection heights
  const getEstimatedSubsectionHeight = (sectionName: string, subsection: { id: string; name: string; isFirst: boolean }): number => {
    const sectionHeadersSize = getSectionHeadersSize();
    const subHeadersSize = getSubHeadersSize();
    const bodyTextSize = getBodyTextSize();
    const lineSpacing = getLineSpacing();
    const entrySpacing = getEntrySpacing();
    
    const sectionHeaderHeight = sectionHeadersSize + 6;
    const subHeaderHeight = subHeadersSize + 2;
    const bodyLineHeight = Math.max(bodyTextSize + 1, lineSpacing - 1);
    
    if (subsection.isFirst) {
      const firstSubsectionMargin = 1;
      switch (sectionName) {
        case 'Professional Summary':
          return sectionHeaderHeight + (bodyLineHeight * 2) + firstSubsectionMargin;
        case 'Technical Skills':
          // Handle individual technical skills subsections
          if (subsection.id === 'technical-skills-strengths') {
            const strengthsCount = data.strengths?.length || 0;
            const strengthsHeight = strengthsCount * bodyLineHeight * 0.8;
            return sectionHeaderHeight + strengthsHeight + firstSubsectionMargin;
          } else if (subsection.id.startsWith('technical-skills-category-')) {
            const categoryIndex = parseInt(subsection.id.split('-')[3]) || 0;
            const category = data.skillCategories?.[categoryIndex];
            if (category) {
              // Skills are rendered inline with commas, estimate based on how many lines needed
              const skillsPerLine = 8;
              const linesNeeded = Math.ceil(category.skills.length / skillsPerLine);
              // Account for category title (subHeaderHeight), marginBottom (4px), and skills content
              const categoryHeight = subHeaderHeight + 4 + (linesNeeded * bodyLineHeight);
              // Add section header height if this is the first subsection
              return subsection.isFirst ? sectionHeaderHeight + categoryHeight + firstSubsectionMargin : categoryHeight;
            }
          } else if (subsection.id === 'technical-skills') {
            // Fallback for default technical skills subsection - calculate total height for all content
            let totalHeight = sectionHeaderHeight + firstSubsectionMargin;
            
            // Add strengths if they exist
            if (data.strengths && data.strengths.length > 0) {
              const strengthsCount = data.strengths.length;
              const strengthsHeight = strengthsCount * bodyLineHeight * 0.8;
              totalHeight += strengthsHeight;
            }
            
            // Add skill categories if they exist
            if (data.skillCategories && data.skillCategories.length > 0) {
              data.skillCategories.forEach((category, index) => {
                // Category title height + marginBottom (4px)
                totalHeight += subHeaderHeight + 4;
                
                // Skills content height
                const skillsPerLine = 8;
                const linesNeeded = Math.ceil(category.skills.length / skillsPerLine);
                totalHeight += linesNeeded * bodyLineHeight;
                
                // Category marginBottom (8px) except for last category
                if (index < (data.skillCategories?.length || 0) - 1) {
                  totalHeight += 8;
                }
              });
            }
            
            // Add extra padding to be more conservative
            totalHeight += 20;
            
            return totalHeight;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp.length > 0) {
            const firstWork = workExp[0];
            const bulletPointsCount = firstWork.bulletPoints?.length || 0;
            return sectionHeaderHeight + subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight) + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Education':
          const education = data.education || [];
          if (education.length > 0) {
            const entrySpacingTotal = (education.length - 1) * entrySpacing;
            return sectionHeaderHeight + subHeaderHeight + (bodyLineHeight * 2) + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Courses':
          const courses = data.courses || [];
          if (courses.length > 0) {
            const courseHeight = courses.length * (bodyLineHeight * 2.5) + (courses.length * 4);
            const entrySpacingTotal = (courses.length - 1) * entrySpacing;
            return sectionHeaderHeight + courseHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Projects':
          const projects = data.projects || [];
          if (projects.length > 0) {
            const projectHeight = projects.length * (bodyLineHeight * 3) + (projects.length * 4);
            const entrySpacingTotal = (projects.length - 1) * entrySpacing;
            return sectionHeaderHeight + projectHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Languages':
          const languages = data.languages || [];
          if (languages.length > 0) {
            return sectionHeaderHeight + bodyLineHeight + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Publications':
          const publications = data.publications || [];
          if (publications.length > 0) {
            const publicationHeight = publications.length * (bodyLineHeight * 2.5) + (publications.length * 4);
            const entrySpacingTotal = (publications.length - 1) * entrySpacing;
            return sectionHeaderHeight + publicationHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Awards':
          const awards = data.awards || [];
          if (awards.length > 0) {
            const awardHeight = awards.length * (bodyLineHeight * 2.5) + (awards.length * 4);
            const entrySpacingTotal = (awards.length - 1) * entrySpacing;
            return sectionHeaderHeight + awardHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Volunteer Experience':
          const volunteerExp = data.volunteerExperience || [];
          if (volunteerExp.length > 0) {
            const volunteerHeight = volunteerExp.length * (bodyLineHeight * 2.5) + (volunteerExp.length * 4);
            const entrySpacingTotal = (volunteerExp.length - 1) * entrySpacing;
            return sectionHeaderHeight + volunteerHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'References':
          const references = data.references || [];
          if (references.length > 0) {
            const referenceHeight = references.length * (bodyLineHeight * 2.5) + (references.length * 4);
            const entrySpacingTotal = (references.length - 1) * entrySpacing;
            return sectionHeaderHeight + referenceHeight + entrySpacingTotal + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        case 'Interests':
          const interests = data.interests || [];
          if (interests.length > 0) {
            return sectionHeaderHeight + bodyLineHeight + firstSubsectionMargin;
          }
          return sectionHeaderHeight + firstSubsectionMargin;
        default:
          return sectionHeaderHeight + (bodyLineHeight * 2) + firstSubsectionMargin;
      }
    } else {
      switch (sectionName) {
        case 'Work Experience':
          const workExp = data.workExperience || [];
          const workIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (workExp[workIndex]) {
            const work = workExp[workIndex];
            const bulletPointsCount = work.bulletPoints?.length || 0;
            return subHeaderHeight + bodyLineHeight + (bulletPointsCount * bodyLineHeight) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Education':
          const education = data.education || [];
          const eduIndex = parseInt(subsection.id.split('-')[1]) || 0;
          if (education[eduIndex]) {
            return subHeaderHeight + (bodyLineHeight * 2) + entrySpacing;
          }
          return subHeaderHeight + entrySpacing;
        case 'Courses':
          return bodyLineHeight * 3 + 8 + entrySpacing;
        case 'Projects':
          return bodyLineHeight * 3 + 8 + entrySpacing;
        case 'Languages':
          return bodyLineHeight + entrySpacing;
        case 'Publications':
          return bodyLineHeight * 2.5 + 8 + entrySpacing;
        case 'Awards':
          return bodyLineHeight * 2.5 + 8 + entrySpacing;
        case 'Volunteer Experience':
          return bodyLineHeight * 2.5 + 8 + entrySpacing;
        case 'References':
          return bodyLineHeight * 2.5 + 8 + entrySpacing;
        case 'Technical Skills':
          // For non-first Technical Skills subsections (shouldn't happen with current structure)
          return bodyLineHeight * 2 + entrySpacing;
        default:
          return subHeaderHeight + (bodyLineHeight * 2) + entrySpacing;
      }
    }
  };

  // Calculate pages with improved pagination logic
  const calculatePages = () => {
    const pageHeight = getPageHeight();
    const topBottomMargin = getTopBottomMargin();
    const contentHeight = pageHeight - (topBottomMargin * 2);
    const headerHeight = data.profilePicture ? 180 : 120;
    
    const pages: { sections: string[]; pageNumber: number; subsections: Array<{ sectionName: string; subsectionId: string }> }[] = [];
    let currentPage = { sections: [] as string[], pageNumber: 0, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
    let currentHeight = headerHeight;
    
    pages.push(currentPage);
    
    const allSubsections: Array<{ sectionName: string; subsection: { id: string; name: string; isFirst: boolean } }> = [];
    
    for (const sectionName of sectionsWithData) {
      const subsections = getSubsections(sectionName);
      subsections.forEach(subsection => {
        allSubsections.push({ sectionName, subsection });
      });
    }
    
    const processedSubsections = new Set<string>();
    const sectionsStartedOnPages = new Map<string, number>();
    
    for (const { sectionName, subsection } of allSubsections) {
      const subsectionKey = `${sectionName}-${subsection.id}`;
      if (processedSubsections.has(subsectionKey)) {
        continue;
      }
      
      // Special handling for Technical Skills to ensure all subsections stay together
      if (sectionName === 'Technical Skills' && subsection.isFirst) {
        // Calculate total height for all Technical Skills subsections
        const technicalSkillsSubsections = getSubsections('Technical Skills');
        let totalTechnicalSkillsHeight = 0;
        
        for (const techSubsection of technicalSkillsSubsections) {
          const subHeight = getEstimatedSubsectionHeight('Technical Skills', techSubsection);
          const subIndex = technicalSkillsSubsections.findIndex(sub => sub.id === techSubsection.id);
          const subSectionSpacing = subIndex === technicalSkillsSubsections.length - 1 ? getSectionSpacing() : 0;
          totalTechnicalSkillsHeight += subHeight + subSectionSpacing;
        }
        
        const safetyBuffer = 50;
        const wouldExceedContent = (currentHeight + totalTechnicalSkillsHeight) > (contentHeight - safetyBuffer);
        
        if (wouldExceedContent) {
          if (sectionsStartedOnPages.has(sectionName)) {
            const sectionPageIndex = sectionsStartedOnPages.get(sectionName)!;
            if (sectionPageIndex === currentPage.pageNumber) {
              currentPage.sections = currentPage.sections.filter(s => s !== sectionName);
              currentPage.subsections = currentPage.subsections.filter(sub => sub.sectionName !== sectionName);
              sectionsStartedOnPages.delete(sectionName);
            }
          }
          
          currentPage = { sections: [] as string[], pageNumber: pages.length, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
          pages.push(currentPage);
          currentHeight = 0;
        }
        
        // Add all Technical Skills subsections to the current page
        if (!sectionsStartedOnPages.has(sectionName)) {
          currentPage.sections.push(sectionName);
          sectionsStartedOnPages.set(sectionName, currentPage.pageNumber);
        }
        
        for (const techSubsection of technicalSkillsSubsections) {
          const techSubsectionKey = `${sectionName}-${techSubsection.id}`;
          if (!processedSubsections.has(techSubsectionKey)) {
            currentPage.subsections.push({ sectionName, subsectionId: techSubsection.id });
            processedSubsections.add(techSubsectionKey);
          }
        }
        
        currentHeight += totalTechnicalSkillsHeight;
        continue; // Skip the normal processing for Technical Skills
      }
      
      const estimatedHeight = getEstimatedSubsectionHeight(sectionName, subsection);
      const subsections = getSubsections(sectionName);
      const currentIndex = subsections.findIndex(sub => sub.id === subsection.id);
      const sectionSpacing = currentIndex === subsections.length - 1 ? getSectionSpacing() : 0;
      
      const totalHeight = estimatedHeight + sectionSpacing;
      const safetyBuffer = 50;
      const wouldExceedContent = (currentHeight + totalHeight) > (contentHeight - safetyBuffer);
      
      if (subsection.isFirst && wouldExceedContent) {
        if (sectionsStartedOnPages.has(sectionName)) {
          const sectionPageIndex = sectionsStartedOnPages.get(sectionName)!;
          if (sectionPageIndex === currentPage.pageNumber) {
            currentPage.sections = currentPage.sections.filter(s => s !== sectionName);
            currentPage.subsections = currentPage.subsections.filter(sub => sub.sectionName !== sectionName);
            sectionsStartedOnPages.delete(sectionName);
          }
        }
        
        currentPage = { sections: [] as string[], pageNumber: pages.length, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
        pages.push(currentPage);
        currentHeight = 0;
      } else if (wouldExceedContent && (currentPage.pageNumber > 0 || currentPage.subsections.length > 0)) {
        currentPage = { sections: [] as string[], pageNumber: pages.length, subsections: [] as Array<{ sectionName: string; subsectionId: string }> };
        pages.push(currentPage);
        currentHeight = 0;
      }
      
      if (!sectionsStartedOnPages.has(sectionName)) {
        currentPage.sections.push(sectionName);
        sectionsStartedOnPages.set(sectionName, currentPage.pageNumber);
      }
      
      currentPage.subsections.push({ sectionName, subsectionId: subsection.id });
      processedSubsections.add(subsectionKey);
      currentHeight += totalHeight;
    }
    
    return pages;
  };

  const pages = calculatePages();

  // Render functions for each section
  const renderHeader = () => `
    <div style="text-align: center; margin-bottom: ${getSectionSpacing()}px;">
      ${data.profilePicture && data.profilePicture.trim() !== '' && data.profilePicture.startsWith('data:') ? `
        <div style="
          width: 120px;
          height: 120px;
          border-radius: 50%; 
          background-image: url('${data.profilePicture}');
          background-size: cover;
          background-position: center;
          margin: 0 auto 12px auto;
          border: 3px solid #000;
        "></div>
      ` : ''}
      <h1 style="
        font-size: ${getNameSize()}px; 
        font-weight: normal; 
        margin: 0 0 1px 0;
        font-family: ${getFontFamily()};
      ">
        ${personalInfo.name}
      </h1>
      ${data.jobTitle ? `
        <div style="
          font-size: 16px; 
          font-weight: normal; 
          margin: 0 0 4px 0;
          font-family: ${getFontFamily()};
          color: #333;
        ">
          ${data.jobTitle}
        </div>
      ` : ''}
      <div style="
        font-size: 12px; 
        color: #333;
        font-family: ${getFontFamily()};
        line-height: 1.2;
      ">
        ${[
          (personalInfo.city || personalInfo.state) && [personalInfo.city, personalInfo.state].filter(Boolean).join(', '),
          formatPhoneNumber(personalInfo.phone),
          personalInfo.email,
          personalInfo.linkedin && `<a href="${personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}" target="_blank" rel="noopener noreferrer" style="color: #333; text-decoration: underline; cursor: pointer;">LinkedIn</a>`,
          personalInfo.github && `<a href="${personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}" target="_blank" rel="noopener noreferrer" style="color: #333; text-decoration: underline; cursor: pointer;">GitHub</a>`,
          personalInfo.website && `<a href="${personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`}" target="_blank" rel="noopener noreferrer" style="color: #333; text-decoration: underline; cursor: pointer;">${formatUrl(personalInfo.website)}</a>`
        ].filter(Boolean).map((item, index, array) => 
          `<span>${item}${index < array.length - 1 ? ' • ' : ''}</span>`
        ).join('')}
      </div>
    </div>
  `;

  const renderProfessionalSummary = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Professional Summary
      </h2>
      <p style="
        font-size: ${getBodyTextSize()}px; 
        margin: 0; 
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${personalInfo.summary}
      </p>
    </div>
  `;

  const renderTechnicalSkills = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Technical Skills
      </h2>
      ${data.strengths && data.strengths.length > 0 ? `
        <div style="
          font-size: ${getBodyTextSize()}px; 
          font-family: ${getFontFamily()};
          line-height: ${getLineSpacing()}px;
          margin-bottom: 0px;
          text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
        ">
          ${data.strengths.map((skill, index) => 
            `<span>${skill.skillName}${index < data.strengths.length - 1 ? ' • ' : ''}</span>`
          ).join('')}
        </div>
      ` : ''}
    </div>
  `;

  const renderWorkExperience = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Work Experience
      </h2>
      ${data.workExperience.map((work, index) => `
        <div style="padding-bottom: ${getEntrySpacing()}px;">
          <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 2px;
          ">
            <div style="
              font-size: ${getSubHeadersSize()}px; 
              font-weight: bold; 
              font-family: ${getFontFamily()};
            ">
              ${work.company}
              ${work.city && work.state && `, ${work.city}, ${work.state}`}
            </div>
            <div style="
              font-size: ${getBodyTextSize()}px;
              font-family: ${getFontFamily()};
              font-weight: bold;
            ">
              ${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}
            </div>
          </div>
          <div style="
            font-size: ${getBodyTextSize()}px; 
            font-style: italic;
            font-family: ${getFontFamily()};
            margin-bottom: 2px;
          ">
            ${work.position}
          </div>
          ${work.bulletPoints && work.bulletPoints.length > 0 ? `
            <ul style="
              margin: 0; 
              padding-left: 20px;
              font-size: ${getBodyTextSize()}px;
              font-family: ${getFontFamily()};
              line-height: ${getLineSpacing()}px;
            ">
              ${work.bulletPoints.map((point, pointIndex) => `
                <li style="
                  margin-bottom: 2px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${point.description}
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  const renderEducation = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Education
      </h2>
      ${data.education.map((edu, index) => `
        <div style="padding-bottom: ${getEntrySpacing()}px;">
          <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 4px;
          ">
            <div style="
              font-size: ${getSubHeadersSize()}px; 
              font-weight: bold; 
              font-family: ${getFontFamily()};
            ">
              ${edu.degree} in ${edu.field}
            </div>
            <div style="
              font-size: ${getBodyTextSize()}px;
              font-family: ${getFontFamily()};
              font-weight: bold;
            ">
              ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
            </div>
          </div>
          <div style="
            font-size: ${getBodyTextSize()}px;
            font-family: ${getFontFamily()};
            text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
          ">
            ${edu.institution}
            ${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const renderCourses = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Courses
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.courses || []).map((course, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${course.title}</strong> - ${course.provider}
            </div>
            ${course.link ? `
              <div>
                <a href="${course.link.startsWith('http') ? course.link : `https://${course.link}`}" target="_blank" rel="noopener noreferrer" style="
                  color: #0066cc; 
                  text-decoration: underline;
                  cursor: pointer;
                  font-size: ${getBodyTextSize()}px;
                  font-family: ${getFontFamily()};
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${formatUrl(course.link)}
                </a>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const renderInterests = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Interests
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.interests || []).map((interest, index) => `
          <span>
            <span style="margin-right: 4px;">${interest.icon}</span>
            ${interest.name}
            ${index < (data.interests?.length || 0) - 1 ? ' • ' : ''}
          </span>
        `).join('')}
      </div>
    </div>
  `;

  const renderProjects = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Projects
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.projects || []).map((project, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${project.title}</strong>
            </div>
            <div style="margin-bottom: 2px;">
              ${project.description}
            </div>
            <div style="margin-bottom: 2px;">
              <strong>Technologies:</strong> ${project.technologies.join(', ')}
            </div>
            ${project.link ? `
              <div>
                <a href="${project.link.startsWith('http') ? project.link : `https://${project.link}`}" target="_blank" rel="noopener noreferrer" style="
                  color: #0066cc; 
                  text-decoration: underline;
                  cursor: pointer;
                  font-size: ${getBodyTextSize()}px;
                  font-family: ${getFontFamily()};
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${formatUrl(project.link)}
                </a>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const renderLanguages = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Languages
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.languages || []).map((language, index) => `
          <span>
            ${language.name} (${language.proficiency})
            ${index < (data.languages?.length || 0) - 1 ? ' • ' : ''}
          </span>
        `).join('')}
      </div>
    </div>
  `;

  const renderPublications = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Publications
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.publications || []).map((pub, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${pub.title}</strong>
            </div>
            <div style="margin-bottom: 2px;">
              ${pub.authors} - ${pub.journal} (${pub.year})
            </div>
            ${pub.link ? `
              <div>
                <a href="${pub.link.startsWith('http') ? pub.link : `https://${pub.link}`}" target="_blank" rel="noopener noreferrer" style="
                  color: #0066cc; 
                  text-decoration: underline;
                  cursor: pointer;
                  font-size: ${getBodyTextSize()}px;
                  font-family: ${getFontFamily()};
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${formatUrl(pub.link)}
                </a>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const renderAwards = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Awards
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.awards || []).map((award, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${award.title}</strong> - ${award.issuer} (${award.year})
            </div>
            ${award.description ? `
              <div style="margin-bottom: 2px;">
                ${award.description}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const renderVolunteerExperience = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        Volunteer Experience
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.volunteerExperience || []).map((volunteer, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${volunteer.position}</strong> at ${volunteer.organization}
            </div>
            <div style="margin-bottom: 2px;">
              ${formatDate(volunteer.startDate)} - ${volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
            </div>
            <div style="margin-bottom: 2px;">
              ${volunteer.description}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const renderReferences = () => `
    <div style="margin-bottom: ${getSectionSpacing()}px;">
      <h2 style="
        font-size: ${getSectionHeadersSize()}px; 
        font-weight: bold; 
        margin: 0 0 0px 0;
        font-family: ${getFontFamily()};
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
      ">
        References
      </h2>
      <div style="
        font-size: ${getBodyTextSize()}px;
        font-family: ${getFontFamily()};
        line-height: ${getLineSpacing()}px;
        margin-top: 4px;
        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
      ">
        ${(data.references || []).map((reference, index) => `
          <div style="padding-bottom: ${getEntrySpacing()}px;">
            <div style="
              margin-bottom: 2px;
              text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
            ">
              <strong>${reference.name}</strong> - ${reference.title}
            </div>
            <div style="margin-bottom: 2px;">
              ${reference.company}
            </div>
            <div style="margin-bottom: 2px;">
              ${reference.email} • ${reference.phone}
            </div>
            <div style="margin-bottom: 2px;">
              ${reference.relationship}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Helper function to get render function for a section
  const getRenderFunction = (sectionName: string) => {
    switch (sectionName) {
      case 'Professional Summary':
        return renderProfessionalSummary;
      case 'Technical Skills':
        return renderTechnicalSkills;
      case 'Work Experience':
        return renderWorkExperience;
      case 'Education':
        return renderEducation;
      case 'Projects':
        return renderProjects;
      case 'Courses':
        return renderCourses;
      case 'Languages':
        return renderLanguages;
      case 'Publications':
        return renderPublications;
      case 'Awards':
        return renderAwards;
      case 'Volunteer Experience':
        return renderVolunteerExperience;
      case 'References':
        return renderReferences;
      case 'Interests':
        return renderInterests;
      default:
        return () => '';
    }
  };

  // Helper function to render a specific subsection
  const renderSubsection = (sectionName: string, subsection: { id: string; name: string; isFirst: boolean }) => {
    const itemIndex = parseInt(subsection.id.split('-')[1]) || 0;
    
    if (subsection.isFirst) {
      switch (sectionName) {
        case 'Professional Summary':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 0px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Professional Summary
              </h2>
              <p style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px; 
                margin-top: 4px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${personalInfo.summary}
              </p>
            </div>
          `;
        case 'Technical Skills':
          if (subsection.id === 'technical-skills-strengths') {
            return `
              <div>
                <h2 style="
                  font-size: ${getSectionHeadersSize()}px; 
                  font-weight: bold; 
                  margin-bottom: 0px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 0px;
                ">
                  Technical Skills
                </h2>
                <div style="
                  font-size: ${getBodyTextSize()}px; 
                  line-height: ${getLineSpacing()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${data.strengths.map((skill, index) => 
                    `<span>${skill.skillName}${index < data.strengths.length - 1 ? ', ' : ''}</span>`
                  ).join('')}
                </div>
              </div>
            `;
          } else if (subsection.id.startsWith('technical-skills-category-')) {
            const categoryIndex = parseInt(subsection.id.split('-')[3]) || 0;
            const category = data.skillCategories?.[categoryIndex];
            if (category) {
              return `
                <div>
                  ${subsection.isFirst ? `
                    <h2 style="
                      font-size: ${getSectionHeadersSize()}px; 
                      font-weight: bold; 
                      margin-bottom: 0px;
                      border-bottom: 1px solid #000;
                      padding-bottom: 0px;
                    ">
                      Technical Skills
                    </h2>
                  ` : ''}
                  <div style="margin-top: 4px;">
                    <div style="
                      font-size: ${getSubHeadersSize()}px; 
                      font-weight: bold; 
                      margin-bottom: 4px;
                    ">
                      ${category.title}
                    </div>
                    <div style="
                      font-size: ${getBodyTextSize()}px; 
                      line-height: ${getLineSpacing()}px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      ${category.skills.map((skill, index) => 
                        `<span>${skill.name}${index < category.skills.length - 1 ? ', ' : ''}</span>`
                      ).join('')}
                    </div>
                  </div>
                </div>
              `;
            }
          } else if (subsection.id === 'technical-skills') {
            // Fallback for default technical skills subsection
            let content = '';
            
            // Add strengths if they exist
            if (data.strengths && data.strengths.length > 0) {
              content += `
                <div style="
                  font-size: ${getBodyTextSize()}px; 
                  line-height: ${getLineSpacing()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${data.strengths.map((skill, index) => 
                    `<span>${skill.skillName}${index < data.strengths.length - 1 ? ', ' : ''}</span>`
                  ).join('')}
                </div>
              `;
            }
            
            // Add skill categories if they exist
            if (data.skillCategories && data.skillCategories.length > 0) {
              data.skillCategories.forEach((category, index) => {
                content += `
                  <div style="margin-top: ${index === 0 && !data.strengths?.length ? '4px' : '8px'};">
                    <div style="
                      font-size: ${getSubHeadersSize()}px; 
                      font-weight: bold; 
                      margin-bottom: 4px;
                    ">
                      ${category.title}
                    </div>
                    <div style="
                      font-size: ${getBodyTextSize()}px; 
                      line-height: ${getLineSpacing()}px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      ${category.skills.map((skill, skillIndex) => 
                        `<span>${skill.name}${skillIndex < category.skills.length - 1 ? ', ' : ''}</span>`
                      ).join('')}
                    </div>
                  </div>
                `;
              });
            }
            
            return `
              <div>
                <h2 style="
                  font-size: ${getSectionHeadersSize()}px; 
                  font-weight: bold; 
                  margin-bottom: 0px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 0px;
                ">
                  Technical Skills
                </h2>
                ${content}
              </div>
            `;
          }
          return '';
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp[itemIndex]) {
            const work = workExp[itemIndex];
            return `
              <div>
                <h2 style="
                  font-size: ${getSectionHeadersSize()}px; 
                  font-weight: bold; 
                  margin-bottom: 0px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 1px;
                ">
                  Work Experience
                </h2>
                <div style="padding-bottom: ${getEntrySpacing()}px; margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: ${getSubHeadersSize()}px;">
                      ${work.company}${work.city && work.state ? `, ${work.city}, ${work.state}` : ''}
                    </div>
                    <div style="font-size: ${getBodyTextSize()}px; font-weight: bold;">
                      ${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}
                    </div>
                  </div>
                  <div style="font-style: italic; font-size: ${getBodyTextSize()}px;">
                    ${work.position}
                  </div>
                  ${work.bulletPoints && work.bulletPoints.length > 0 ? `
                    <ul style="margin: 2px 0; padding-left: 20px;">
                      ${work.bulletPoints.map((bullet, bulletIndex) => `
                        <li style="font-size: ${getBodyTextSize()}px; line-height: ${getLineSpacing()}px;">
                          ${bullet.description}
                        </li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `;
          }
          break;
        case 'Education':
          const education = data.education || [];
          if (education[itemIndex]) {
            const edu = education[itemIndex];
            return `
              <div>
                <h2 style="
                  font-size: ${getSectionHeadersSize()}px; 
                  font-weight: bold; 
                  margin-bottom: 0px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 1px;
                ">
                  Education
                </h2>
                <div style="padding-bottom: ${getEntrySpacing()}px; margin-top: 4px;">
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start;
                    margin-bottom: 4px;
                  ">
                    <div style="
                      font-size: ${getSubHeadersSize()}px; 
                      font-weight: bold;
                      font-family: ${getFontFamily()};
                    ">
                      ${edu.degree} in ${edu.field}
                    </div>
                    <div style="
                      font-size: ${getBodyTextSize()}px;
                      font-family: ${getFontFamily()};
                      font-weight: bold;
                    ">
                      ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                    </div>
                  </div>
                  <div style="
                    font-size: ${getBodyTextSize()}px;
                    font-family: ${getFontFamily()};
                    text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                  ">
                    ${edu.institution}
                    ${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
              </div>
            `;
          }
          break;
        case 'Courses':
          const courses = data.courses || [];
          if (courses[itemIndex]) {
            const course = courses[itemIndex];
            return `
              <div>
                <h2 style="
                  font-size: ${getSectionHeadersSize()}px; 
                  font-weight: bold; 
                  margin-bottom: 10px;
                  border-bottom: 1px solid #000;
                  padding-bottom: 1px;
                ">
                  Courses
                </h2>
                <div style="padding-bottom: ${getEntrySpacing()}px;">
                  <div style="
                    font-weight: bold; 
                    font-size: ${getSubHeadersSize()}px;
                    text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                  ">
                    ${course.title}
                  </div>
                  <div style="
                    font-size: ${getBodyTextSize()}px;
                    text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                  ">
                    ${course.provider}
                  </div>
                </div>
              </div>
            `;
          }
          break;
        case 'Projects':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Projects
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.projects || []).map((project, index) => `
                  <div style="padding-bottom: ${getEntrySpacing()}px;">
                    <div style="
                      margin-bottom: 2px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      <strong>${project.title}</strong>
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${project.description}
                    </div>
                    <div style="margin-bottom: 2px;">
                      <strong>Technologies:</strong> ${project.technologies.join(', ')}
                    </div>
                    ${project.link ? `
                      <div>
                        <a href="${project.link.startsWith('http') ? project.link : `https://${project.link}`}" target="_blank" rel="noopener noreferrer" style="
                          color: #0066cc; 
                          text-decoration: underline;
                          cursor: pointer;
                          font-size: ${getBodyTextSize()}px;
                          font-family: ${getFontFamily()};
                          text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                        ">
                          ${formatUrl(project.link)}
                        </a>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'Languages':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Languages
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.languages || []).map((language, index) => `
                  <span>${language.name} (${language.proficiency})${index < (data.languages?.length || 0) - 1 ? ', ' : ''}</span>
                `).join('')}
              </div>
            </div>
          `;
        case 'Publications':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Publications
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.publications || []).map((pub, index) => `
                  <div style="padding-bottom: ${getEntrySpacing()}px;">
                    <div style="
                      margin-bottom: 2px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      <strong>${pub.title}</strong>
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${pub.authors} - ${pub.journal} (${pub.year})
                    </div>
                    ${pub.link ? `
                      <div>
                        <a href="${pub.link.startsWith('http') ? pub.link : `https://${pub.link}`}" target="_blank" rel="noopener noreferrer" style="
                          color: #0066cc; 
                          text-decoration: underline;
                          cursor: pointer;
                          font-size: ${getBodyTextSize()}px;
                          font-family: ${getFontFamily()};
                          text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                        ">
                          ${formatUrl(pub.link)}
                        </a>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'Awards':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Awards
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.awards || []).map((award, index) => `
                  <div style="padding-bottom: ${getEntrySpacing()}px;">
                    <div style="
                      margin-bottom: 2px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      <strong>${award.title}</strong> - ${award.issuer} (${award.year})
                    </div>
                    ${award.description ? `
                      <div style="margin-bottom: 2px;">
                        ${award.description}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'Volunteer Experience':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Volunteer Experience
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.volunteerExperience || []).map((volunteer, index) => `
                  <div style="padding-bottom: ${getEntrySpacing()}px;">
                    <div style="
                      margin-bottom: 2px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      <strong>${volunteer.position}</strong> at ${volunteer.organization}
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${formatDate(volunteer.startDate)} - ${volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${volunteer.description}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'References':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                References
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${(data.references || []).map((reference, index) => `
                  <div style="padding-bottom: ${getEntrySpacing()}px;">
                    <div style="
                      margin-bottom: 2px;
                      text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                    ">
                      <strong>${reference.name}</strong> - ${reference.title}
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${reference.company}
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${reference.email} • ${reference.phone}
                    </div>
                    <div style="margin-bottom: 2px;">
                      ${reference.relationship}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        case 'Interests':
          return `
            <div>
              <h2 style="
                font-size: ${getSectionHeadersSize()}px; 
                font-weight: bold; 
                margin-bottom: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 1px;
              ">
                Interests
              </h2>
              <div style="
                font-size: ${getBodyTextSize()}px; 
                line-height: ${getLineSpacing()}px;
                text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
              ">
                ${data.interests?.map((interest, index) => `
                  <span>${interest.icon} ${interest.name}${index < (data.interests?.length || 0) - 1 ? ', ' : ''}</span>
                `).join('')}
              </div>
            </div>
          `;
        default:
          return getRenderFunction(sectionName)();
      }
    } else {
      switch (sectionName) {
        case 'Work Experience':
          const workExp = data.workExperience || [];
          if (workExp[itemIndex]) {
            const work = workExp[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-weight: bold; font-size: ${getSubHeadersSize()}px;">
                    ${work.company}${work.city && work.state ? `, ${work.city}, ${work.state}` : ''}
                  </div>
                  <div style="font-size: ${getBodyTextSize()}px; font-weight: bold;">
                    ${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}
                  </div>
                </div>
                <div style="font-style: italic; font-size: ${getBodyTextSize()}px;">
                  ${work.position}
                </div>
                ${work.bulletPoints && work.bulletPoints.length > 0 ? `
                  <ul style="margin: 2px 0; padding-left: 20px;">
                    ${work.bulletPoints.map((bullet, bulletIndex) => `
                      <li style="
                        font-size: ${getBodyTextSize()}px; 
                        line-height: ${getLineSpacing()}px;
                        text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                      ">
                        ${bullet.description}
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `;
          }
          break;
        case 'Education':
          const education = data.education || [];
          if (education[itemIndex]) {
            const edu = education[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  display: flex; 
                  justify-content: space-between; 
                  align-items: flex-start;
                  margin-bottom: 4px;
                ">
                  <div style="
                    font-size: ${getSubHeadersSize()}px; 
                    font-weight: bold;
                    font-family: ${getFontFamily()};
                  ">
                    ${edu.degree} in ${edu.field}
                  </div>
                  <div style="
                    font-size: ${getBodyTextSize()}px;
                    font-family: ${getFontFamily()};
                    font-weight: bold;
                  ">
                    ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                  </div>
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  font-family: ${getFontFamily()};
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${edu.institution}
                  ${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            `;
          }
          break;
        case 'Courses':
          const courses = data.courses || [];
          if (courses[itemIndex]) {
            const course = courses[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${course.title}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${course.provider}
                </div>
              </div>
            `;
          }
          break;
        case 'Projects':
          const projects = data.projects || [];
          if (projects[itemIndex]) {
            const project = projects[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${project.title}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${project.description}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  <strong>Technologies:</strong> ${project.technologies.join(', ')}
                </div>
              </div>
            `;
          }
          break;
        case 'Publications':
          const publications = data.publications || [];
          if (publications[itemIndex]) {
            const pub = publications[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${pub.title}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${pub.authors} - ${pub.journal} (${pub.year})
                </div>
              </div>
            `;
          }
          break;
        case 'Awards':
          const awards = data.awards || [];
          if (awards[itemIndex]) {
            const award = awards[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${award.title}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${award.issuer} (${award.year})
                </div>
                ${award.description ? `
                  <div style="
                    font-size: ${getBodyTextSize()}px;
                    text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                  ">
                    ${award.description}
                  </div>
                ` : ''}
              </div>
            `;
          }
          break;
        case 'Volunteer Experience':
          const volunteerExp = data.volunteerExperience || [];
          if (volunteerExp[itemIndex]) {
            const volunteer = volunteerExp[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${volunteer.position} at ${volunteer.organization}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${formatDate(volunteer.startDate)} - ${volunteer.current ? 'Present' : formatDate(volunteer.endDate)}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${volunteer.description}
                </div>
              </div>
            `;
          }
          break;
        case 'References':
          const references = data.references || [];
          if (references[itemIndex]) {
            const reference = references[itemIndex];
            return `
              <div style="padding-bottom: ${getEntrySpacing()}px;">
                <div style="
                  font-weight: bold; 
                  font-size: ${getSubHeadersSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${reference.name} - ${reference.title}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${reference.company}
                </div>
                <div style="
                  font-size: ${getBodyTextSize()}px;
                  text-align: ${getAlignTextLeftRight() ? 'justify' : 'left'};
                ">
                  ${reference.email} • ${reference.phone}
                </div>
              </div>
            `;
          }
          break;
        default:
          return '';
      }
    }
    
    return '';
  };

  // Generate HTML for each page
  const pagesHtml = pages.map((page, pageIndex) => {
    return `
      <div class="resume-page" style="
        font-family: ${getFontFamily()}; 
        background: #fff; 
        color: #000; 
        padding: ${getTopBottomMargin()}px ${getSideMargins()}px;
        width: ${getPageWidth()}px;
        min-height: ${getPageHeight()}px;
        margin: 0 auto;
        line-height: 1.2;
        position: relative;
        overflow: visible;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border-radius: 20px;
        border: 1px solid #e0e0e0;
        margin-bottom: ${pageIndex > 0 ? '20px' : '0'};
        page-break-after: ${pageIndex > 0 ? 'always' : 'auto'};
      ">
        ${pageIndex === 0 ? renderHeader() : ''}
        ${page.subsections.map(({ sectionName, subsectionId }) => {
          const subsections = getSubsections(sectionName);
          const subsection = subsections.find(sub => sub.id === subsectionId);
          
          if (!subsection) {
            return '';
          }
          
          const estimatedHeight = getEstimatedSubsectionHeight(sectionName, subsection);
          if (estimatedHeight <= 0) {
            return '';
          }
          
          return `
            <div style="
              padding-bottom: ${(() => {
                const subsections = getSubsections(sectionName);
                const currentIndex = subsections.findIndex(sub => sub.id === subsection.id);
                return currentIndex === subsections.length - 1 ? `${getSectionSpacing()}px` : '0px';
              })()}
            ">
              ${renderSubsection(sectionName, subsection)}
            </div>
          `;
        }).join('')}
      </div>
    `;
  });

  // Generate the complete HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        @page {
          size: ${exportSettings?.pageSize === 'letter' ? 'letter' : 'A4'};
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body { 
          margin: 0; 
          padding: 0; 
          font-family: ${getFontFamily()};
          background: #fff;
          color: #000;
          line-height: 1.2;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .resume-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          background: #fff;
        }
        p, div, span, li {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        @media print {
          .resume-page {
            box-shadow: none;
            border-radius: 0;
            border: none;
            margin: 0;
            padding: ${getTopBottomMargin()}px ${getSideMargins()}px;
          }
          .resume-container {
            gap: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${pagesHtml.join('')}
      </div>
    </body>
    </html>
  `;

  return html;
} 