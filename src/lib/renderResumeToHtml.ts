// Direct HTML generation for PDF creation with template styling

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
  courses?: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  interests?: Array<{
    name: string;
    icon: string;
  }>;
}

interface PageContent {
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

export function renderResumeToHtml(data: ResumeData, template: string): string {
  if (template === 'classic') {
    return renderClassicTemplate(data);
  } else {
    return renderModernTemplateWithPageBreaks(data);
  }
}

function renderModernTemplateWithPageBreaks(data: ResumeData): string {
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
    
    return generatePageHtml(data, pageContent, isFirstPage, pageIndex, pages, sectionsStarted);
  });
  
  return pagesHtml.join('');
}

function generatePageHtml(data: ResumeData, pageContent: PageContent, isFirstPage: boolean, pageIndex: number, allPages: PageContent[], sectionsStarted: { workExperience: boolean; courses: boolean; education: boolean }): string {
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
    personalInfo.email && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📧</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${personalInfo.email}</div></div>`,
    personalInfo.phone && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📞</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${personalInfo.phone}</div></div>`,
    (personalInfo.city || personalInfo.state) && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📍</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</div></div>`,
    personalInfo.website && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">🌐</div><a href="${personalInfo.website}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.website)}</a></div>`,
    personalInfo.linkedin && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">💼</div><a href="${ensureUrlProtocol(personalInfo.linkedin)}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.linkedin)}</a></div>`,
    personalInfo.github && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">💻</div><a href="${personalInfo.github}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(personalInfo.github)}</a></div>`
  ].filter(Boolean).join('');

  // Header section
  const headerHtml = `
    <div style="margin-bottom: 16px; background: #c8665b; padding: 12px; border-radius: 0;">
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
        ${course.link ? `<a href="${course.link}" target="_blank" rel="noopener noreferrer" style="color: #c8665b; display: flex; align-items: center; text-decoration: none;">🔗</a>` : ''}
      </div>
      <div style="font-size: 10px; color: #888; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2; font-style: italic;">${course.provider}</div>
    </div>`
  ).join('') : '';

  return `
    <div class="resume-page" style="
      display: flex;
      font-family: sans-serif;
      background: #fff;
      color: #333;
      width: 850px;
      height: 1100px; // Letter size aspect ratio: 8.5:11 = 0.773, 850/1100 = 0.773 ✓
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
            <div style="width: 100%; height: 2; background: #c8665b; margin: 2px 0 0 0;"></div>
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
                <div style="width: ${(skill.rating / 10) * 100}%; height: 100%; background: #c8665b; padding: 1px;"></div>
              </div>
            </div>`
          ).join('')}
        </div>
        ` : ''}
        ${pageContent.leftColumnContent.interests && pageContent.leftColumnContent.interests.length > 0 ? `
        <div style="width: 100%; max-width: 180px; justify-content: flex-start;">
          <div style="font-weight: 700; font-size: 16px; color: #c8665b; text-align: left;">INTERESTS</div>
          <div style="width: 100%; height: 2; background: #c8665b; margin: 2px 0 12px 0;"></div>
          ${pageContent.leftColumnContent.interests.map((interest) => 
            `<div style="margin-bottom: 8px; font-size: 12px;">${interest.icon} ${interest.name}</div>`
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
              <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ` : ''}
            ${workExperienceHtml}
          </div>
        ` : ''}
        ${pageContent.courses && pageContent.courses.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">COURSES & TRAININGS</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${coursesHtml}
          </div>
        ` : ''}
        ${pageContent.education.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">EDUCATION</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${educationHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderClassicTemplate(data: ResumeData): string {
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
  const calculatePages = (): Array<ClassicPageContent> => {
    const pages: Array<ClassicPageContent> = [];
    const maxContentHeight = 900; // Maximum content height per page
    const bottomMargin = 80; // Bottom margin for content
    const headerHeight = 180; // Only on first page
    const itemSpacing = 15;
    
         // Helper function to estimate content height
           const estimateContentHeight = (content: ClassicSection['items'][0], type: 'work' | 'courses' | 'education'): number => {
      let height = 0;
      
             switch (type) {
         case 'work':
           height = 80;
           if (content.bulletPoints && content.bulletPoints.length > 0) {
             height += content.bulletPoints.length * 22;
           }
           break;
         case 'courses':
           height = 45;
           break;
         case 'education':
           height = 60;
           break;
       }
      
      return height;
    };
    
    // Helper function to estimate section header height
    const estimateSectionHeaderHeight = (): number => {
      return 45; // Section title + border + spacing
    };
    
         // Calculate all section heights first
     const sections: Array<ClassicSection> = [];
    
    if (data.workExperience && data.workExperience.length > 0) {
      const workHeight = estimateSectionHeaderHeight() + data.workExperience.reduce((total, item) => total + estimateContentHeight(item, 'work') + itemSpacing, 0);
      sections.push({ type: 'work', items: data.workExperience, height: workHeight });
    }
    
         if (data.courses && data.courses.length > 0) {
       const coursesHeight = estimateSectionHeaderHeight() + data.courses.reduce((total, item) => total + estimateContentHeight(item, 'courses') + itemSpacing, 0);
       sections.push({ type: 'courses', items: data.courses, height: coursesHeight });
     }
    
    if (data.education && data.education.length > 0) {
      const educationHeight = estimateSectionHeaderHeight() + data.education.reduce((total, item) => total + estimateContentHeight(item, 'education') + itemSpacing, 0);
      sections.push({ type: 'education', items: data.education, height: educationHeight });
    }
    
    let currentPage: ClassicPageContent = {
      workExperience: [],
      education: [],
      courses: [],
      skills: [],
      interests: [],
      workExperienceStarted: false,
      coursesStarted: false,
      educationStarted: false
    };
    
    let currentPageHeight = headerHeight; // Start with header height for first page
    
    // Track which sections have actually started across all pages
    let workExperienceStarted = false;
    let coursesStarted = false;
    let educationStarted = false;
    
    // Process sections in correct visual order: work, courses, education
    for (const section of sections) {
      
      if (section.type === 'education') {
        // For Education, check if it can fit on current page
        
        // Force Education to fit on current page if we're on page 1 or 2
        const currentPageNumber = pages.length + 1;
        
        if (currentPageNumber <= 2 || currentPageHeight + section.height <= maxContentHeight - bottomMargin - 20) {
          // Add Education to current page
          currentPage.education = section.items as ClassicPageContent['education'];
          currentPage.educationStarted = educationStarted;
          educationStarted = true; // Mark as started
          currentPageHeight += section.height;
        } else {
          // Start new page for Education
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: [],
            workExperienceStarted: workExperienceStarted,
            coursesStarted: coursesStarted,
            educationStarted: educationStarted
          };
          currentPageHeight = 0;
          
          currentPage.education = section.items as ClassicPageContent['education'];
          currentPage.educationStarted = educationStarted;
          educationStarted = true; // Mark as started
          currentPageHeight += section.height;
        }
        continue;
      }
      
      // For Work Experience and Courses, process items individually to allow splitting
      const sectionHeaderHeight = estimateSectionHeaderHeight();
      
      // Check if section header fits
      if (currentPageHeight + sectionHeaderHeight > maxContentHeight - bottomMargin - 20) {
        // Start new page
        if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
          pages.push(currentPage);
        }
        
        currentPage = {
          workExperience: [],
          education: [],
          courses: [],
          skills: [],
          interests: [],
          workExperienceStarted: workExperienceStarted,
          coursesStarted: coursesStarted,
          educationStarted: educationStarted
        };
        currentPageHeight = 0;
      }
      
      // Add section header and mark section as started
      currentPageHeight += sectionHeaderHeight;
      if (section.type === 'work') {
        currentPage.workExperienceStarted = workExperienceStarted;
        workExperienceStarted = true;
      } else if (section.type === 'courses') {
        currentPage.coursesStarted = coursesStarted;
        coursesStarted = true;
      }
      
      // Process items in the section
      for (let i = 0; i < section.items.length; i++) {
        const item = section.items[i];
        const itemHeight = estimateContentHeight(item, section.type as 'work' | 'courses' | 'education');
        
        // Check if item fits on current page
        if (currentPageHeight + itemHeight > maxContentHeight - bottomMargin - 20) {
          // Start new page
          if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0) {
            pages.push(currentPage);
          }
          
          currentPage = {
            workExperience: [],
            education: [],
            courses: [],
            skills: [],
            interests: [],
            workExperienceStarted: workExperienceStarted, // Use actual started state
            coursesStarted: coursesStarted,
            educationStarted: educationStarted
          };
          currentPageHeight = 0; // Start with 0 height like React template
        }
        
        // Add item to current page
        switch (section.type as 'work' | 'courses' | 'education') {
          case 'work':
            currentPage.workExperience.push(item as ClassicPageContent['workExperience'][0]);
            break;
          case 'courses':
            currentPage.courses.push(item as ClassicPageContent['courses'][0]);
            break;
          case 'education':
            currentPage.education.push(item as ClassicPageContent['education'][0]);
            break;
        }
        
        currentPageHeight += itemHeight + itemSpacing;
      }
    }
    
    // Add remaining content to pages
    if (currentPage.workExperience.length > 0 || currentPage.education.length > 0 || currentPage.courses.length > 0 || currentPage.skills.length > 0 || currentPage.interests.length > 0) {
      pages.push(currentPage);
    }
    
    // Only create a page if we have content to show
    if (pages.length === 0 && (data.strengths && data.strengths.length > 0 || data.interests && data.interests.length > 0)) {
      pages.push({
        workExperience: [],
        education: [],
        courses: [],
        skills: data.strengths || [],
        interests: data.interests || [],
        workExperienceStarted: false,
        coursesStarted: false,
        educationStarted: false
      });
    }
    
    // Add skills and interests to the last page, but check for overflow
    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      
      // Estimate skills and interests height
      const skillsHeight = data.strengths && data.strengths.length > 0 ? 40 : 0; // Reduced height estimate
      const interestsHeight = data.interests && data.interests.length > 0 ? 40 : 0; // Reduced height estimate
      const totalSkillsInterestsHeight = skillsHeight + interestsHeight;
      
      // Check if skills/interests would overflow the bottom margin
      if (currentPageHeight + totalSkillsInterestsHeight > maxContentHeight - bottomMargin - 20) {
        // Create a new page for skills and interests
        const newPage = {
          workExperience: [],
          education: [],
          courses: [],
          skills: data.strengths || [],
          interests: data.interests || [],
          workExperienceStarted: true,
          coursesStarted: true,
          educationStarted: true
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
    
    return pages;
  };

  const pages = calculatePages();

  // Filter out empty pages to prevent blank pages
  const filteredPages = pages.filter(page => 
    page.workExperience.length > 0 || 
    page.education.length > 0 || 
    page.courses.length > 0 || 
    page.skills.length > 0 || 
    page.interests.length > 0
  );

  // Render header (same for all pages)
  const renderHeader = () => `
    <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 16px;">
      ${data.profilePicture && data.profilePicture.trim() !== '' && data.profilePicture.startsWith('data:') ? `
        <div style="
          width: 120px;
          height: 120px;
          border-radius: 50%; 
          background-image: url('${data.profilePicture}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          margin: 0 auto 12px auto;
          border: 3px solid #000;
          background-color: #f0f0f0;
        "></div>
      ` : ''}
      <h1 style="
        font-size: 32px; 
        font-weight: bold; 
        margin: 0 0 10px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-family: 'Times New Roman', serif;
      ">
        ${personalInfo.name}
      </h1>
      ${data.jobTitle ? `
        <div style="
          font-size: 18px; 
          font-weight: bold; 
          margin: 0 0 10px 0;
          font-style: italic;
          color: #333;
          font-family: 'Times New Roman', serif;
        ">
          ${data.jobTitle}
        </div>
      ` : ''}
      <div style="font-size: 14px; color: #333; font-family: 'Times New Roman', serif;">
        ${personalInfo.email ? `<span style="margin-right: 20px;">${personalInfo.email}</span>` : ''}
        ${personalInfo.phone ? `<span style="margin-right: 20px;">${personalInfo.phone}</span>` : ''}
        ${(personalInfo.city || personalInfo.state) ? 
          `<span>${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</span>` : ''
        }
      </div>
      ${(personalInfo.website || personalInfo.linkedin || personalInfo.github) ? `
        <div style="font-size: 12px; color: #666; margin-top: 5px; font-family: 'Times New Roman', serif;">
          ${personalInfo.website ? `<span style="margin-right: 15px;">${formatUrl(personalInfo.website)}</span>` : ''}
          ${personalInfo.linkedin ? `<span style="margin-right: 15px;">${formatUrl(personalInfo.linkedin)}</span>` : ''}
          ${personalInfo.github ? `<span>${formatUrl(personalInfo.github)}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;

  // Render a single page
  const renderPage = (pageContent: ClassicPageContent, pageIndex: number) => {
    const isFirstPage = pageIndex === 0;
    

    
    return `
      <div style="
        font-family: 'Times New Roman', serif; 
        background: transparent; 
        color: #000; 
        padding: 40px;
        width: 850px; /* Match modern template width */
        height: 1056px; /* Letter size: 8.5" x 11" = 816 x 1056 points */
        margin: 0 auto;
        margin-bottom: ${pageIndex < filteredPages.length - 1 ? '20px' : '0'};
        line-height: 1.6;
        position: relative;
        overflow: hidden;
        page-break-after: ${pageIndex < filteredPages.length - 1 ? 'always' : 'avoid'};
        box-sizing: border-box;
      ">
        <!-- Content wrapper that respects bottom margin -->
        <div style="
          padding-bottom: 80px; /* Ensure content doesn't overlap with bottom margin */
          padding-top: ${isFirstPage ? '0' : '0'}; /* No extra top padding for non-first pages */
          box-sizing: border-box;
          width: 100%;
        ">

          
          <!-- Header - only on first page -->
          ${isFirstPage ? renderHeader() : ''}

          <!-- Summary - only on first page -->
          ${isFirstPage && personalInfo.summary ? `
            <div style="margin-bottom: 20px;">
              <h2 style="
                font-size: 18px; 
                font-weight: bold; 
                margin: 0 0 8px 0;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 4px;
                font-family: 'Times New Roman', serif;
              ">
                Professional Summary
              </h2>
              <p style="font-size: 14px; margin: 0; text-align: justify; font-family: 'Times New Roman', serif; line-height: 1.6;">
                ${personalInfo.summary}
              </p>
            </div>
          ` : ''}

          <!-- Work Experience -->
          ${pageContent.workExperience.length > 0 ? `
            <div style="margin-bottom: 20px;">
              ${!pageContent.workExperienceStarted ? `
                <h2 style="
                  font-size: 18px; 
                  font-weight: bold; 
                  margin: 0 0 12px 0;
                  text-transform: uppercase;
                  border-bottom: 1px solid #000;
                  padding-bottom: 4px;
                  font-family: 'Times New Roman', serif;
                ">
                  Work Experience
                </h2>
              ` : ''}
              ${pageContent.workExperience.map((exp) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h3 style="
                      font-size: 16px; 
                      font-weight: bold; 
                      margin: 0;
                      text-transform: uppercase;
                      font-family: 'Times New Roman', serif;
                    ">
                      ${exp.position}
                    </h3>
                    <span style="font-size: 12px; color: #666; font-family: 'Times New Roman', serif;">
                      ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div style="
                    font-size: 14px; 
                    font-weight: bold; 
                    color: #333;
                    margin-bottom: 8px;
                    font-style: italic;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${exp.company}
                    ${(exp.city || exp.state) ? `
                      <span style="font-size: 12px; color: #666; font-weight: normal; font-family: 'Times New Roman', serif;">
                        {' - '}${[exp.city, exp.state].filter(Boolean).join(', ')}
                      </span>
                    ` : ''}
                  </div>
                  ${exp.bulletPoints.length > 0 ? `
                    <ul style="
                      font-size: 13px; 
                      margin: 0; 
                      padding-left: 20px;
                      text-align: justify;
                      font-family: 'Times New Roman', serif;
                      line-height: 1.6;
                    ">
                      ${exp.bulletPoints.map((bullet) => `
                        <li style="margin-bottom: 2px; font-family: 'Times New Roman', serif; line-height: 1.6;">
                          ${bullet.description}
                        </li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Courses -->
          ${pageContent.courses.length > 0 ? `
            <div style="margin-bottom: 20px;">
              ${!pageContent.coursesStarted ? `
                <h2 style="
                  font-size: 18px; 
                  font-weight: bold; 
                  margin: 0 0 12px 0;
                  text-transform: uppercase;
                  border-bottom: 1px solid #000;
                  padding-bottom: 4px;
                  font-family: 'Times New Roman', serif;
                ">
                  Courses & Certifications
                </h2>
              ` : ''}
              ${pageContent.courses.map((course) => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h3 style="
                      font-size: 16px; 
                      font-weight: bold; 
                      margin: 0;
                      text-transform: uppercase;
                      font-family: 'Times New Roman', serif;
                    ">
                      ${course.title}
                    </h3>
                  </div>
                  <div style="
                    font-size: 14px; 
                    font-weight: bold; 
                    color: #333;
                    margin-bottom: 3px;
                    font-style: italic;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${course.provider}
                  </div>
                  ${course.link ? `
                    <div style="font-size: 12px; color: #666; font-family: 'Times New Roman', serif;">
                      <a href="${course.link}" target="_blank" rel="noopener noreferrer" style="color: #666; text-decoration: underline;">
                        ${formatUrl(course.link)}
                      </a>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Education -->
          ${pageContent.education.length > 0 ? `
            <div style="margin-bottom: 20px;">
              ${!pageContent.educationStarted ? `
                <h2 style="
                  font-size: 18px; 
                  font-weight: bold; 
                  margin: 0 0 12px 0;
                  text-transform: uppercase;
                  border-bottom: 1px solid #000;
                  padding-bottom: 4px;
                  font-family: 'Times New Roman', serif;
                ">
                  Education
                </h2>
              ` : ''}
              ${pageContent.education.map((edu) => `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h3 style="
                      font-size: 16px; 
                      font-weight: bold; 
                      margin: 0;
                      text-transform: uppercase;
                      font-family: 'Times New Roman', serif;
                    ">
                      ${edu.degree} in ${edu.field}
                    </h3>
                    <span style="font-size: 12px; color: #666; font-family: 'Times New Roman', serif;">
                      ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div style="
                    font-size: 14px; 
                    font-weight: bold; 
                    color: #333;
                    margin-bottom: 3px;
                    font-style: italic;
                    font-family: 'Times New Roman', serif;
                  ">
                    ${edu.institution}
                  </div>
                  ${edu.gpa ? `
                    <div style="font-size: 13px; color: #666; font-family: 'Times New Roman', serif;">
                      GPA: ${edu.gpa}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <!-- Skills -->
          ${pageContent.skills.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="
                font-size: 18px; 
                font-weight: bold; 
                margin: 0 0 8px 0;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 4px;
                font-family: 'Times New Roman', serif;
              ">
                Skills
              </h2>
                          <div style="font-size: 14px; font-family: 'Times New Roman', serif; line-height: 1.6;">
              ${pageContent.skills.map((strength) => `
                <span style="
                  display: inline-block;
                  margin-right: 15px;
                  margin-bottom: 4px;
                  font-weight: bold;
                  font-family: 'Times New Roman', serif;
                  line-height: 1.6;
                ">
                  ${strength.skillName} (${strength.rating}/10)
                </span>
              `).join('')}
            </div>
            </div>
          ` : ''}

          <!-- Interests -->
          ${pageContent.interests.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="
                font-size: 18px; 
                font-weight: bold; 
                margin: 0 0 8px 0;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                padding-bottom: 4px;
                font-family: 'Times New Roman', serif;
              ">
                Interests
              </h2>
                          <div style="font-size: 14px; font-family: 'Times New Roman', serif; line-height: 1.6;">
              ${pageContent.interests.map((interest) => `
                <span style="
                  display: inline-block;
                  margin-right: 15px;
                  margin-bottom: 4px;
                  font-family: 'Times New Roman', serif;
                  line-height: 1.6;
                ">
                  ${interest.icon} ${interest.name}
                </span>
              `).join('')}
            </div>
            </div>
          ` : ''}
        </div> <!-- Close content wrapper -->
      </div>
    `;
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        @page {
          size: Letter;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Times New Roman', serif;
          background: transparent;
          line-height: 1.6;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .resume-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          background: transparent;
        }
        p, div, span, li {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${filteredPages.map((pageContent, pageIndex) => {
          return renderPage(pageContent, pageIndex);
        }).join('')}
      </div>
    </body>
    </html>
  `;
} 