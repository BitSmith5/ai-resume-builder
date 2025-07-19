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

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const templateParam = searchParams.get('template');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎯 PDF GENERATE - Starting PDF generation for resume:', id);
    console.log('🎯 PDF GENERATE - Template:', templateParam || 'modern');

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

    // Handle profile picture
    let profilePictureUrl = resume.profilePicture;
    if (profilePictureUrl && profilePictureUrl.startsWith('data:')) {
      console.log('Using data URL for PDF generation');
    } else if (profilePictureUrl && profilePictureUrl.startsWith('profile_')) {
      console.log('Profile picture stored in localStorage - skipping for PDF generation');
      profilePictureUrl = "";
    }

    // Transform work experience data
    const workExperience = resume.workExperience.map(work => ({
      company: work.company,
      position: work.position,
      startDate: work.startDate.toISOString().split('T')[0],
      endDate: work.endDate ? work.endDate.toISOString().split('T')[0] : '',
      current: work.current,
      bulletPoints: Array.isArray(work.bulletPoints) 
        ? (work.bulletPoints as Array<{ description: string }>).map(bullet => ({ description: bullet.description }))
        : []
    }));

    // Transform education data
    const education = resume.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate.toISOString().split('T')[0],
      endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      current: edu.current,
      gpa: edu.gpa || undefined
    }));

    // Transform courses data
    const courses = resume.courses.map(course => ({
      title: course.title,
      provider: course.provider,
      link: course.link || undefined
    }));

    // Parse the resume content JSON to get the actual personal info
    const resumeContent = resume.content as { personalInfo?: { name?: string; email?: string; phone?: string; city?: string; state?: string; summary?: string; website?: string; linkedin?: string; github?: string } };
    const personalInfo = resumeContent?.personalInfo || {};

    const resumeData = {
      title: resume.title,
      jobTitle: (resume as ResumeWithTemplate).jobTitle || undefined,
      profilePicture: profilePictureUrl || undefined,
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
      strengths: resume.strengths || [],
      workExperience,
      education,
      courses,
      interests: resume.interests || []
    };

    console.log('🎯 PDF GENERATE - Resume data:', {
      title: resumeData.title,
      jobTitle: resumeData.jobTitle,
      strengthsCount: resumeData.strengths.length,
      hasJobTitle: !!resumeData.jobTitle,
      strengthsWithRatings: resumeData.strengths.filter(s => s.rating > 0).length
    });

    // Render HTML
    const template = templateParam || (resume as ResumeWithTemplate).template || 'modern';
    const renderedHtml = renderResumeToHtml(resumeData, template);
    console.log('🎯 PDF GENERATE - HTML rendered, length:', renderedHtml.length);

    // Create full HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${resumeData.title} - Resume</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
            }
            
            /* Force background colors to show in PDF */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .header-background {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .skill-bar-fill {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${renderedHtml}
        </body>
      </html>
    `;

    // Use Puppeteer with Chrome AWS Lambda layer (works in both local and production)
    console.log('🎯 PDF GENERATE - Using Puppeteer with Chrome AWS Lambda...');
    
    try {
      // Use Chrome AWS Lambda for PDF generation (works everywhere)
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || undefined
      });
      
      const page = await browser.newPage();
      await page.setViewport({
        width: 850,
        height: 1100,
        deviceScaleFactor: 2
      });
      
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pdfData = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: true,
        displayHeaderFooter: false
      });
      
      await browser.close();
      const pdfBuffer = Buffer.from(pdfData);
      console.log('🎯 PDF GENERATE - Puppeteer PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      
      // Return PDF as downloadable file
      const pdfResponse = new NextResponse(pdfBuffer);
      pdfResponse.headers.set('Content-Type', 'application/pdf');
      pdfResponse.headers.set('Content-Disposition', `attachment; filename="${resumeData.content.personalInfo.name}-Resume.pdf"`);
      pdfResponse.headers.set('Content-Length', pdfBuffer.length.toString());
      
      console.log('🎯 PDF GENERATE - Returning PDF file for download');
      return pdfResponse;
    } catch (error) {
      console.log('🎯 PDF GENERATE - Puppeteer failed:', error);
      
      // Fallback to HTML with auto-print (works everywhere)
      console.log('🎯 PDF GENERATE - Falling back to HTML with auto-print...');
      
      const htmlWithAutoPrint = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${resumeData.title} - Resume</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: white;
              }
              
              /* Force background colors to show in PDF */
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              .header-background {
                background-color: #c8665b !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              .skill-bar-fill {
                background-color: #c8665b !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              @media print {
                body { margin: 0; }
                .resume-page { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div style="position: fixed; top: 10px; right: 10px; background: #c8665b; color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999;">
              🎯 PDF GENERATE ROUTE<br>
              Template: ${template}<br>
              Auto-print in 2 seconds...
            </div>
            ${renderedHtml}
            <script>
              setTimeout(() => {
                window.print();
              }, 2000);
            </script>
          </body>
        </html>
      `;
      
      // Return HTML instead of PDF
      const response = new NextResponse(htmlWithAutoPrint);
      response.headers.set('Content-Type', 'text/html');
      console.log('🎯 PDF GENERATE - Returning HTML with auto-print as fallback');
      return response;
    }

  } catch (error) {
    console.error('🎯 PDF GENERATE - Error:', error);
    
    // Fallback: return error response
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 