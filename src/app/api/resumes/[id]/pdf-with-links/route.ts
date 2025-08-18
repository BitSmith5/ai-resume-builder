import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import puppeteer from 'puppeteer';
import { transformResumeData } from '../../../../../services';



interface ExportSettings {
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

export const runtime = 'nodejs';

// URL formatting function to ensure proper protocol
const formatUrl = (url: string): string => {
  if (!url) return '';
  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  return url;
};



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎯 PDF-WITH-LINKS - Starting PDF generation');
  try {
    const { id } = await params;
    console.log('🎯 PDF-WITH-LINKS - Resume ID:', id);
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get export settings from request body
    const body = await request.json();
    const exportSettings: ExportSettings = body.exportSettings;

         
     
           console.log('🔍 PDF DEBUG - Starting database query for resume ID:', id);
      
      const resume = await prisma.resume.findFirst({
        where: {
          id: parseInt(id),
          user: {
            email: session.user.email
          }
        },
        include: {
          user: true,
          strengths: true,
          workExperience: true,
          education: true,
          courses: true,
          interests: true,
          projects: true,
          languages: true,
          publications: true,
          awards: true,
          volunteerExperience: true,
          references: true
        }
      });
      
      console.log('🔍 PDF DEBUG - Resume found:', !!resume);
      console.log('🔍 PDF DEBUG - Resume title:', resume?.title);
      console.log('🔍 PDF DEBUG - Raw strengths count:', resume?.strengths?.length || 0);
      console.log('🔍 PDF DEBUG - Raw volunteerExperience count:', resume?.volunteerExperience?.length || 0);
      console.log('🔍 PDF DEBUG - Raw references count:', resume?.references?.length || 0);
     
     

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Use shared data transformer for consistency (with formatted dates for PDF)
    const resumeData = transformResumeData(resume, 'formatted');

    // Get the section order from the resume, with fallback to default order
    const sectionOrder = (resume.sectionOrder as string[]) || [
      'Professional Summary',
      'Work Experience',
      'Projects',
      'Education',
      'Technical Skills',
      'Courses',
      'Interests',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References'
    ];

    // Get deleted sections
    const deletedSections = (resume.deletedSections as string[]) || [];

    // Filter out deleted sections
    const activeSections = sectionOrder.filter(section => !deletedSections.includes(section));

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

    // Debug logging to see what data we have
    console.log('🔍 PDF DEBUG - Data Summary:');
    console.log('🔍 Strengths count:', resumeData.strengths?.length || 0);
    console.log('🔍 Skill Categories count:', resumeData.skillCategories?.length || 0);
    console.log('🔍 Volunteer Experience count:', resumeData.volunteerExperience?.length || 0);
    console.log('🔍 References count:', resumeData.references?.length || 0);
    console.log('🔍 Section Order:', sectionOrder);
    console.log('🔍 Active Sections:', activeSections);

    // Function to render sections based on the active sections order
    const renderSection = (sectionName: string): string => {
      switch (sectionName) {
        case 'Professional Summary':
          return resumeData.content.personalInfo.summary ? `
            <div class="section">
              <div class="section-header">Professional Summary</div>
              <div class="body-text">${resumeData.content.personalInfo.summary}</div>
            </div>
          ` : '';
        
        case 'Work Experience':
          return resumeData.workExperience && resumeData.workExperience.length > 0 ? `
            <div class="section">
              <div class="section-header">Work Experience</div>
              ${resumeData.workExperience.map(work => `
                <div class="entry">
                  <div class="entry-header">
                    <div class="entry-company">${work.company}</div>
                    <div class="entry-date">${work.startDate} - ${work.current ? 'Present' : work.endDate}</div>
                  </div>
                  <div class="entry-position body-text">${work.position}</div>
                  ${work.bulletPoints && work.bulletPoints.length > 0 ? `
                    <div class="bullet-points">
                      ${work.bulletPoints.map(bullet => `
                        <div class="bullet-point">• ${bullet.description}</div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '';
        
        case 'Projects':
          return resumeData.projects && resumeData.projects.length > 0 ? `
            <div class="section">
              <div class="section-header">Projects</div>
              ${resumeData.projects.map(project => `
                <div class="entry">
                  <div class="entry-header">
                    <div class="entry-title">
                      ${project.link ? `<a href="${formatUrl(project.link)}" class="project-link">${project.title}</a>` : project.title}
                    </div>
                  </div>
                  <div class="body-text">${project.description}</div>
                  ${project.technologies && project.technologies.length > 0 ? `
                    <div class="body-text">Technologies: ${project.technologies.join(', ')}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '';
        
        case 'Education':
          return resumeData.education && resumeData.education.length > 0 ? `
            <div class="section">
              <div class="section-header">Education</div>
              ${resumeData.education.map(edu => `
                <div class="entry">
                  <div class="entry-header">
                    <div class="entry-title">${edu.degree} in ${edu.field}</div>
                    <div class="entry-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</div>
                  </div>
                  <div class="body-text">${edu.institution}</div>
                  ${edu.gpa ? `<div class="body-text">GPA: ${edu.gpa}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : '';
          
          case 'Technical Skills':
            // Check for skillCategories first (structured format), then fall back to strengths
            if (resumeData.skillCategories && resumeData.skillCategories.length > 0) {
              return `
                <div class="section">
                  <div class="section-header">Technical Skills</div>
                  ${resumeData.skillCategories.map((category: { id: string; title: string; skills: Array<{ id: string; name: string }> }) => `
                    <div class="entry">
                      <div class="entry-title">${category.title}</div>
                      <div class="body-text">${category.skills.map((skill: { id: string; name: string }) => skill.name).join(', ')}</div>
                    </div>
                  `).join('')}
                </div>
              `;
            } else if (resumeData.strengths && resumeData.strengths.length > 0) {
              return `
                <div class="section">
                  <div class="section-header">Technical Skills</div>
                  <div class="body-text">${resumeData.strengths.map(skill => skill.skillName).join(', ')}</div>
                </div>
              `;
            }
            return '';
          
          case 'Courses':
            return resumeData.courses && resumeData.courses.length > 0 ? `
              <div class="section">
                <div class="section-header">Courses</div>
                ${resumeData.courses.map(course => `
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
                <div class="body-text">${resumeData.interests.map(interest => interest.name).join(', ')}</div>
              </div>
            ` : '';
          
          case 'Languages':
            return resumeData.languages && resumeData.languages.length > 0 ? `
              <div class="section">
                <div class="section-header">Languages</div>
                <div class="body-text">${resumeData.languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ')}</div>
              </div>
            ` : '';
          
          case 'Publications':
            return resumeData.publications && resumeData.publications.length > 0 ? `
              <div class="section">
                <div class="section-header">Publications</div>
                ${resumeData.publications.map(pub => `
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
                ${resumeData.awards.map(award => `
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
                ${resumeData.volunteerExperience.map(vol => `
                  <div class="entry">
                    <div class="entry-header">
                      <div class="entry-title">${vol.position}</div>
                      <div class="entry-date">${vol.startDate} - ${vol.current ? 'Present' : vol.endDate}</div>
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
                ${resumeData.references.map(ref => `
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

    // Create clean HTML template with export settings applied
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${resumeData.title || 'Resume'}</title>
        <style>
          @page {
            size: ${exportSettings.pageSize === 'letter' ? 'letter' : 'A4'};
            margin: ${exportSettings.topBottomMargin}pt ${exportSettings.sideMargins}pt;
          }
          body {
            font-family: ${exportSettings.fontFamily || 'Arial, Helvetica, sans-serif'};
            font-size: ${exportSettings.bodyTextSize}pt;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-synthesis: none;
          }
          .header {
            text-align: center;
            margin-bottom: 5pt;
          }
                     .name {
             font-size: ${exportSettings.nameSize}pt;
             font-weight: normal;
             margin-bottom: 2pt;
           }
                                                                                               .job-title {
                font-size: ${exportSettings.bodyTextSize}pt;
                margin-bottom: 4pt;
                padding-bottom: 0pt;
              }
                     .contact-info {
             text-align: center;
             margin-bottom: 2pt;
             display: flex;
             justify-content: center;
             align-items: center;
             gap: 0pt;
             flex-wrap: wrap;
           }
                     .contact-link {
             color: #000000;
             text-decoration: underline;
             cursor: pointer;
           }
           .contact-separator {
             margin: 0 2pt;
             color: #000000;
           }
          .section {
            margin-bottom: ${exportSettings.sectionSpacing}pt;
          }
                                           .section-header {
              font-size: ${exportSettings.sectionHeadersSize}pt;
              font-weight: bold;
              margin-bottom: 2.5pt;
              border-bottom: 1pt solid #000;
            }
                                           .sub-header {
              font-size: ${exportSettings.subHeadersSize}pt;
              font-weight: bold;
              margin-bottom: 1.5pt;
            }
                     .entry {
             margin-bottom: ${exportSettings.entrySpacing}pt;
           }
                                               .entry-header {
               display: flex;
               justify-content: space-between;
               align-items: baseline;
               margin-bottom: 1.5pt;
             }
                       .entry-title {
              font-weight: bold;
            }
            .entry-company {
              font-weight: bold;
            }
                                                                                                       .entry-position {
                font-style: italic;
                margin-bottom: 2pt;
              }
           .entry-date {
             font-weight: bold;
             text-align: right;
           }
                                                                                                                                                                               .bullet-points {
                margin-left: 5pt;
              }
                                                                                               .bullet-point {
                line-height: ${exportSettings.lineSpacing * 8}pt;
                padding-left: 4pt;
                text-indent: -4pt;
              }
            .body-text {
              line-height: ${exportSettings.lineSpacing * 7}pt;
            }
          .project-link {
            color: #0066cc;
            text-decoration: none;
            font-weight: bold;
          }
                     .project-link:hover {
             text-decoration: underline;
           }
           
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resumeData.content.personalInfo.name}</div>
          ${resumeData.jobTitle ? `<div class="job-title">${resumeData.jobTitle}</div>` : ''}
        </div>
        
                 <div class="contact-info">
           ${resumeData.content.personalInfo.city || resumeData.content.personalInfo.state ? 
             `<span>${resumeData.content.personalInfo.city || ''}${resumeData.content.personalInfo.city && resumeData.content.personalInfo.state ? ', ' : ''}${resumeData.content.personalInfo.state || ''}</span>` : ''}
           ${resumeData.content.personalInfo.phone ? 
             `${resumeData.content.personalInfo.city || resumeData.content.personalInfo.state ? '<span class="contact-separator">•</span>' : ''}<span>${formatPhoneNumber(resumeData.content.personalInfo.phone)}</span>` : ''}
           ${resumeData.content.personalInfo.email ? 
             `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone) ? '<span class="contact-separator">•</span>' : ''}<span>${resumeData.content.personalInfo.email}</span>` : ''}
           ${resumeData.content.personalInfo.linkedin ? 
             `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.linkedin}" class="contact-link">LinkedIn</a></span>` : ''}
           ${resumeData.content.personalInfo.github ? 
             `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email || resumeData.content.personalInfo.linkedin) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.github}" class="contact-link">GitHub</a></span>` : ''}
                       ${resumeData.content.personalInfo.website ? 
              `${(resumeData.content.personalInfo.city || resumeData.content.personalInfo.state || resumeData.content.personalInfo.phone || resumeData.content.personalInfo.email || resumeData.content.personalInfo.linkedin || resumeData.content.personalInfo.github) ? '<span class="contact-separator">•</span>' : ''}<span><a href="${resumeData.content.personalInfo.website}" class="contact-link">${resumeData.content.personalInfo.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
         </div>

                                                                                           ${activeSections.map(section => renderSection(section)).join('')}
      </body>
      </html>
    `;

    // Launch Puppeteer with standard arguments
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF with font-disabling options
    const pdf = await page.pdf({
      format: exportSettings.pageSize === 'letter' ? 'letter' : 'A4',
      printBackground: true,
      margin: {
        top: `${exportSettings.topBottomMargin * 1.33}px`, // Convert pt to px (1pt ≈ 1.33px)
        bottom: `${exportSettings.topBottomMargin * 1.33}px`,
        left: `${exportSettings.sideMargins * 1.33}px`,
        right: `${exportSettings.sideMargins * 1.33}px`
      },
      preferCSSPageSize: true
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 