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

    // Generate HTML content
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 40px;
        }
        
        .resume-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 40px;
        }
        
        .left-column {
            width: 30%;
        }
        
        .right-column {
            width: 70%;
        }
        
        .profile-picture {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 16px;
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 8px;
        }
        
        .name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #007bff;
        }
        
        .job-title {
            font-size: 20px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .skill-item {
            margin-bottom: 10px;
        }
        
        .skill-name {
            font-size: 14px;
            font-weight: bold;
        }
        
        .skill-rating {
            font-size: 12px;
            color: #666;
        }
        
        .work-item, .education-item, .course-item {
            margin-bottom: 24px;
        }
        
        .work-position, .education-institution, .course-title {
            font-size: 16px;
            font-weight: bold;
            color: #007bff;
        }
        
        .work-company, .education-degree, .course-provider {
            font-size: 14px;
            color: #666;
        }
        
        .work-dates, .education-dates {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
        }
        
        .bullet-points {
            margin-top: 8px;
        }
        
        .bullet-point {
            font-size: 12px;
            margin-bottom: 4px;
            padding-left: 16px;
            position: relative;
        }
        
        .bullet-point:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #007bff;
        }
        
        .interest-item {
            font-size: 12px;
            margin-bottom: 6px;
            padding-left: 16px;
            position: relative;
        }
        
        .interest-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #007bff;
        }
        
        @media print {
            body {
                padding: 0;
            }
            .resume-container {
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="left-column">
            ${resumeData.profilePicture ? `<img src="${resumeData.profilePicture}" alt="Profile" class="profile-picture">` : ''}
            
            ${resumeData.strengths.length > 0 ? `
            <div class="section">
                <h2 class="section-title">SKILLS</h2>
                ${resumeData.strengths.map(skill => `
                    <div class="skill-item">
                        <div class="skill-name">${skill.skillName}</div>
                        <div class="skill-rating">Rating: ${skill.rating}/5</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.interests.length > 0 ? `
            <div class="section">
                <h2 class="section-title">INTERESTS</h2>
                ${resumeData.interests.map(interest => `
                    <div class="interest-item">${interest.name}</div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        
        <div class="right-column">
            <div class="section">
                <h1 class="name">${resumeData.title}</h1>
                ${resumeData.jobTitle ? `<h2 class="job-title">${resumeData.jobTitle}</h2>` : ''}
            </div>
            
            ${resumeData.workExperience.length > 0 ? `
            <div class="section">
                <h2 class="section-title">WORK EXPERIENCE</h2>
                ${resumeData.workExperience.map(work => `
                    <div class="work-item">
                        <div class="work-position">${work.position}</div>
                        <div class="work-company">${work.company}</div>
                        <div class="work-dates">${work.startDate} - ${work.current ? 'Present' : work.endDate}</div>
                        ${work.bulletPoints && work.bulletPoints.length > 0 ? `
                            <div class="bullet-points">
                                ${work.bulletPoints.map(point => `
                                    <div class="bullet-point">${point.description}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.education.length > 0 ? `
            <div class="section">
                <h2 class="section-title">EDUCATION</h2>
                ${resumeData.education.map(edu => `
                    <div class="education-item">
                        <div class="education-institution">${edu.institution}</div>
                        <div class="education-degree">${edu.degree} in ${edu.field}${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}</div>
                        <div class="education-dates">${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.courses.length > 0 ? `
            <div class="section">
                <h2 class="section-title">COURSES & TRAININGS</h2>
                ${resumeData.courses.map(course => `
                    <div class="course-item">
                        <div class="course-title">${course.title}</div>
                        <div class="course-provider">${course.provider}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;

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