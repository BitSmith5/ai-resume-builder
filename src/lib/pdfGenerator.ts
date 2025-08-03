// Unified PDF generation library
// This ensures both preview and PDF download use the exact same rendering logic

export interface ExportSettings {
  template: string;
  pageSize: 'letter' | 'a4';
  fontFamily: string;
  nameSize: number;
  sectionHeadersSize: number;
  subHeadersSize: number;
  bodyTextSize: number;
  sectionSpacing: number;
  entrySpacing: number;
  lineSpacing: number;
  topBottomMargin: number;
  sideMargins: number;
  alignTextLeftRight: boolean;
  pageWidth: number;
  pageHeight: number;
}

// URL formatting function to ensure proper protocol
const formatUrl = (url: string): string => {
  if (!url) return '';
  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  return url;
};

// Date formatting function to convert dates to MMM YYYY format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Handle date strings in YYYY-MM-DD format to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month] = dateString.split('-').map(Number);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[month - 1]} ${year}`; // month - 1 because array is 0-indexed
    }
    
    // Fallback to Date object for other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  } catch {
    return dateString; // Return original if parsing fails
  }
};

// Phone number formatting function
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // Return original if not 10 digits
};





// Function to render sections based on the active sections order
const renderSection = (sectionName: string, resumeData: any): string => {
  console.log(`🎯 Rendering section: ${sectionName}`);
  console.log(`🎯 Resume data keys:`, Object.keys(resumeData));
  console.log(`🎯 Content keys:`, resumeData.content ? Object.keys(resumeData.content) : 'No content');
  console.log(`🎯 Personal info:`, resumeData.content?.personalInfo);
  
  switch (sectionName) {
    case 'Personal Info':
      // Personal info is already handled in the header and contact info
      // This section is intentionally empty as the content is in the header
      return '';
    
    case 'Professional Summary':
      console.log(`🎯 Professional Summary - summary:`, resumeData.content?.personalInfo?.summary);
      return resumeData.content?.personalInfo?.summary ? `
        <div class="section">
          <div class="section-header">Professional Summary</div>
          <div class="body-text">${resumeData.content.personalInfo.summary}</div>
        </div>
      ` : '';
    
    case 'Work Experience':
      console.log(`🎯 Work Experience - data:`, resumeData.workExperience);
      console.log(`🎯 Work Experience - length:`, resumeData.workExperience?.length);
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        console.log(`🎯 Work Experience - rendering ${resumeData.workExperience.length} entries`);
        console.log(`🎯 First work experience:`, resumeData.workExperience[0]);
        const workHtml = resumeData.workExperience.map((work: any) => {
          console.log(`🎯 Work ${work.company}:`, work);
          return `
            <div class="entry">
              <div class="entry-header">
                <div class="entry-company">${work.company}</div>
                <div class="entry-date">${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}</div>
              </div>
              <div class="entry-position body-text">${work.position}</div>
              ${work.bulletPoints && work.bulletPoints.length > 0 ? `
                <div class="bullet-points">
                  ${work.bulletPoints.map((bullet: any) => `
                    <div class="bullet-point">• ${bullet.description}</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
        console.log(`🎯 Work Experience HTML:`, workHtml);
        return `
          <div class="section">
            <div class="section-header">Work Experience</div>
            ${workHtml}
        </div>
        `;
      } else {
        console.log(`🎯 Work Experience - no data found, showing placeholder`);
        return `
          <div class="section">
            <div class="section-header">Work Experience</div>
            <div class="body-text">No work experience data available</div>
          </div>
        `;
      }
    
    case 'Projects':
      console.log(`🎯 Projects - data:`, resumeData.projects);
      console.log(`🎯 Projects - length:`, resumeData.projects?.length);
      if (resumeData.projects && resumeData.projects.length > 0) {
        console.log(`🎯 Projects - rendering ${resumeData.projects.length} projects`);
        console.log(`🎯 First project:`, resumeData.projects[0]);
        const projectsHtml = resumeData.projects.map((project: any) => {
          console.log(`🎯 Project ${project.title}:`, project);
          return `
            <div class="entry">
              <div class="entry-header">
                <div class="entry-title">
                  ${project.link ? `<a href="${formatUrl(project.link)}" class="project-link">${project.title}</a>` : project.title}
                </div>
              </div>
              <div class="body-text">${project.description || 'No description'}</div>
              ${project.technologies && project.technologies.length > 0 ? `
                <div class="body-text">Technologies: ${project.technologies.join(', ')}</div>
              ` : ''}
            </div>
          `;
        }).join('');
        console.log(`🎯 Projects HTML:`, projectsHtml);
        return `
          <div class="section">
            <div class="section-header">Projects</div>
            ${projectsHtml}
        </div>
        `;
      } else {
        console.log(`🎯 Projects - no data found, showing placeholder`);
        return `
          <div class="section">
            <div class="section-header">Projects</div>
            <div class="body-text">No projects data available</div>
          </div>
        `;
      }
    
    case 'Education':
      console.log(`🎯 Education - data:`, resumeData.education);
      console.log(`🎯 Education - length:`, resumeData.education?.length);
      if (resumeData.education && resumeData.education.length > 0) {
        console.log(`🎯 Education - rendering ${resumeData.education.length} education entries`);
        console.log(`🎯 First education:`, resumeData.education[0]);
        const educationHtml = resumeData.education.map((edu: any) => {
          console.log(`🎯 Education ${edu.institution}:`, edu);
          return `
            <div class="entry">
              <div class="entry-header">
                <div class="entry-title">${edu.degree} in ${edu.field}</div>
                <div class="entry-date">${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}</div>
              </div>
              <div class="body-text">${edu.institution}</div>
              ${edu.gpa ? `<div class="body-text">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `;
        }).join('');
        console.log(`🎯 Education HTML:`, educationHtml);
        return `
          <div class="section">
            <div class="section-header">Education</div>
            ${educationHtml}
        </div>
        `;
      } else {
        console.log(`🎯 Education - no data found, showing placeholder`);
        return `
          <div class="section">
            <div class="section-header">Education</div>
            <div class="body-text">No education data available</div>
          </div>
        `;
      }
      
    case 'Technical Skills':
      console.log(`🎯 Technical Skills - skillCategories:`, resumeData.skillCategories);
      console.log(`🎯 Technical Skills - strengths:`, resumeData.strengths);
      // Check for skillCategories first (structured format), then fall back to strengths
      if (resumeData.skillCategories && resumeData.skillCategories.length > 0) {
        console.log(`🎯 Technical Skills - rendering skillCategories`);
        return `
          <div class="section">
            <div class="section-header">Technical Skills</div>
            ${resumeData.skillCategories.map((category: any) => `
              <div class="entry">
                <div class="entry-title">${category.title}</div>
                <div class="body-text">${category.skills.map((skill: any) => skill.name).join(', ')}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (resumeData.strengths && resumeData.strengths.length > 0) {
        console.log(`🎯 Technical Skills - rendering strengths`);
        return `
          <div class="section">
            <div class="section-header">Technical Skills</div>
            <div class="body-text">${resumeData.strengths.map((skill: any) => skill.skillName).join(', ')}</div>
          </div>
        `;
      }
      console.log(`🎯 Technical Skills - no data found, showing placeholder`);
      return `
        <div class="section">
          <div class="section-header">Technical Skills</div>
          <div class="body-text">No technical skills data available</div>
        </div>
      `;
    
    case 'Courses':
      return resumeData.courses && resumeData.courses.length > 0 ? `
        <div class="section">
          <div class="section-header">Courses</div>
          ${resumeData.courses.map((course: any) => `
            <div class="entry">
              <div class="entry-title">${course.title}</div>
              <div class="body-text">${course.provider}</div>
            </div>
          `).join('')}
        </div>
      ` : '';
    
    case 'Interests':
      return resumeData.interests && resumeData.interests.length > 0 ? `
        <div class="section">
          <div class="section-header">Interests</div>
          <div class="body-text">${resumeData.interests.map((interest: any) => interest.name).join(', ')}</div>
        </div>
      ` : '';
    
    case 'Languages':
      return resumeData.languages && resumeData.languages.length > 0 ? `
        <div class="section">
          <div class="section-header">Languages</div>
          <div class="body-text">${resumeData.languages.map((lang: any) => `${lang.name} (${lang.proficiency})`).join(', ')}</div>
        </div>
      ` : '';
    
    case 'Publications':
      return resumeData.publications && resumeData.publications.length > 0 ? `
        <div class="section">
          <div class="section-header">Publications</div>
          ${resumeData.publications.map((pub: any) => `
            <div class="entry">
              <div class="entry-title">${pub.title}</div>
              <div class="body-text">${pub.authors}</div>
              <div class="body-text">${pub.journal}, ${pub.year}</div>
            </div>
          `).join('')}
        </div>
      ` : '';
    
    case 'Awards':
      return resumeData.awards && resumeData.awards.length > 0 ? `
        <div class="section">
          <div class="section-header">Awards</div>
          ${resumeData.awards.map((award: any) => `
            <div class="entry">
              <div class="entry-title">${award.title}</div>
              <div class="body-text">${award.issuer}, ${award.year}</div>
              ${award.description ? `<div class="body-text">${award.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : '';
    
    case 'Volunteer Experience':
      return resumeData.volunteerExperience && resumeData.volunteerExperience.length > 0 ? `
        <div class="section">
          <div class="section-header">Volunteer Experience</div>
          ${resumeData.volunteerExperience.map((vol: any) => `
            <div class="entry">
              <div class="entry-header">
                <div class="entry-title">${vol.position}</div>
                <div class="entry-date">${formatDate(vol.startDate)} - ${vol.current ? 'Present' : formatDate(vol.endDate)}</div>
              </div>
              <div class="body-text">${vol.organization}</div>
              ${vol.description ? `<div class="body-text">${vol.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : '';
    
    case 'References':
      return resumeData.references && resumeData.references.length > 0 ? `
        <div class="section">
          <div class="section-header">References</div>
          ${resumeData.references.map((ref: any) => `
            <div class="entry">
              <div class="entry-title">${ref.name}</div>
              <div class="body-text">${ref.title} at ${ref.company}</div>
              <div class="body-text">${ref.email}${ref.phone ? ` • ${ref.phone}` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : '';
    
    default:
      return '';
  }
};

// Generate the HTML content for PDF (used by both preview and PDF download)
export function generatePdfHtml(resumeData: any, activeSections: string[], exportSettings: ExportSettings, isPreview: boolean = false): string {
  console.log('🎯 generatePdfHtml called with:');
  console.log('🎯 activeSections:', activeSections);
  console.log('🎯 resumeData keys:', Object.keys(resumeData));
  console.log('🎯 resumeData.content:', resumeData.content);
  console.log('🎯 resumeData.content.personalInfo:', resumeData.content?.personalInfo);
  console.log('🎯 resumeData.skillCategories:', resumeData.skillCategories);
  console.log('🎯 resumeData.strengths:', resumeData.strengths);
  console.log('🎯 resumeData.workExperience:', resumeData.workExperience);
  console.log('🎯 resumeData.projects:', resumeData.projects);
  console.log('🎯 resumeData.education:', resumeData.education);
  console.log('🎯 exportSettings.sectionSpacing:', exportSettings.sectionSpacing);
  
  // Create the HTML content with proper styling
  const htmlContent = `
    <div class="header">
      <div class="name">${resumeData.content?.personalInfo?.name || 'No Name'}</div>
      ${resumeData.jobTitle ? `<div class="job-title">${resumeData.jobTitle}</div>` : ''}
    </div>
    
    <div class="contact-info">
      ${resumeData.content?.personalInfo?.city || resumeData.content?.personalInfo?.state ? 
        `<span>${resumeData.content.personalInfo.city || ''}${resumeData.content.personalInfo.city && resumeData.content.personalInfo.state ? ', ' : ''}${resumeData.content.personalInfo.state || ''}</span>` : ''}
      ${resumeData.content?.personalInfo?.phone ? 
        `${resumeData.content.personalInfo.city || resumeData.content.personalInfo.state ? '<span class="contact-separator">•</span>' : ''}<span>${formatPhoneNumber(resumeData.content.personalInfo.phone)}</span>` : ''}
      ${resumeData.content?.personalInfo?.email ? 
        `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone) ? '<span class="contact-separator">•</span>' : ''}<span>${resumeData.content.personalInfo.email}</span>` : ''}
      ${resumeData.content?.personalInfo?.linkedin ? 
        `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.linkedin}" class="contact-link">LinkedIn</a></span>` : ''}
      ${resumeData.content?.personalInfo?.github ? 
        `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email || resumeData.content.personalInfo.linkedin) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.github}" class="contact-link">GitHub</a></span>` : ''}
      ${resumeData.content?.personalInfo?.website ? 
        `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email || resumeData.content.personalInfo.linkedin || resumeData.content.personalInfo.github) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.website}" class="contact-link">${resumeData.content.personalInfo.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
    </div>



    ${resumeData.content?.personalInfo?.summary ? `
      <div class="section">
        <div class="section-header">Professional Summary</div>
        <div class="body-text">${resumeData.content.personalInfo.summary}</div>
      </div>
    ` : ''}

    ${activeSections.filter(sectionName => sectionName !== 'Professional Summary').map(sectionName => {
      console.log(`🎯 generatePdfHtml - Rendering section: ${sectionName}`);
      const rendered = renderSection(sectionName, resumeData);
      console.log(`🎯 generatePdfHtml - Section ${sectionName} rendered length:`, rendered.length);
      console.log(`🎯 generatePdfHtml - Section ${sectionName} preview:`, rendered.substring(0, 200));
      return rendered;
    }).join('')}
  `;
  
  console.log(`🎯 Final HTML content:`, htmlContent);

  // Use smart pagination for both preview and PDF
  const processedHtml = generatePreviewPages(htmlContent, exportSettings);
  console.log(`🎯 ${isPreview ? 'Preview' : 'PDF'} - Using smart pagination with page containers`);
  const finalHtml = processedHtml;
  
  // Wrap with complete document structure and CSS
  const completeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${resumeData.content?.personalInfo?.name || 'Resume'} - Resume</title>
        <style>
          * {
            box-sizing: border-box;
            overflow: visible;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
            color: #000;
            font-family: '${exportSettings.fontFamily || 'Times New Roman'}', serif;
            line-height: 1.4;
            overflow: visible;
          }
          
          .header {
            text-align: center;
            margin-bottom: 16px;
            overflow: visible;
            display: block;
          }
          
          .name {
            font-size: ${exportSettings.nameSize}px;
            font-weight: normal;
            margin-bottom: 4px;
            overflow: visible;
            display: block;
          }
          
          .job-title {
            font-size: ${exportSettings.bodyTextSize}px;
            color: #666;
            overflow: visible;
          }
          
          .contact-info {
            text-align: center;
            margin-bottom: 16px;
            font-size: ${exportSettings.bodyTextSize}px;
            overflow: visible;
          }
          
          .contact-separator {
            margin: 0 8px;
            color: #666;
          }
          
          .contact-link {
            color: #000;
            text-decoration: none;
          }
          
          .contact-link:hover {
            text-decoration: underline;
          }
          
          .section {
            margin-bottom: ${exportSettings.sectionSpacing}px;
            overflow: visible;
          }
          

          
          .section-header {
            font-size: ${exportSettings.sectionHeadersSize}px;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
            text-align: left;
            overflow: visible;
          }
          
          .entry {
            margin-bottom: ${exportSettings.entrySpacing}px;
            overflow: visible;
          }
          
          .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2px;
            overflow: visible;
          }
          
          .entry-company {
            font-weight: bold;
            font-size: ${exportSettings.subHeadersSize}px;
            text-align: left;
            overflow: visible;
          }
          
          .entry-title {
            font-weight: bold;
            font-size: ${exportSettings.subHeadersSize}px;
            text-align: left;
            overflow: visible;
          }
          
          .entry-position {
            font-style: italic;
            font-size: ${exportSettings.bodyTextSize}px;
            margin-bottom: 2px;
            text-align: ${exportSettings.alignTextLeftRight ? 'justify' : 'left'};
            overflow: visible;
          }
          
          .entry-date {
            font-size: ${exportSettings.bodyTextSize}px;
            font-weight: bold;
            text-align: right;
            overflow: visible;
          }
          
          .body-text {
            font-size: ${exportSettings.bodyTextSize}px;
            line-height: ${exportSettings.lineSpacing}px;
            margin-bottom: 4px;
            text-align: ${exportSettings.alignTextLeftRight ? 'justify' : 'left'};
            overflow: visible;
          }
          
          .bullet-points {
            margin-left: 16px;
            text-align: ${exportSettings.alignTextLeftRight ? 'justify' : 'left'};
            overflow: visible;
          }
          
          .bullet-point {
            font-size: ${exportSettings.bodyTextSize}px;
            line-height: ${exportSettings.lineSpacing}px;
            margin-bottom: 2px;
            text-align: ${exportSettings.alignTextLeftRight ? 'justify' : 'left'};
            overflow: visible;
            text-indent: -8px;
            padding-left: 8px;
          }
          
          .project-link {
            color: #000;
            text-decoration: none;
          }
          
          .project-link:hover {
            text-decoration: underline;
          }
          
          .preview-page {
            width: 816px;
            height: 1056px;
            background: white;
            position: relative;
            overflow: visible;
            display: block;
            clear: both;
            margin-bottom: 0;
            border: 1px solid #ccc;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-after: always;
          }
          
          .page-content {
            padding: ${exportSettings.topBottomMargin}px ${exportSettings.sideMargins}px;
            height: 100%;
            overflow: visible;
            position: relative;
          }
          
          .page-spacing {
            height: 30px;
            width: 100%;
          }
          
          @media print {
            .preview-page {
              border: none;
              box-shadow: none;
              margin-bottom: 0;
            }
            
            .page-spacing {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
                         <div style="width: 816px; min-width: 816px; max-width: 816px; margin: 0 auto;">
                   ${finalHtml}
                 </div>
      </body>
    </html>
  `;
  
  return completeHtml;
}

// Function to generate preview pages with actual page containers
function generatePreviewPages(htmlContent: string, exportSettings: ExportSettings): string {
  // Calculate page dimensions
  const pageDimensions = {
    letter: { width: 612, height: 792 }, // 8.5" x 11" in points (72 DPI)
    a4: { width: 595, height: 842 }      // A4 in points (72 DPI)
  };
  
  const pageSize = exportSettings.pageSize === 'letter' ? 'letter' : 'a4';
  const pageWidth = pageDimensions[pageSize].width;
  const pageHeight = pageDimensions[pageSize].height;
  
  // Convert points to pixels for preview (72 DPI)
  const pageWidthPx = pageWidth * (96 / 72); // Convert points to pixels (96 DPI for screen)
  const pageHeightPx = pageHeight * (96 / 72);
  
  // Split content into sections
  const sections = splitContentIntoSections(htmlContent);
  
  // Create pages by combining sections that fit together
  const pages: string[] = [];
  let currentPageContent = '';
  let currentPageHeight = 0;
  const maxPageHeight = pageHeightPx - (exportSettings.topBottomMargin * 2) - 100; // Leave some buffer
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionHeight = estimateSectionPartHeight(section, exportSettings);
    
    console.log(`🎯 generatePreviewPages - Checking section ${i + 1}:`);
    console.log(`🎯 generatePreviewPages - Section ${i + 1} estimated height:`, sectionHeight);
    console.log(`🎯 generatePreviewPages - Current page height:`, currentPageHeight);
    console.log(`🎯 generatePreviewPages - Max page height:`, maxPageHeight);
    
    // Check if this section would fit on the current page
    if (currentPageHeight + sectionHeight <= maxPageHeight) {
      // Add section to current page
      currentPageContent += section;
      currentPageHeight += sectionHeight;
      console.log(`🎯 generatePreviewPages - Added section ${i + 1} to current page`);
    } else {
      // Current page is full, create it and start a new page
      if (currentPageContent) {
        const pageContainer = createPageContainer(currentPageContent, pageWidthPx, pageHeightPx, exportSettings);
        pages.push(pageContainer);
        console.log(`🎯 generatePreviewPages - Created page with ${currentPageContent.split('<div class="section-header">').length - 1} sections`);
      }
      
      // Start new page with this section
      currentPageContent = section;
      currentPageHeight = sectionHeight;
      console.log(`🎯 generatePreviewPages - Started new page with section ${i + 1}`);
    }
  }
  
    // Create the last page if there's content
  if (currentPageContent) {
    const pageContainer = createPageContainer(currentPageContent, pageWidthPx, pageHeightPx, exportSettings);
    pages.push(pageContainer);
    console.log(`🎯 generatePreviewPages - Created final page with ${currentPageContent.split('<div class="section-header">').length - 1} sections`);
  }
  
  // Add spacing between pages
  const result = pages.map((page, index) => {
    if (index < pages.length - 1) {
      return page + '<div class="page-spacing" style="height: 30px; width: 100%;"></div>';
    }
    return page;
  }).join('');
  
  return result;
}

// Helper function to split HTML content into sections
function splitContentIntoSections(htmlContent: string): string[] {
  console.log(`🎯 splitContentIntoSections - Input HTML length:`, htmlContent.length);
  console.log(`🎯 splitContentIntoSections - Input HTML preview:`, htmlContent.substring(0, 500));
  
  const sections: string[] = [];
  
  // First, extract header and contact info as one section
  const headerMatch = htmlContent.match(/<div class="header">[\s\S]*?<\/div>/);
  const contactMatch = htmlContent.match(/<div class="contact-info">[\s\S]*?<\/div>/);
  const summaryMatch = htmlContent.match(/<div class="section"[^>]*style="text-align: left;">\s*<div class="section-header">Professional Summary<\/div>[\s\S]*?<\/div>\s*<\/div>/);
  
  // Add header and contact as one section
  if (headerMatch || contactMatch) {
    let headerContactSection = '';
    if (headerMatch) headerContactSection += headerMatch[0];
    if (contactMatch) headerContactSection += contactMatch[0];
    sections.push(headerContactSection);
    console.log(`🎯 splitContentIntoSections - Added header/contact section, length:`, headerContactSection.length);
  }
  
  // Add Professional Summary as separate section
  if (summaryMatch) {
    sections.push(summaryMatch[0]);
    console.log(`🎯 splitContentIntoSections - Added Professional Summary section, length:`, summaryMatch[0].length);
  }
  
  // Use a robust HTML parser to find all section divs and their complete content
  let currentIndex = 0;
  const sectionStartTag = '<div class="section">';
  
  console.log(`🎯 splitContentIntoSections - Looking for sections with tag: ${sectionStartTag}`);
  console.log(`🎯 splitContentIntoSections - HTML contains 'Work Experience':`, htmlContent.includes('Work Experience'));
  console.log(`🎯 splitContentIntoSections - HTML contains 'class="section"':`, htmlContent.includes('class="section"'));
  
  while (true) {
    const sectionStartIndex = htmlContent.indexOf(sectionStartTag, currentIndex);
    if (sectionStartIndex === -1) break;
    
    // Find the matching closing div by counting opening and closing divs
    let depth = 0;
    let pos = sectionStartIndex;
    let sectionEndIndex = -1;
    
    while (pos < htmlContent.length) {
      const nextOpenDiv = htmlContent.indexOf('<div', pos);
      const nextCloseDiv = htmlContent.indexOf('</div>', pos);
      
      if (nextOpenDiv !== -1 && (nextOpenDiv < nextCloseDiv || nextCloseDiv === -1)) {
        // Found an opening div before a closing div
        depth++;
        pos = nextOpenDiv + 1;
      } else if (nextCloseDiv !== -1) {
        // Found a closing div
        depth--;
        pos = nextCloseDiv + 1;
        
        if (depth === 0) {
          // This is the matching closing div for our section
          sectionEndIndex = nextCloseDiv + 6; // +6 for '</div>'
          break;
        }
      } else {
        // No more divs found
        break;
      }
    }
    
    if (sectionEndIndex !== -1) {
      const fullSection = htmlContent.substring(sectionStartIndex, sectionEndIndex);
      sections.push(fullSection);
      console.log(`🎯 splitContentIntoSections - Added section ${sections.length}, length:`, fullSection.length);
      console.log(`🎯 splitContentIntoSections - Section ${sections.length} preview:`, fullSection.substring(0, 200));
      console.log(`🎯 splitContentIntoSections - Section ${sections.length} contains 'Work Experience':`, fullSection.includes('Work Experience'));
      currentIndex = sectionEndIndex;
    } else {
      // If we can't find the closing div, skip this section
      console.log(`🎯 splitContentIntoSections - Could not find closing div for section starting at index ${sectionStartIndex}`);
      currentIndex = sectionStartIndex + sectionStartTag.length;
    }
  }
  
  console.log(`🎯 splitContentIntoSections - Total sections found:`, sections.length);
  return sections;
}

// Helper function to split a long section into smaller parts


// Helper function to estimate the height of a section part
// Shared spacing constants for consistent calculations
const SPACING_CONSTANTS = {
  SECTION_HEADER_MARGIN_BOTTOM: 8,
  ENTRY_HEADER_MARGIN_BOTTOM: 2,
  ENTRY_POSITION_MARGIN_BOTTOM: 2,
  BODY_TEXT_MARGIN_BOTTOM: 4,
  BULLET_POINT_MARGIN_BOTTOM: 2,
  SECTION_HEADER_PADDING_BOTTOM: 1,
  BUFFER: 0
};

function estimateSectionPartHeight(part: string, exportSettings: ExportSettings): number {
  const entryMatches = part.match(/<div class="entry">/g) || [];
  const bulletMatches = part.match(/<div class="bullet-point">/g) || [];
  const headerMatches = part.match(/<div class="section-header">/g) || [];
  const bodyTextMatches = part.match(/<div class="body-text">/g) || [];
  
  let height = 0;
  
  // Section header height (including margins and padding)
  if (headerMatches.length > 0) {
    height += exportSettings.sectionHeadersSize * (exportSettings.lineSpacing / 10); // Font height
    height += SPACING_CONSTANTS.SECTION_HEADER_MARGIN_BOTTOM; // Margin below header
    height += SPACING_CONSTANTS.SECTION_HEADER_PADDING_BOTTOM; // Padding below text
    height += 1; // Border width
  }
  
  // Entry heights (including margins)
  height += entryMatches.length * (
    exportSettings.bodyTextSize * (exportSettings.lineSpacing / 10) * 3 + // Base content
    exportSettings.entrySpacing + // Entry spacing
    SPACING_CONSTANTS.ENTRY_HEADER_MARGIN_BOTTOM + // Entry header margin
    SPACING_CONSTANTS.ENTRY_POSITION_MARGIN_BOTTOM // Entry position margin
  );
  
  // Bullet point heights (including margins)
  height += bulletMatches.length * (
    exportSettings.bodyTextSize * (exportSettings.lineSpacing / 10) + // Font height
    SPACING_CONSTANTS.BULLET_POINT_MARGIN_BOTTOM // Margin below bullet
  );
  
  // Body text margins
  height += bodyTextMatches.length * SPACING_CONSTANTS.BODY_TEXT_MARGIN_BOTTOM;
  
  return height + SPACING_CONSTANTS.BUFFER; // Add buffer
}



// Helper function to create a page container
function createPageContainer(content: string, pageWidthPx: number, pageHeightPx: number, exportSettings: ExportSettings): string {
  return `
    <div class="preview-page" style="width: ${pageWidthPx}px; height: ${pageHeightPx}px; background: white; position: relative; overflow: visible; display: block; clear: both;">
      <div class="page-content" style="padding: ${exportSettings.topBottomMargin}px ${exportSettings.sideMargins}px; height: 100%; overflow: visible; position: relative;">
        ${content}
      </div>
    </div>
  `;
}










// Generate the complete HTML document with styling
export function generateCompleteHtml(resumeData: any, activeSections: string[], exportSettings: ExportSettings, isPreview: boolean = false): string {
  console.log('🎯 generateCompleteHtml called with:');
  console.log('🎯 isPreview:', isPreview);
  console.log('🎯 activeSections:', activeSections);
  console.log('🎯 resumeData.workExperience:', resumeData.workExperience);
  
  // Generate the HTML content with pagination
  const htmlContent = generatePdfHtml(resumeData, activeSections, exportSettings, isPreview);
  
  // For both preview and PDF, use the processed HTML content directly
  return htmlContent;
} 