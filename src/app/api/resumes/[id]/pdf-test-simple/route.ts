import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('Simple PDF generation function started');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // const template = request.nextUrl.searchParams.get('template') || 'modern';

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
        interests: true,
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Handle profile picture
    let profilePictureUrl = resume.profilePicture;
    if (profilePictureUrl && profilePictureUrl.startsWith('profile_')) {
      profilePictureUrl = "";
    }

    // Transform data
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

    const education = resume.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate.toISOString().split('T')[0],
      endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      current: edu.current,
      gpa: edu.gpa || undefined
    }));

    const courses = resume.courses.map(course => ({
      title: course.title,
      provider: course.provider,
      link: course.link || undefined
    }));

    // Generate simple HTML with basic CSS
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${year}`;
      } catch {
        return dateString;
      }
    };

    const formatUrl = (url: string): string => {
      if (!url) return '';
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    };

    // Generate skills HTML with visible progress bars
    const skillsHtml = resume.strengths.map((skill) => {
      const percentage = (skill.rating / 10) * 100;
      return `
        <div style="margin-bottom: 15px;">
          <div style="margin-bottom: 5px; font-size: 12px; font-weight: bold;">${skill.skillName}</div>
          <div style="width: 100%; height: 8px; border: 1px solid #c8665b; background-color: #f0f0f0;">
            <div style="width: ${percentage}%; height: 100%; background-color: #c8665b;"></div>
          </div>
          <div style="font-size: 10px; color: #666; margin-top: 2px;">${skill.rating}/10</div>
        </div>
      `;
    }).join('');

    // Generate work experience HTML
    const workExperienceHtml = workExperience.map((work) => {
      const dateRange = work.current 
        ? `${formatDate(work.startDate)} - PRESENT`
        : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
      
      const bulletPoints = work.bulletPoints.map((bullet) => 
        `<li style="margin-bottom: 5px; font-size: 12px; line-height: 1.4;">${bullet.description}</li>`
      ).join('');

      return `
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; font-size: 16px; color: #c8665b; margin-bottom: 5px;">${work.position}</div>
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 3px;">${work.company}</div>
          <div style="font-size: 12px; color: #666; font-style: italic; margin-bottom: 10px;">${dateRange}</div>
          ${bulletPoints ? `<ul style="margin: 0; padding-left: 20px;">${bulletPoints}</ul>` : ''}
        </div>
      `;
    }).join('');

    // Generate education HTML
    const educationHtml = education.map((edu) => {
      const dateRange = edu.current 
        ? `${formatDate(edu.startDate)} - PRESENT`
        : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
      
      return `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; font-size: 14px; color: #c8665b;">${edu.degree} in ${edu.field}</div>
          <div style="font-size: 13px; margin-bottom: 3px;">${edu.institution}</div>
          <div style="font-size: 11px; color: #666; font-style: italic;">${dateRange}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
        </div>
      `;
    }).join('');

    // Generate courses HTML
    const coursesHtml = courses.length > 0 ? courses.map((course) => 
      `<div style="margin-bottom: 10px;">
        <div style="font-weight: bold; font-size: 13px;">${course.title}</div>
        <div style="font-size: 11px; color: #666;">${course.provider}</div>
      </div>`
    ).join('') : '';

    // Generate interests HTML
    const interestsHtml = resume.interests.length > 0 ? resume.interests.map((interest) => 
      `<div style="margin-bottom: 5px; font-size: 12px;">• ${interest.name}</div>`
    ).join('') : '';

    // Contact info HTML
    const contactInfo = [
      resume.user.email && `<div style="margin-bottom: 10px;"><strong style="color: #c8665b;">EMAIL:</strong> ${resume.user.email}</div>`,
      resume.user.phone && `<div style="margin-bottom: 10px;"><strong style="color: #c8665b;">PHONE:</strong> ${resume.user.phone}</div>`,
      resume.user.location && `<div style="margin-bottom: 10px;"><strong style="color: #c8665b;">LOCATION:</strong> ${resume.user.location}</div>`,
      resume.user.portfolioUrl && `<div style="margin-bottom: 10px;"><strong style="color: #c8665b;">WEBSITE:</strong> ${formatUrl(resume.user.portfolioUrl)}</div>`,
      resume.user.linkedinUrl && `<div style="margin-bottom: 10px;"><strong style="color: #c8665b;">LINKEDIN:</strong> ${formatUrl(resume.user.linkedinUrl)}</div>`
    ].filter(Boolean).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${resume.title || 'Resume'}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: white;
          }
          .header {
            background-color: #c8665b !important;
            color: white !important;
            padding: 20px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            color: white !important;
          }
          .header h2 {
            margin: 0;
            font-size: 18px;
            color: white !important;
          }
          .container {
            display: flex;
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .sidebar {
            width: 250px;
            padding: 20px;
            background-color: #f8f8f8;
          }
          .main-content {
            flex: 1;
            padding: 20px;
          }
          .section-title {
            color: #c8665b;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #c8665b;
            padding-bottom: 5px;
          }
          .profile-pic {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 20px;
            display: block;
          }
          .skill-bar {
            width: 100%;
            height: 8px;
            border: 1px solid #c8665b;
            background-color: #f0f0f0;
            margin-bottom: 5px;
          }
          .skill-fill {
            height: 100%;
            background-color: #c8665b;
          }
          @media print {
            body { margin: 0; }
            .container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resume.user.name || 'Name'}</h1>
          <h2>${resume.jobTitle || 'Job Title'}</h2>
        </div>
        
        <div class="container">
          <div class="sidebar">
            ${profilePictureUrl ? `<img src="${profilePictureUrl}" alt="Profile" class="profile-pic" />` : ''}
            
            <div class="section-title">CONTACT</div>
            ${contactInfo}
            
            ${resume.strengths.length > 0 ? `
              <div class="section-title">TECHNICAL SKILLS</div>
              ${skillsHtml}
            ` : ''}
            
            ${resume.interests.length > 0 ? `
              <div class="section-title">INTERESTS</div>
              ${interestsHtml}
            ` : ''}
          </div>
          
          <div class="main-content">
            ${workExperience.length > 0 ? `
              <div class="section-title">WORK EXPERIENCE</div>
              ${workExperienceHtml}
            ` : ''}
            
            ${education.length > 0 ? `
              <div class="section-title">EDUCATION</div>
              ${educationHtml}
            ` : ''}
            
            ${courses.length > 0 ? `
              <div class="section-title">COURSES & TRAININGS</div>
              ${coursesHtml}
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Try to generate PDF using the service
    try {
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
        console.log('PDF generated successfully via browser service');
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
            'Cache-Control': 'no-cache'
          }
        });
      } else {
        console.log('Browser service failed, falling back to HTML');
        throw new Error('Browser service failed');
      }
    } catch (serviceError) {
      console.log('Browser service error:', serviceError);
      console.log('Falling back to HTML response');
      
      // Fallback: return HTML with print instructions
      const htmlWithPrintInstructions = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${resume.title || 'Resume'}</title>
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

  } catch (error) {
    console.error('Simple PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate simple PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 