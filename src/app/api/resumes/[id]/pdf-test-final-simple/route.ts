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
  console.log('🎯 FINAL SIMPLE PDF generation function started - MODERN TEMPLATE FORCED!');
  
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
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
      profilePictureType: resumeData.profilePicture ? (resumeData.profilePicture.startsWith('data:') ? 'data URL' : 'other') : 'none',
      strengths: resumeData.strengths.map(s => ({ skillName: s.skillName, rating: s.rating })),
      strengthsCount: resumeData.strengths.length,
      hasJobTitle: !!resumeData.jobTitle
    });

    // Use the existing HTML renderer - force modern template for now
    const template = 'modern'; // Force modern template
    console.log('Using template for PDF generation:', template);
    console.log('About to render HTML...');
    const html = renderResumeToHtml(resumeData, template);
    console.log('HTML rendered successfully, length:', html.length);

    // Return HTML with auto-print functionality
    console.log('Returning HTML with auto-print functionality');
    const htmlWithAutoPrint = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${resumeData.title || 'Resume'}</title>
        <meta charset="UTF-8">
        <style>
          @media print {
            body { margin: 0; }
            .print-instructions, .auto-print-button { display: none; }
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
            max-width: 300px;
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
          .auto-print-button {
            position: fixed;
            top: 10px;
            left: 10px;
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .auto-print-button:hover {
            background: #218838;
          }
          .auto-print-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
          }
        </style>
      </head>
      <body>
        <button class="auto-print-button" onclick="autoPrint()" id="printBtn">
          🖨️ Auto-Print to PDF
        </button>
        
        <div class="print-instructions">
          <h3>📄 Save as PDF</h3>
          <ol>
            <li>Click <strong>"Auto-Print to PDF"</strong> button above, OR</li>
            <li>Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac)</li>
            <li>Select <strong>"Save as PDF"</strong> as destination</li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </div>
        
        ${html}
        
        <script>
          function autoPrint() {
            const btn = document.getElementById('printBtn');
            btn.disabled = true;
            btn.textContent = '🔄 Opening Print Dialog...';
            
            // Small delay to ensure button state updates
            setTimeout(() => {
              window.print();
              
              // Re-enable button after a delay
              setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '🖨️ Auto-Print to PDF';
              }, 2000);
            }, 100);
          }
          
          // Auto-print after 1 second (optional - uncomment if you want this)
          // setTimeout(() => {
          //   autoPrint();
          // }, 1000);
        </script>
      </body>
      </html>
    `;
    
    return new NextResponse(htmlWithAutoPrint, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline; filename="resume.html"',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('FINAL SIMPLE PDF generation error:', error);
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