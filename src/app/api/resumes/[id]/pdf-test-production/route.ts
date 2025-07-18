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
  console.log('PRODUCTION PDF generation function started');
  
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const templateParam = searchParams.get('template');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching resume data...');
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

    // Handle profile picture - support both data URLs and localStorage IDs
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

    console.log('Resume data for PDF generation:', {
      title: resumeData.title,
      jobTitle: resumeData.jobTitle,
      profilePicture: resumeData.profilePicture ? resumeData.profilePicture.substring(0, 50) + '...' : 'None',
      hasProfilePicture: !!resumeData.profilePicture,
      profilePictureType: resumeData.profilePicture ? (resumeData.profilePicture.startsWith('data:') ? 'data URL' : 'other') : 'none'
    });

    // Use the existing HTML renderer
    const template = templateParam || (resume as ResumeWithTemplate).template || 'modern';
    console.log('Using template for PDF generation:', template);
    console.log('About to render HTML...');
    const html = renderResumeToHtml(resumeData, template);
    console.log('HTML rendered successfully, length:', html.length);

    // Production-focused PDF generation using reliable external service
    console.log('Attempting PDF generation with external service...');
    
    try {
      // Use a more reliable HTML to PDF service
      console.log('Trying html2pdf.app service...');
      const pdfResponse = await fetch('https://api.html2pdf.app/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: html,
          options: {
            format: 'A4',
            margin: {
              top: '0.5in',
              right: '0.5in',
              bottom: '0.5in',
              left: '0.5in'
            },
            printBackground: true
          }
        })
      });

      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        console.log('External service PDF generation successful, size:', pdfBuffer.byteLength, 'bytes');
        
        // Verify it's actually a PDF by checking the first few bytes
        const firstBytes = new Uint8Array(pdfBuffer.slice(0, 4));
        const isPdf = firstBytes[0] === 0x25 && firstBytes[1] === 0x50 && firstBytes[2] === 0x44 && firstBytes[3] === 0x46; // %PDF
        
        if (isPdf) {
          console.log('Verified: Response is a valid PDF file');
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${resume.title || 'resume'}-PRODUCTION.pdf"`,
              'Cache-Control': 'no-cache'
            }
          });
        } else {
          console.log('Warning: Response is not a valid PDF, falling back to HTML');
          throw new Error('External service returned non-PDF content');
        }
      } else {
        console.log('External service failed with status:', pdfResponse.status);
        throw new Error('External service failed with status: ' + pdfResponse.status);
      }
      
    } catch (externalError) {
      console.log('External service failed:', externalError instanceof Error ? externalError.message : 'Unknown error');
      
      // Fallback: Return HTML with print instructions
      console.log('Falling back to HTML with print instructions');
      const htmlWithPrintInstructions = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${resumeData.title || 'Resume'}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .print-instructions { display: none; }
            }
            .print-instructions {
              position: fixed;
              top: 10px;
              right: 10px;
              background: #007bff;
              color: white;
              padding: 15px;
              border-radius: 8px;
              z-index: 1000;
              font-family: Arial, sans-serif;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .print-instructions h3 {
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .print-instructions ol {
              margin: 0;
              padding-left: 20px;
            }
            .print-instructions li {
              margin-bottom: 5px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="print-instructions">
            <h3>📄 Save as PDF</h3>
            <ol>
              <li>Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac)</li>
              <li>Select <strong>"Save as PDF"</strong> as destination</li>
              <li>Click <strong>Save</strong></li>
            </ol>
          </div>
          ${html}
        </body>
        </html>
      `;
      
      return new NextResponse(htmlWithPrintInstructions, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': 'inline; filename="resume.html"'
        }
      });
    }

  } catch (error) {
    console.error('PRODUCTION PDF generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 