import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';
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
  console.log('SIMPLE FIXED PDF generation function started');
  
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

    // Use the existing HTML renderer but with improved styling
    const template = templateParam || (resume as ResumeWithTemplate).template || 'modern';
    console.log('Using template for PDF generation:', template);
    console.log('About to render HTML...');
    const html = renderResumeToHtml(resumeData, template);
    console.log('HTML rendered successfully, length:', html.length);

    // Try Puppeteer first (works locally), then fall back to external service (works in production)
    console.log('Attempting PDF generation...');
    
    let pdfBuffer: Buffer | null = null;
    
    // Method 1: Try Puppeteer (works locally)
    try {
      console.log('Trying Puppeteer for PDF generation...');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({
        width: 850,
        height: 1100,
        deviceScaleFactor: 2
      });
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
             const pdfData = await page.pdf({
         format: 'letter',
         printBackground: true,
         margin: { top: '0', right: '0', bottom: '0', left: '0' },
         preferCSSPageSize: true,
         displayHeaderFooter: false
       });
       
       await browser.close();
       pdfBuffer = Buffer.from(pdfData);
       console.log('Puppeteer PDF generation successful, size:', pdfBuffer.length, 'bytes');
      
    } catch (puppeteerError) {
      console.log('Puppeteer failed, trying external service:', puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error');
      
      // Method 2: Try external PDF service (works in production)
      try {
        console.log('Trying external PDF service...');
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
           const arrayBuffer = await pdfResponse.arrayBuffer();
           pdfBuffer = Buffer.from(arrayBuffer);
           console.log('External service PDF generation successful, size:', pdfBuffer.length, 'bytes');
         } else {
           throw new Error('External service returned error: ' + pdfResponse.status);
         }
        
      } catch (externalError) {
        console.log('External service failed:', externalError instanceof Error ? externalError.message : 'Unknown error');
        
        // Method 3: Try another external service as backup
        try {
          console.log('Trying backup PDF service...');
                     const backupResponse = await fetch('https://api.cloudconvert.com/v2/convert', {
             method: 'POST',
             headers: {
               'Authorization': 'Bearer ' + (process.env.CLOUDCONVERT_API_KEY || ''),
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               file: Buffer.from(html).toString('base64'),
               outputformat: 'pdf',
               input: [{
                 type: 'string',
                 content: html
               }],
               output: {
                 type: 'url',
                 format: 'pdf'
               }
             })
           });
          
                     if (backupResponse.ok) {
             const result = await backupResponse.json();
             const downloadResponse = await fetch(result.data.output.url);
             const arrayBuffer = await downloadResponse.arrayBuffer();
             pdfBuffer = Buffer.from(arrayBuffer);
             console.log('Backup service PDF generation successful, size:', pdfBuffer.length, 'bytes');
           } else {
             throw new Error('Backup service failed');
           }
          
        } catch (backupError) {
          console.log('All PDF generation methods failed, falling back to HTML with print instructions');
          
          // Final fallback: Return HTML with print instructions
          const htmlWithPrintInstructions = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${resumeData.title || 'Resume'}</title>
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
                  padding: 10px;
                  border-radius: 5px;
                  z-index: 1000;
                }
              </style>
            </head>
            <body>
              <div class="print-instructions">
                <strong>To save as PDF:</strong><br>
                1. Press Ctrl+P (or Cmd+P on Mac)<br>
                2. Select "Save as PDF"<br>
                3. Click Save
              </div>
              ${html}
            </body>
            </html>
          `;
          
          return new NextResponse(htmlWithPrintInstructions, {
            headers: {
              'Content-Type': 'text/html',
              'Content-Disposition': 'inline; filename="resume.html"'
            }
          });
        }
      }
    }
    
    if (pdfBuffer) {
      console.log('PDF generated successfully, returning PDF file');
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${resume.title || 'resume'}-PRODUCTION.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      throw new Error('Failed to generate PDF through any method');
    }

  } catch (error) {
    console.error('SIMPLE FIXED PDF generation error:', error);
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