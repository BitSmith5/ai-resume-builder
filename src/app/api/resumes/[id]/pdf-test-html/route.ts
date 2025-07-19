import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('HTML PDF generation function started');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const template = request.nextUrl.searchParams.get('template') || 'modern';

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

    const resumeData = {
      title: resume.title,
      jobTitle: resume.jobTitle || undefined,
      profilePicture: profilePictureUrl || undefined,
      content: {
        personalInfo: {
          name: resume.user.name || '',
          email: resume.user.email || '',
          phone: resume.user.phone || '',
          city: resume.user.location || '',
          state: '',
          summary: '',
          website: resume.user.portfolioUrl || '',
          linkedin: resume.user.linkedinUrl || '',
          github: '',
        },
      },
      strengths: resume.strengths,
      workExperience,
      education,
      courses,
      interests: resume.interests,
    };

    console.log('Resume data for HTML generation:', {
      title: resumeData.title,
      jobTitle: resumeData.jobTitle,
      profilePicture: resumeData.profilePicture ? resumeData.profilePicture.substring(0, 50) + '...' : 'None',
      hasProfilePicture: !!resumeData.profilePicture,
      profilePictureType: resumeData.profilePicture ? (resumeData.profilePicture.startsWith('data:') ? 'data URL' : 'other') : 'none'
    });

    console.log('Using template for HTML generation:', template);

    // Generate HTML content using the exact same styling as the original PDF route
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

    const ensureUrlProtocol = (url: string): string => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `https://${url}`;
    };

    const calculateUnderlineWidth = (jobTitle: string): number => {
      const charWidth = 8.5;
      const baseWidth = jobTitle.length * charWidth;
      const calculatedWidth = baseWidth + 20;
      return Math.min(calculatedWidth, 300);
    };

    // Contact info for left sidebar
    const contactInfo = [
      resumeData.content.personalInfo.email && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📧</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${resumeData.content.personalInfo.email}</div></div>`,
      resumeData.content.personalInfo.phone && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📞</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${resumeData.content.personalInfo.phone}</div></div>`,
      (resumeData.content.personalInfo.city || resumeData.content.personalInfo.state) && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">📍</div><div style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${[resumeData.content.personalInfo.city, resumeData.content.personalInfo.state].filter(Boolean).join(', ')}</div></div>`,
      resumeData.content.personalInfo.website && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">🌐</div><a href="${resumeData.content.personalInfo.website}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(resumeData.content.personalInfo.website)}</a></div>`,
      resumeData.content.personalInfo.linkedin && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">💼</div><a href="${ensureUrlProtocol(resumeData.content.personalInfo.linkedin)}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(resumeData.content.personalInfo.linkedin)}</a></div>`,
      resumeData.content.personalInfo.github && `<div style="display: flex; flex-direction: column; align-items: flex-start; font-size: clamp(10px, 1.5vw, 12px); margin-bottom: 12px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;"><div style="color: #c8665b; margin-bottom: 2px; font-size: 14px;">💻</div><a href="${resumeData.content.personalInfo.github}" target="_blank" rel="noopener noreferrer" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; text-decoration: underline;">${formatUrl(resumeData.content.personalInfo.github)}</a></div>`
    ].filter(Boolean).join('');

    // Header section
    const headerHtml = `
      <div style="margin-bottom: 16px; background: #c8665b; padding: 12px; border-radius: 0;">
        <div style="
          font-size: 30px; 
          font-weight: 500; 
          color: white; 
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1;
          margin-bottom: 4px;
        ">${resumeData.content.personalInfo.name}</div>
        ${resumeData.jobTitle ? `
          <div style="
            font-size: 16px; 
            font-weight: 500; 
            color: white;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            line-height: 1.2;
          ">${resumeData.jobTitle}</div>
          <div style="
            width: ${calculateUnderlineWidth(resumeData.jobTitle)}px; 
            height: 1px; 
            background: white; 
            margin: 6px 0 12px 0;
          "></div>
        ` : ''}
        <div style="
          font-size: 12px; 
          color: white;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          line-height: 1;
          margin-right: 14px;
        ">${resumeData.content.personalInfo.summary}</div>
      </div>
    `;

    // Work experience HTML
    const workExperienceHtml = resumeData.workExperience.map((work) => {
      const dateRange = work.current 
        ? `${formatDate(work.startDate)} - PRESENT`
        : `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`;
      
      const bulletPoints = work.bulletPoints.map((bullet) => 
        `<div style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><div style="width: 5px; height: 5px; border: 1px solid #c8665b; background: transparent; margin-right: 8px; flex-shrink: 0; margin-top: 6px; border-radius: 0;"></div><div style="flex: 1; font-size: 12px; line-height: 1.4; text-align: justify;">${bullet.description}</div></div>`
      ).join('');

      return `
        <div class="work-experience-item" style="margin-bottom: 12px; margin-left: 20px;">
          <div style="font-weight: 700; font-size: 16px; color: #c8665b; margin-bottom: 8px;">${work.position}</div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${work.company}</div>
          <div style="font-size: 10px; color: #c8665b; font-style: italic; margin-bottom: 8px;">${dateRange}</div>
          ${bulletPoints ? `<div style="font-size: 12px; line-height: 1.4;">${bulletPoints}</div>` : ''}
        </div>
      `;
    }).join('');

    // Education HTML
    const educationHtml = resumeData.education.map((edu) => {
      const dateRange = edu.current 
        ? `${formatDate(edu.startDate)} - PRESENT`
        : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
      
      return `
        <div style="margin-bottom: 12px; margin-left: 20px;">
          <div style="font-weight: 600; font-size: 16px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; color: #c8665b; line-height: 1; margin-bottom: 4px;">${edu.degree} in ${edu.field}</div>
          <div style="font-size: 14px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 0.7; margin-bottom: 7px;">${edu.institution}</div>
          <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
            <div style="font-size: 10px; color: #c8665b; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; font-style: italic;">${dateRange}</div>
            ${edu.gpa ? `<div style="font-size: 10px; color: #c8665b; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; font-style: italic;">GPA: ${edu.gpa}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Courses HTML
    const coursesHtml = resumeData.courses && resumeData.courses.length > 0 ? resumeData.courses.map((course) => 
      `<div style="margin-bottom: 8px; margin-left: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
          <div style="font-size: 14px; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.3; flex: 1;">${course.title}</div>
          ${course.link ? `<a href="${course.link}" target="_blank" rel="noopener noreferrer" style="color: #c8665b; display: flex; align-items: center; text-decoration: none;">🔗</a>` : ''}
        </div>
        <div style="font-size: 10px; color: #888; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2; font-style: italic;">${course.provider}</div>
      </div>`
    ).join('') : '';

    const html = `
    <div class="resume-page" style="
      display: flex;
      font-family: sans-serif;
      background: #fff;
      color: #333;
      width: 850px;
      height: 1100px;
      position: relative;
      margin: 0 auto;
      flex-shrink: 0;
    ">
      <div class="left-column" style="
        width: 221px;
        padding: 24px 24px 90px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        min-height: 100%;
        box-sizing: border-box;
        overflow: hidden;
      ">
        ${resumeData.profilePicture && resumeData.profilePicture.trim() !== '' && resumeData.profilePicture.startsWith('data:') ? `<div style="width: 160px; height: 160px; border-radius: 10%; margin-bottom: 20px; overflow: hidden; flex-shrink: 0;"><img src="${resumeData.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10%; display: block;" onerror="this.parentElement.style.display='none';" /></div>` : ''}
        <div style="width: 160px; margin-bottom: 24px;">${contactInfo}</div>
        ${resumeData.strengths && resumeData.strengths.length > 0 ? `
        <div style="width: 100%; max-width: 180px; margin-bottom: 32px;">
          <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 16;">
            <div style="font-weight: 700; font-size: 16px; color: #c8665b; text-align: left;">TECHNICAL SKILLS</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 2px 0 0 0;"></div>
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 10;">
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
              <div style="width: 2; height: 5; background: #c8665b; border-radius: 0;"></div>
            </div>
          </div>
          ${resumeData.strengths.map((skill) => 
            `<div class="skill-item" style="margin-bottom: 12px; font-size: 12px;">
              <div style="margin-bottom: 4px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; line-height: 1.2;">${skill.skillName}</div>
              <div style="width: 100%; height: 10px; background: transparent; border: 2px solid #c8665b; overflow: hidden;">
                <div style="width: ${(skill.rating / 10) * 100}%; height: 100%; background: #c8665b; padding: 1px;"></div>
              </div>
            </div>`
          ).join('')}
        </div>
        ` : ''}
        ${resumeData.interests && resumeData.interests.length > 0 ? `
        <div style="width: 100%; max-width: 180px; justify-content: flex-start;">
          <div style="font-weight: 700; font-size: 16px; color: #c8665b; text-align: left;">INTERESTS</div>
          <div style="width: 100%; height: 2; background: #c8665b; margin: 2px 0 12px 0;"></div>
          ${resumeData.interests.map((interest) => 
            `<div style="margin-bottom: 8px; font-size: 12px;">${interest.icon} ${interest.name}</div>`
          ).join('')}
        </div>
        ` : ''}
      </div>
      <div class="right-column" style="
        width: 629px;
        margin: 24px 24px 90px 0;
        box-sizing: border-box;
      ">
        ${resumeData.jobTitle ? headerHtml : ''}
        ${resumeData.workExperience.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 4; margin-left: 20px;">WORK EXPERIENCE</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${workExperienceHtml}
          </div>
        ` : ''}
        ${resumeData.courses && resumeData.courses.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">COURSES & TRAININGS</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${coursesHtml}
          </div>
        ` : ''}
        ${resumeData.education.length > 0 ? `
          <div style="margin-bottom: clamp(16px, 3vw, 32px);">
            <div style="font-weight: 700; font-size: clamp(14px, 2.2vw, 18px); color: #c8665b; margin-bottom: 8; margin-left: 20px;">EDUCATION</div>
            <div style="width: 100%; height: 2; background: #c8665b; margin: 4px 0 12px 0;"></div>
            ${educationHtml}
          </div>
        ` : ''}
      </div>
    </div>`;

    console.log('HTML generated successfully, length:', html.length);

    // Return the HTML content
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('HTML generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 