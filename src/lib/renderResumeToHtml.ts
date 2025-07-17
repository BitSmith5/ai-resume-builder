// Direct HTML generation for PDF creation with exact template styling
import { formatDate, formatUrl } from '@/lib/utils';

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

const MASTER_COLOR = '#c8665b';

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

export function renderResumeToHtml(data: ResumeData, template: string): string {
  if (template === 'classic') {
    return renderClassicTemplate(data);
  } else {
    return renderModernTemplate(data);
  }
}

function renderModernTemplate(data: ResumeData): string {
  const { personalInfo } = data.content;
  
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
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

  // Contact info for left sidebar - horizontal layout with icons
  const contactInfo = [
    personalInfo.email && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">📧</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${personalInfo.email}</span></div>`,
    personalInfo.phone && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">📞</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${personalInfo.phone}</span></div>`,
    (personalInfo.city || personalInfo.state) && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">📍</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</span></div>`,
    personalInfo.website && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">🌐</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${formatUrl(personalInfo.website)}</span></div>`,
    personalInfo.linkedin && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">💼</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${formatUrl(personalInfo.linkedin)}</span></div>`,
    personalInfo.github && `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px;"><span style="color: #666; margin-right: 8px;">💻</span><span style="word-wrap: break-word; overflow-wrap: break-word;">${formatUrl(personalInfo.github)}</span></div>`
  ].filter(Boolean).join('');

  // Skills for left sidebar with proficiency bars (column layout like React template)
  const skillsHtml = data.strengths.map(skill => 
    `<div style="margin-bottom: 12px; font-size: 12px;">
      <div style="margin-bottom: 4px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2;">${skill.skillName}</div>
      <div style="width: 100%; height: 10px; background: transparent; border: 2px solid #c8665b; overflow: hidden;">
        <div style="width: ${(skill.rating / 10) * 100}%; height: 100%; background: #c8665b; padding: 1px;"></div>
      </div>
    </div>`
  ).join('');

  // Interests for left sidebar with icons
  const interestsHtml = data.interests && data.interests.length > 0 ? data.interests.map(interest => 
    `<div style="margin-bottom: 8px; font-size: 12px;">${interest.icon} ${interest.name}</div>`
  ).join('') : '';

  // Handle profile picture URL
  const getProfilePictureUrl = () => {
    if (!data.profilePicture) return '';
    if (data.profilePicture.startsWith('data:')) return data.profilePicture;
    if (data.profilePicture.startsWith('http')) return data.profilePicture;
    return data.profilePicture;
  };

  // Calculate underline width based on job title (similar to React template)
  const calculateUnderlineWidth = (jobTitle: string): number => {
    // Approximate width calculation based on font size and character count
    // Using 16px font size and approximate character width
    const charWidth = 9; // Approximate width per character for 16px font
    const baseWidth = jobTitle.length * charWidth;
    return Math.min(baseWidth + 20, 300); // Add 20px padding, max 300px
  };



  // Header section with summary inside (matching React template exactly)
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

  // Work experience HTML with column layout dates (underneath company name)
  const workExperienceHtml = data.workExperience.map(work => {
    const dateRange = work.current 
      ? `${formatDate(work.startDate)} - PRESENT`
      : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
    
    const bulletPoints = work.bulletPoints.map(bullet => 
      `<div style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><div style="width: 5px; height: 5px; border: 1px solid #c8665b; background: transparent; margin-right: 8px; flex-shrink: 0; margin-top: 6px; border-radius: 0;"></div><div style="flex: 1; font-size: 12px; line-height: 1.4;">${bullet.description}</div></div>`
    ).join('');

    return `
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 700; font-size: 16px; color: #c8665b; margin-bottom: 4px;">${work.position}</div>
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${work.company}</div>
        <div style="font-size: 10px; color: #c8665b; font-style: italic; margin-bottom: 8px;">${dateRange}</div>
        ${bulletPoints ? `<div style="font-size: 12px; line-height: 1.4;">${bulletPoints}</div>` : ''}
      </div>
    `;
  }).join('');

  // Education HTML with right-aligned dates
  const educationHtml = data.education.map(edu => {
    const dateRange = edu.current 
      ? `${formatDate(edu.startDate)} - PRESENT`
      : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
    
    const gpaText = edu.gpa ? `, GPA: ${edu.gpa}` : '';
    
    return `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
          <div style="font-weight: 700; font-size: 16px; color: #c8665b;">${edu.degree} in ${edu.field}</div>
          <div style="font-size: 12px; color: #666; font-style: italic;">${dateRange}</div>
        </div>
        <div style="font-weight: 600; font-size: 14px;">${edu.institution}${gpaText}</div>
      </div>
    `;
  }).join('');

  // Courses HTML with right-aligned provider
  const coursesHtml = data.courses && data.courses.length > 0 ? data.courses.map(course => 
    `<div style="margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 14px; font-weight: 500;">${course.title}</div>
        <div style="font-size: 12px; color: #666;">${course.provider}</div>
      </div>
    </div>`
  ).join('') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: #fff; 
          color: #333; 
        }
        @page { 
          margin: 0.25in; 
          size: A4; 
        }
        .resume-container {
          display: flex;
          width: 850px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .left-column { 
          width: 221px; 
          padding: 24px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: flex-start; 
          box-sizing: border-box; 
          background: transparent;
          border-right: 1px solid #e9ecef;
        }
        .right-column { 
          flex: 1;
          padding: 24px; 
          box-sizing: border-box;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-weight: 700; 
          font-size: 18px; 
          color: #c8665b; 
          margin-bottom: 16px;
          text-transform: uppercase;
          border-bottom: 2px solid #c8665b;
          padding-bottom: 4px;
        }
        .contact-info {
          width: 100%;
          margin-bottom: 24px;
        }
        .skills-section, .interests-section {
          width: 100%;
          margin-bottom: 32px;
        }
        .skills-section:last-child, .interests-section:last-child {
          margin-bottom: 0;
        }
        .section-header {
          font-weight: 700; 
          font-size: 16px; 
          color: #c8665b; 
          margin-bottom: 16px;
          text-align: left;
          width: 100%;
          text-transform: uppercase;
          border-bottom: 2px solid #c8665b;
          padding-bottom: 4px;
        }
        .profile-picture {
          width: 160px; 
          height: 160px; 
          border-radius: 0; 
          margin-bottom: 20px; 
          overflow: hidden; 
          flex-shrink: 0;
        }
        .profile-picture img {
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          border-radius: 0;
        }
        * {
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <div class="left-column">
          ${data.profilePicture ? `<div class="profile-picture"><img src="${getProfilePictureUrl()}" alt="Profile" onerror="this.style.display='none';" /></div>` : ''}
          <div class="contact-info">${contactInfo}</div>
          ${data.strengths.length > 0 ? `
          <div class="skills-section">
            <div class="section-header">TECHNICAL SKILLS</div>
            ${skillsHtml}
          </div>
          ` : ''}
          ${data.interests && data.interests.length > 0 ? `
          <div class="interests-section">
            <div class="section-header">INTERESTS</div>
            ${interestsHtml}
          </div>
          ` : ''}
        </div>
        <div class="right-column">
          ${headerHtml}
          ${data.workExperience.length > 0 ? `
            <div class="section">
              <div class="section-title">WORK EXPERIENCE</div>
              ${workExperienceHtml}
            </div>
          ` : ''}
          ${data.education.length > 0 ? `
            <div class="section">
              <div class="section-title">EDUCATION</div>
              ${educationHtml}
            </div>
          ` : ''}
          ${data.courses && data.courses.length > 0 ? `
            <div class="section">
              <div class="section-title">COURSES & TRAININGS</div>
              ${coursesHtml}
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderClassicTemplate(data: ResumeData): string {
  const { personalInfo } = data.content;
  
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
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