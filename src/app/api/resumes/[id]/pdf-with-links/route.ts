import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderResumeToHtml } from '@/lib/renderResumeToHtml';
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

// Function to map custom fonts to web-safe fonts for PDF generation
function getWebSafeFont(fontFamily: string): string {
  const fontMap: { [key: string]: string } = {
    'Times New Roman': 'Times New Roman, Times, serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Calibri': 'Arial, Helvetica, sans-serif',
    'Georgia': 'Georgia, Times, serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet MS': 'Trebuchet MS, Arial, sans-serif',
    'Comic Sans MS': 'Comic Sans MS, cursive',
    'Impact': 'Impact, Charcoal, sans-serif',
    'Courier New': 'Courier New, Courier, monospace',
    'Lucida Console': 'Courier New, Courier, monospace',
    'Palatino': 'Palatino, Times, serif',
    'Garamond': 'Garamond, Times, serif',
    'Bookman': 'Bookman, Times, serif',
    'Avant Garde': 'Arial, Helvetica, sans-serif',
    'Helvetica': 'Helvetica, Arial, sans-serif'
  };
  
  return fontMap[fontFamily] || 'Times New Roman, Times, serif';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser;
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
        interests: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Transform work experience data
    const workExperience = resume.workExperience.map(work => ({
      company: work.company || '',
      position: work.position || '',
      startDate: work.startDate.toISOString().split('T')[0],
      endDate: work.endDate ? work.endDate.toISOString().split('T')[0] : '',
      current: work.current || false,
      bulletPoints: Array.isArray(work.bulletPoints) 
        ? (work.bulletPoints as Array<{ description: string }>).map(bullet => ({ description: bullet.description }))
        : []
    }));

    // Transform education data
    const education = resume.education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate.toISOString().split('T')[0],
      endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      current: edu.current || false,
      gpa: edu.gpa || undefined
    }));

    // Transform courses data
    const courses = resume.courses.map(course => ({
      title: course.title || '',
      provider: course.provider || '',
      link: course.link || undefined
    }));

    // Parse the resume content JSON to get the actual personal info
    const resumeContent = resume.content as { personalInfo?: { name?: string; email?: string; phone?: string; city?: string; state?: string; summary?: string; website?: string; linkedin?: string; github?: string } };
    const personalInfo = resumeContent?.personalInfo || {};

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
          website: personalInfo.website || resume.user.portfolioUrl || '',
          linkedin: personalInfo.linkedin || resume.user.linkedinUrl || '',
          github: personalInfo.github || ''
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
      }))
    };

    // Use the existing renderResumeToHtml function
    const template = exportSettings.template === 'standard' ? 'classic' : 'modern';
    const renderedHtml = renderResumeToHtml(resumeData, template, exportSettings);

    // Calculate proper page dimensions based on page size (in points)
    const pageDimensions = {
      letter: { width: 612, height: 792 }, // 8.5" x 11" in points (72 DPI)
      a4: { width: 595, height: 842 }      // A4 in points (72 DPI)
    };
    
    const pageSize = exportSettings.pageSize === 'letter' ? 'letter' : 'a4';
    const pageWidth = pageDimensions[pageSize].width;
    const pageHeight = pageDimensions[pageSize].height;
    
    // Calculate content area (page minus margins)
    const contentWidth = pageWidth - (exportSettings.sideMargins * 2);
    const contentHeight = pageHeight - (exportSettings.topBottomMargin * 2);

    // Create complete HTML with export settings applied
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${resumeData.title} - Resume</title>
          <style>
            * {
              box-sizing: border-box;
            }
            
                         body {
               margin: 0;
               padding: 0;
               background: white;
               color: #000;
               font-family: ${getWebSafeFont(exportSettings.fontFamily)};
               line-height: ${exportSettings.lineSpacing || 1.6};
             }
            
            .resume-container {
              width: ${pageWidth}pt;
              min-height: ${pageHeight}pt;
              margin: 0 auto;
              padding: ${exportSettings.topBottomMargin}pt ${exportSettings.sideMargins}pt;
              background: white;
              position: relative;
              box-sizing: border-box;
            }
            
            .resume-content {
              width: 100%;
              max-width: ${contentWidth}pt;
              margin: 0 auto;
            }
            
            @page {
              size: ${exportSettings.pageSize === 'letter' ? 'letter' : 'A4'};
              margin: 0;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
            
            /* Ensure links are properly styled and clickable */
            a {
              color: #333 !important;
              text-decoration: underline !important;
              cursor: pointer !important;
            }
            
            /* Prevent email auto-detection */
            .email-text {
              color: #333 !important;
              text-decoration: none !important;
              pointer-events: none !important;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <div class="resume-content">
              ${renderedHtml}
            </div>
          </div>
        </body>
      </html>
    `;

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with proper link support
    const pdfBuffer = await page.pdf({
      format: exportSettings.pageSize === 'letter' ? 'Letter' : 'A4',
      printBackground: true,
      margin: {
        top: exportSettings.topBottomMargin,
        right: exportSettings.sideMargins,
        bottom: exportSettings.topBottomMargin,
        left: exportSettings.sideMargins
      },
      preferCSSPageSize: false
    });

    // Close browser
    await browser.close();

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF with links:', error);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 