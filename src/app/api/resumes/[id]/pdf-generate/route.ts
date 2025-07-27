import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderResumeToHtml } from '@/lib/renderResumeToHtml';

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

    // Handle profile picture - EXACTLY like your working routes
    let profilePictureUrl = resume.profilePicture;
    console.log('Original profile picture:', profilePictureUrl ? profilePictureUrl.substring(0, 50) + '...' : 'None');
    
    if (profilePictureUrl) {
      if (profilePictureUrl.startsWith('data:')) {
        // Data URL - use as is (perfect for PDF generation)
        profilePictureUrl = profilePictureUrl;
        console.log('Using data URL for PDF generation');
      } else if (profilePictureUrl.startsWith('http')) {
        // Absolute URL - use as is
        profilePictureUrl = profilePictureUrl;
        console.log('Using absolute URL as is:', profilePictureUrl);
      } else if (profilePictureUrl.startsWith('profile_')) {
        // This is a localStorage image ID - we can't access localStorage from server
        console.log('Profile picture stored in localStorage - skipping for PDF generation');
        profilePictureUrl = "";
      } else {
        // Legacy relative path - convert to absolute URL
        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        
        if (profilePictureUrl.startsWith('/uploads/')) {
          profilePictureUrl = `${baseUrl}${profilePictureUrl}`;
        } else {
          profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${profilePictureUrl}`;
        }
        
        console.log('Converted legacy path to absolute URL:', profilePictureUrl);
      }
    } else {
      console.log('No profile picture found');
    }

    // Transform work experience data - EXACTLY like your working routes
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

    // Transform education data - EXACTLY like your working routes
    const education = resume.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate.toISOString().split('T')[0],
      endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      current: edu.current,
      gpa: edu.gpa || undefined
    }));

    // Transform courses data - EXACTLY like your working routes
    const courses = resume.courses.map(course => ({
      title: course.title,
      provider: course.provider,
      link: course.link || undefined
    }));

    // Parse the resume content JSON to get the actual personal info - EXACTLY like your working routes
    const resumeContent = resume.content as { personalInfo?: { name?: string; email?: string; phone?: string; city?: string; state?: string; summary?: string; website?: string; linkedin?: string; github?: string } };
    const personalInfo = resumeContent?.personalInfo || {};

    const resumeData = {
      title: resume.title,
      jobTitle: (resume as ResumeWithTemplate).jobTitle || undefined,
      profilePicture: profilePictureUrl || undefined,
      sectionOrder: Array.isArray(resume.sectionOrder) ? (resume.sectionOrder as string[]) : undefined, // Add sectionOrder from database
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

    // Use the existing HTML renderer - EXACTLY like your working routes
    const template = templateParam || (resume as ResumeWithTemplate).template || 'modern';
    console.log('🎯 PDF GENERATE - Using template for PDF generation:', template);
    console.log('🎯 PDF GENERATE - About to render HTML...');
    const renderedHtml = renderResumeToHtml(resumeData, template);
    console.log('🎯 PDF GENERATE - HTML rendered successfully, length:', renderedHtml.length);

    // DEBUG: Log the rendered HTML to see what we're working with
    console.log('🎯 PDF GENERATE - Rendered HTML preview (first 500 chars):', renderedHtml.substring(0, 500));
    console.log('🎯 PDF GENERATE - Rendered HTML length:', renderedHtml.length);
    console.log('🎯 PDF GENERATE - Template used:', template);
    console.log('🎯 PDF GENERATE - Job title present:', !!resumeData.jobTitle);
    console.log('🎯 PDF GENERATE - Skills count:', resumeData.strengths.length);
    console.log('🎯 PDF GENERATE - Skills with ratings > 0:', resumeData.strengths.filter(s => s.rating > 0).length);
    
    // Create HTML with auto-print - EXACTLY like your working routes
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
            
            /* Ensure section header lines show up in PDF */
            div[style*="background: #c8665b"] {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Force all red background elements to show */
            div[style*="background: #c8665b"] {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Make section header lines visible but not too thick */
            div[style*="height: 2px"] {
              height: 2px !important;
              min-height: 2px !important;
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Prevent extra blank pages */
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
            }
            
            /* Remove any extra spacing that might cause blank pages */
            .resume-container {
              page-break-after: avoid;
              break-after: avoid;
            }
            
            @media print {
              body { margin: 0; }
              .resume-page { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${renderedHtml}
          <script>
            setTimeout(() => {
              window.print();
            }, 2000);
          </script>
        </body>
      </html>
    `;
    
    // DEBUG: Log the final HTML
    console.log('🎯 PDF GENERATE - Final HTML length:', htmlWithAutoPrint.length);
    console.log('🎯 PDF GENERATE - Final HTML preview (first 500 chars):', htmlWithAutoPrint.substring(0, 500));
    
    // Return HTML with auto-print
    const response = new NextResponse(htmlWithAutoPrint);
    response.headers.set('Content-Type', 'text/html');
    console.log('🎯 PDF GENERATE - Returning HTML with auto-print, Content-Type: text/html');
    console.log('🎯 PDF GENERATE - Response headers set:', {
      'Content-Type': 'text/html',
      'Content-Length': htmlWithAutoPrint.length
    });
    return response;

  } catch (error) {
    console.error('🎯 PDF GENERATE - Error:', error);
    
    // Fallback: return error response
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 