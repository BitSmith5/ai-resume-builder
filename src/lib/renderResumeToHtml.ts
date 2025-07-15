// Direct HTML generation for PDF creation (App Router compatible)
import { formatDate, formatUrl } from '@/lib/utils';

interface ResumeData {
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

export function renderResumeToHtml(data: ResumeData, template: string): string {
  if (template === 'classic') {
    return renderClassicTemplate(data);
  } else {
    return renderModernTemplate(data);
  }
}

function renderModernTemplate(data: ResumeData): string {
  const { personalInfo } = data.content;
  
  const contactInfo = [
    personalInfo.email && `<div style="margin-bottom: 8px; font-size: 12px;">📧 ${personalInfo.email}</div>`,
    personalInfo.phone && `<div style="margin-bottom: 8px; font-size: 12px;">📞 ${personalInfo.phone}</div>`,
    (personalInfo.city || personalInfo.state) && `<div style="margin-bottom: 8px; font-size: 12px;">📍 ${[personalInfo.city, personalInfo.state].filter(Boolean).join(', ')}</div>`,
    personalInfo.website && `<div style="margin-bottom: 8px; font-size: 12px;">🌐 ${formatUrl(personalInfo.website)}</div>`,
    personalInfo.linkedin && `<div style="margin-bottom: 8px; font-size: 12px;">💼 ${formatUrl(personalInfo.linkedin)}</div>`,
    personalInfo.github && `<div style="margin-bottom: 8px; font-size: 12px;">💻 ${formatUrl(personalInfo.github)}</div>`
  ].filter(Boolean).join('');

  const skillsHtml = data.strengths.map(skill => 
    `<div style="margin-bottom: 4px; font-size: 12px;">• ${skill.skillName}</div>`
  ).join('');

  const workExperienceHtml = data.workExperience.map(work => {
    const dateRange = work.current 
      ? `${formatDate(work.startDate)} - Present`
      : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
    
    const bulletPoints = work.bulletPoints.map(bullet => 
      `<div style="margin-left: 16px; margin-bottom: 4px; font-size: 11px;">• ${bullet.description}</div>`
    ).join('');

    return `
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${work.position}</div>
        <div style="font-weight: 500; font-size: 12px; color: #666; margin-bottom: 4px;">${work.company}</div>
        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">${dateRange}</div>
        ${bulletPoints}
      </div>
    `;
  }).join('');

  const educationHtml = data.education.map(edu => {
    const dateRange = edu.current 
      ? `${formatDate(edu.startDate)} - Present`
      : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
    
    const gpaText = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
    
    return `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${edu.degree} in ${edu.field}</div>
        <div style="font-weight: 500; font-size: 12px; color: #666; margin-bottom: 2px;">${edu.institution}</div>
        <div style="font-size: 11px; color: #888;">${dateRange}${gpaText}</div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .resume { display: flex; width: 850px; height: 1100px; background: white; }
        .sidebar { width: 221px; background: #f8f8fa; padding: 24px; }
        .main { flex: 1; padding: 24px; }
        .name { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
        .summary { font-size: 12px; line-height: 1.4; margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #c94f4f; border-bottom: 2px solid #c94f4f; padding-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="resume">
        <div class="sidebar">
          ${data.profilePicture ? `<div style="width: 80px; height: 80px; border-radius: 50%; background-image: url(${data.profilePicture}); background-size: cover; background-position: center; margin-bottom: 20px;"></div>` : ''}
          <div style="font-weight: 600; font-size: 18px; margin-bottom: 16px;">${personalInfo.name}</div>
          ${contactInfo}
          <div class="section-title" style="margin-top: 24px;">Skills</div>
          ${skillsHtml}
        </div>
        <div class="main">
          <div class="summary">${personalInfo.summary}</div>
          <div class="section-title">Work Experience</div>
          ${workExperienceHtml}
          <div class="section-title">Education</div>
          ${educationHtml}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderClassicTemplate(data: ResumeData): string {
  const { personalInfo } = data.content;
  
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
      </div>
    </body>
    </html>
  `;
} 