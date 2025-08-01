import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

interface ResumeWithTemplate {
  template?: string;
  jobTitle?: string;
}

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
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get export settings from request body
    const body = await request.json();
    const exportSettings: ExportSettings = body.exportSettings;

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
        volunteerExperience: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

         // Transform work experience data
     const workExperience = resume.workExperience.map(work => {
       const formatDate = (date: Date | null): string => {
         if (!date || isNaN(date.getTime())) return '';
         try {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
           const month = months[date.getMonth()];
           const year = date.getFullYear();
           return `${month} ${year}`;
         } catch {
           return '';
         }
       };

      return {
        company: work.company || '',
        position: work.position || '',
        startDate: formatDate(work.startDate),
        endDate: formatDate(work.endDate),
        current: work.current || false,
        city: '',
        state: '',
        bulletPoints: Array.isArray(work.bulletPoints) 
          ? (work.bulletPoints as Array<{ description: string }>).map(bullet => ({ description: bullet.description }))
          : []
      };
    });

         // Transform education data
     const education = resume.education.map(edu => {
       const formatDate = (date: Date | null): string => {
         if (!date || isNaN(date.getTime())) return '';
         try {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
           const month = months[date.getMonth()];
           const year = date.getFullYear();
           return `${month} ${year}`;
         } catch {
           return '';
         }
       };

      return {
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: formatDate(edu.startDate),
        endDate: formatDate(edu.endDate),
        current: edu.current || false,
        gpa: edu.gpa || undefined
      };
    });

    // Transform courses data
    const courses = resume.courses.map(course => ({
      title: course.title || '',
      provider: course.provider || '',
      link: course.link || undefined
    }));

         // Transform projects data
     const projects = resume.projects.map(project => {
       const formatDate = (date: Date | null): string => {
         if (!date || isNaN(date.getTime())) return '';
         try {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
           const month = months[date.getMonth()];
           const year = date.getFullYear();
           return `${month} ${year}`;
         } catch {
           return '';
         }
       };

      return {
        id: project.id.toString(),
        title: project.title || '',
        startDate: formatDate(project.startDate),
        endDate: formatDate(project.endDate),
        current: project.current || false,
                 technologies: Array.isArray(project.technologies) ? project.technologies as string[] : [],
         link: formatUrl(project.link || ''),
        bulletPoints: Array.isArray(project.bulletPoints) 
          ? (project.bulletPoints as Array<{ description: string }>).map(bullet => ({ id: Math.random().toString(), description: bullet.description }))
          : []
      };
    });

    // Transform languages data
    const languages = resume.languages.map(lang => ({
      id: lang.id.toString(),
      name: lang.name || '',
      proficiency: lang.proficiency || ''
    }));

    // Transform publications data
    const publications = resume.publications.map(pub => ({
      id: pub.id.toString(),
      title: pub.title || '',
      authors: pub.authors || '',
      journal: pub.journal || '',
             year: pub.year || '',
       doi: pub.doi || '',
       link: formatUrl(pub.link || '')
    }));

    // Transform awards data
    const awards = resume.awards.map(award => ({
      id: award.id.toString(),
      title: award.title || '',
      organization: award.organization || '',
      year: award.year || '',
      bulletPoints: Array.isArray(award.bulletPoints) 
        ? (award.bulletPoints as Array<{ description: string }>).map(bullet => ({ id: Math.random().toString(), description: bullet.description }))
        : []
    }));

         // Transform volunteer experience data
     const volunteerExperience = resume.volunteerExperience.map(vol => {
       const formatDate = (date: Date | null): string => {
         if (!date || isNaN(date.getTime())) return '';
         try {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
           const month = months[date.getMonth()];
           const year = date.getFullYear();
           return `${month} ${year}`;
         } catch {
           return '';
         }
       };

      return {
        id: vol.id.toString(),
        organization: vol.organization || '',
        position: vol.position || '',
        location: vol.location || '',
        startDate: formatDate(vol.startDate),
        endDate: formatDate(vol.endDate),
        current: vol.current || false,
        hoursPerWeek: vol.hoursPerWeek || '',
        bulletPoints: Array.isArray(vol.bulletPoints) 
          ? (vol.bulletPoints as Array<{ description: string }>).map(bullet => ({ id: Math.random().toString(), description: bullet.description }))
          : []
      };
    });

    // Parse the resume content JSON to get the actual personal info
    const resumeContent = resume.content as { personalInfo?: { name?: string; email?: string; phone?: string; city?: string; state?: string; summary?: string; website?: string; linkedin?: string; github?: string } };
    const personalInfo = resumeContent?.personalInfo || {};

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

     const resumeData = {
       title: resume.title,
       jobTitle: (resume as ResumeWithTemplate).jobTitle || undefined,
       profilePicture: resume.profilePicture || undefined,
             content: {
         personalInfo: {
           name: personalInfo.name || resume.user.name || '',
           email: personalInfo.email || resume.user.email || '',
           phone: personalInfo.phone || resume.user.phone || '',
           city: personalInfo.city || resume.user.location || '',
           state: personalInfo.state || '',
           summary: personalInfo.summary || '',
           website: formatUrl(personalInfo.website || resume.user.portfolioUrl || ''),
           linkedin: formatUrl(personalInfo.linkedin || resume.user.linkedinUrl || ''),
           github: formatUrl(personalInfo.github || '')
         }
       },
      strengths: (resume.strengths || []).map(strength => ({
        skillName: strength.skillName || '',
        rating: strength.rating || 0
      })),
      workExperience,
      education,
      courses,
      interests: (resume.interests || []).map(interest => ({
        name: interest.name || '',
        icon: interest.icon || ''
      })),
      projects,
      languages,
      publications,
      awards,
      volunteerExperience
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
            line-height: ${exportSettings.lineSpacing};
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
              margin-bottom: 0pt;
              padding-bottom: 0pt;
              line-height: 1;
            }
                     .contact-info {
             text-align: center;
             margin-bottom: 2pt;
             display: flex;
             justify-content: center;
             align-items: center;
             gap: 0pt;
             flex-wrap: wrap;
             line-height: 1;
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
            }
           .entry-date {
             font-weight: bold;
             text-align: right;
           }
          .bullet-points {
            margin-left: 20pt;
          }
          .bullet-point {
            margin-bottom: 3pt;
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

        ${resumeData.content.personalInfo.summary ? `
        <div class="section">
          <div class="section-header">Summary</div>
          <div>${resumeData.content.personalInfo.summary}</div>
        </div>
        ` : ''}

                 ${resumeData.workExperience && resumeData.workExperience.length > 0 ? `
         <div class="section">
           <div class="section-header">Work Experience</div>
           ${resumeData.workExperience.map(work => `
             <div class="entry">
               <div class="entry-header">
                 <div class="entry-company">${work.company}</div>
                 <div class="entry-date">${work.startDate} - ${work.current ? 'Present' : work.endDate}</div>
               </div>
               <div class="entry-position">${work.position}</div>
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
         ` : ''}

                 ${resumeData.education && resumeData.education.length > 0 ? `
         <div class="section">
           <div class="section-header">Education</div>
           ${resumeData.education.map(edu => `
             <div class="entry">
               <div class="entry-header">
                 <div class="entry-title">${edu.degree} in ${edu.field}</div>
                 <div class="entry-date">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</div>
               </div>
               <div>${edu.institution}</div>
               ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
             </div>
           `).join('')}
         </div>
         ` : ''}

                 ${resumeData.projects && resumeData.projects.length > 0 ? `
         <div class="section">
           <div class="section-header">Projects</div>
           ${resumeData.projects.map(project => `
             <div class="entry">
               <div class="entry-header">
                 <div class="entry-title">
                   ${project.link ? `<a href="${project.link}" class="project-link">${project.title}</a>` : project.title}
                 </div>
                 <div class="entry-date">${project.startDate} - ${project.current ? 'Present' : project.endDate}</div>
               </div>
               <div>${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}</div>
               ${project.bulletPoints && project.bulletPoints.length > 0 ? `
                 <div class="bullet-points">
                   ${project.bulletPoints.map(bullet => `
                     <div class="bullet-point">• ${bullet.description}</div>
                   `).join('')}
                 </div>
               ` : ''}
             </div>
           `).join('')}
         </div>
         ` : ''}

        ${resumeData.strengths && resumeData.strengths.length > 0 ? `
        <div class="section">
          <div class="section-header">Skills</div>
          <div>${resumeData.strengths.map(skill => skill.skillName).join(', ')}</div>
        </div>
        ` : ''}

                 ${resumeData.courses && resumeData.courses.length > 0 ? `
         <div class="section">
           <div class="section-header">Courses</div>
           ${resumeData.courses.map(course => `
             <div class="entry">
               <div class="entry-title">${course.title}</div>
               <div>${course.provider}</div>
             </div>
           `).join('')}
         </div>
         ` : ''}

        ${resumeData.languages && resumeData.languages.length > 0 ? `
        <div class="section">
          <div class="section-header">Languages</div>
          <div>${resumeData.languages.map(lang => `${lang.name} (${lang.proficiency})`).join(', ')}</div>
        </div>
        ` : ''}

                 ${resumeData.publications && resumeData.publications.length > 0 ? `
         <div class="section">
           <div class="section-header">Publications</div>
           ${resumeData.publications.map(pub => `
             <div class="entry">
               <div class="entry-title">${pub.title}</div>
               <div>${pub.authors}</div>
               <div>${pub.journal}, ${pub.year}</div>
             </div>
           `).join('')}
         </div>
         ` : ''}

                 ${resumeData.awards && resumeData.awards.length > 0 ? `
         <div class="section">
           <div class="section-header">Awards</div>
           ${resumeData.awards.map(award => `
             <div class="entry">
               <div class="entry-title">${award.title}</div>
               <div>${award.organization}, ${award.year}</div>
               ${award.bulletPoints && award.bulletPoints.length > 0 ? `
                 <div class="bullet-points">
                   ${award.bulletPoints.map(bullet => `
                     <div class="bullet-point">• ${bullet.description}</div>
                   `).join('')}
                 </div>
               ` : ''}
             </div>
           `).join('')}
         </div>
         ` : ''}

                 ${resumeData.volunteerExperience && resumeData.volunteerExperience.length > 0 ? `
         <div class="section">
           <div class="section-header">Volunteer Experience</div>
           ${resumeData.volunteerExperience.map(vol => `
             <div class="entry">
               <div class="entry-header">
                 <div class="entry-title">${vol.position}</div>
                 <div class="entry-date">${vol.startDate} - ${vol.current ? 'Present' : vol.endDate}</div>
               </div>
               <div>${vol.organization}</div>
               <div>${vol.location}</div>
               ${vol.hoursPerWeek ? `<div>${vol.hoursPerWeek} hours/week</div>` : ''}
               ${vol.bulletPoints && vol.bulletPoints.length > 0 ? `
                 <div class="bullet-points">
                   ${vol.bulletPoints.map(bullet => `
                     <div class="bullet-point">• ${bullet.description}</div>
                   `).join('')}
                 </div>
               ` : ''}
             </div>
           `).join('')}
         </div>
         ` : ''}

        ${resumeData.interests && resumeData.interests.length > 0 ? `
        <div class="section">
          <div class="section-header">Interests</div>
          <div>${resumeData.interests.map(interest => interest.name).join(', ')}</div>
        </div>
        ` : ''}
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