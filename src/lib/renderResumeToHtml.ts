// Direct HTML generation for PDF creation with exact template styling

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
    const maxContentHeight = 820;
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
    const headerHeight = 120;
    const sectionSpacing = 32;
    const itemSpacing = 12;
    
    const estimateContentHeight = (content: ContentItem, type: string): number => {
      let height = 0;
      
      switch (type) {
        case 'work':
          height = 90; // EXACTLY like React template
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
      
      if (currentHeight + sectionHeight > maxContentHeight) {
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
        
        if (currentHeight + itemHeight > maxContentHeight) {
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
    
    // Helper function to distribute left column content - EXACTLY like React template
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
        ${isFirstPage && data.profilePicture && data.profilePicture.trim() !== '' ? `<div style="width: 160px; height: 160px; border-radius: 10%; margin-bottom: 20px; overflow: hidden; flex-shrink: 0;"><img src="${data.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10%; display: block;" onerror="this.parentElement.style.display='none';" /></div>` : ''}
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
            ${!sectionsStarted.courses ? `
              <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">COURSES & TRAININGS</div>
              <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ` : ''}
            ${coursesHtml}
          </div>
        ` : ''}
        ${pageContent.education.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            ${!sectionsStarted.education ? `
              <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">EDUCATION</div>
              <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ` : ''}
            ${educationHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderClassicTemplate(data: ResumeData): string {
  const { personalInfo } = data.content;

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

  const contactInfo = [
    personalInfo.email && `Email: ${personalInfo.email}`,
    personalInfo.phone && `Phone: ${personalInfo.phone}`,
    (personalInfo.city || personalInfo.state) && `Location: ${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}`,
    personalInfo.website && `Website: ${personalInfo.website}`,
    personalInfo.linkedin && `LinkedIn: ${personalInfo.linkedin}`,
    personalInfo.github && `GitHub: ${personalInfo.github}`
  ].filter(Boolean).join(' | ');

  const skillsHtml = data.strengths.map(skill => 
    `<span style="display: inline-block; margin: 2px 8px 2px 0; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px;">${skill.skillName}</span>`
  ).join('');

  const workExperienceHtml = data.workExperience.map(work => {
    const dateRange = work.current 
      ? `${formatDate(work.startDate)} - Present`
      : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
    
    const bulletPoints = work.bulletPoints.map(bullet => 
      `<li style="margin-bottom: 4px; font-size: 11px;">${bullet.description}</li>`
    ).join('');

    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 14px;">${work.position}</div>
          <div style="font-size: 12px; color: #666;">${dateRange}</div>
        </div>
        <div style="font-weight: 500; font-size: 13px; color: #666; margin-bottom: 8px;">${work.company}</div>
        <ul style="margin: 0; padding-left: 20px;">
          ${bulletPoints}
        </ul>
      </div>
    `;
  }).join('');

  const educationHtml = data.education.map(edu => {
    const dateRange = edu.current 
      ? `${formatDate(edu.startDate)} - Present`
      : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
    
    const gpaText = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
    
    return `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="font-weight: bold; font-size: 13px;">${edu.degree} in ${edu.field}</div>
          <div style="font-size: 11px; color: #666;">${dateRange}${gpaText}</div>
        </div>
        <div style="font-weight: 500; font-size: 12px; color: #666;">${edu.institution}</div>
      </div>
    `;
  }).join('');

  const coursesHtml = data.courses && data.courses.length > 0 ? data.courses.map(course => 
    `<span style="display: inline-block; margin: 2px 8px 2px 0; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px;">${course.title} - ${course.provider}</span>`
  ).join('') : '';

  const interestsHtml = data.interests && data.interests.length > 0 ? data.interests.map(interest => 
    `<span style="display: inline-block; margin: 2px 8px 2px 0; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px;">${interest.icon} ${interest.name}</span>`
  ).join('') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; }
        .resume { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .contact { font-size: 12px; color: #666; margin-bottom: 16px; }
        .summary { font-size: 12px; line-height: 1.5; margin-bottom: 24px; text-align: justify; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="resume">
        <div class="header">
          <div class="name">${personalInfo.name}</div>
          <div class="contact">${contactInfo}</div>
        </div>
        <div class="summary">${personalInfo.summary}</div>
        <div class="section">
          <div class="section-title">Skills</div>
          ${skillsHtml}
        </div>
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${workExperienceHtml}
        </div>
        <div class="section">
          <div class="section-title">Education</div>
          ${educationHtml}
        </div>
        ${coursesHtml ? `
        <div class="section">
          <div class="section-title">Courses</div>
          ${coursesHtml}
        </div>
        ` : ''}
        ${interestsHtml ? `
        <div class="section">
          <div class="section-title">Interests</div>
          ${interestsHtml}
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
} 