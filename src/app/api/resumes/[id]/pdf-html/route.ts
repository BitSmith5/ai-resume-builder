import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderResumeToHtml } from '@/lib/renderResumeToHtml';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎯 HTML PDF - Starting HTML generation');
  
  try {
    const { id } = await params;
    console.log('🎯 HTML PDF - Resume ID:', id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('🎯 HTML PDF - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎯 HTML PDF - User authorized:', session.user.email);
    
    // Get export settings from request body
    const body = await request.json();
    const exportSettings: ExportSettings = body.exportSettings;

    console.log('🎯 HTML PDF - Export settings:', exportSettings);
    
    console.log('🎯 HTML PDF - Fetching resume data...');
    
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
      console.log('🎯 HTML PDF - Resume not found');
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    console.log('🎯 HTML PDF - Resume found:', resume.title);
    
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

    console.log('🎯 HTML PDF - Resume data prepared');
    
         // Use the existing renderResumeToHtml function
     const template = exportSettings.template === 'standard' ? 'classic' : 'modern';
     console.log('🎯 HTML PDF - Using template:', template);
     
          const renderedHtml = renderResumeToHtml(resumeData, template, exportSettings);
     console.log('🎯 HTML PDF - HTML rendered successfully, length:', renderedHtml.length);
     


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
    
    console.log('🎯 HTML PDF - Page dimensions:', {
      pageSize,
      pageWidth,
      pageHeight,
      contentWidth,
      contentHeight,
      margins: {
        side: exportSettings.sideMargins,
        topBottom: exportSettings.topBottomMargin
      }
    });

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
              font-family: '${exportSettings.fontFamily || 'Times New Roman'}', serif;
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

    console.log('🎯 HTML PDF - HTML generated successfully');

    // Return HTML with proper headers
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.html"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('🎯 HTML PDF - Error:', error);
    console.error('🎯 HTML PDF - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json(
      { 
        error: 'Failed to generate HTML', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
} 