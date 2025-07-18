import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';

interface ResumeWithTemplate {
  template?: string;
  jobTitle?: string;
}

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

    // Handle profile picture URL - now using localStorage with image IDs
    let profilePictureUrl = resume.profilePicture;
    console.log('Original profile picture URL:', profilePictureUrl ? profilePictureUrl.substring(0, 50) + '...' : 'None');
    
    if (profilePictureUrl) {
      if (profilePictureUrl.startsWith('data:')) {
        // Data URL - use as is (for backward compatibility)
        profilePictureUrl = profilePictureUrl;
        console.log('Using data URL as is:', profilePictureUrl.substring(0, 50) + '...');
      } else if (profilePictureUrl.startsWith('https://') && profilePictureUrl.includes('blob.vercel-storage.com')) {
        // Vercel Blob URL - use as is (for backward compatibility)
        profilePictureUrl = profilePictureUrl;
        console.log('Using Vercel Blob URL as is:', profilePictureUrl);
      } else if (profilePictureUrl.startsWith('http')) {
        // Other absolute URL - use as is
        profilePictureUrl = profilePictureUrl;
        console.log('Using absolute URL as is:', profilePictureUrl);
      } else if (profilePictureUrl.startsWith('profile_')) {
        // This is a localStorage image ID - we can't access localStorage from server
        // For PDF generation, we'll skip the profile picture
        console.log('Profile picture stored in localStorage - skipping for PDF generation');
        profilePictureUrl = "";
      } else {
        // Legacy relative path - convert to absolute URL (for backward compatibility)
        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        
        // Check if the path already includes the uploads directory
        if (profilePictureUrl.startsWith('/uploads/')) {
          profilePictureUrl = `${baseUrl}${profilePictureUrl}`;
        } else {
          profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${profilePictureUrl}`;
        }
        
        console.log('Converted legacy path to absolute URL:', profilePictureUrl);
      }
    } else {
      console.log('No profile picture URL found');
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
      profilePicture: resumeData.profilePicture,
      hasProfilePicture: !!resumeData.profilePicture
    });

    // Use jsPDF for PDF generation
    const template = templateParam || (resume as ResumeWithTemplate).template || 'modern';
    console.log('Using template for PDF generation:', template);
    
    const pdf = generatePDFWithJsPDF(resumeData, template);

    // Return PDF with proper headers
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate PDF: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function generatePDFWithJsPDF(data: {
  title: string;
  jobTitle?: string;
  profilePicture?: string;
  content: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      city: string;
      state: string;
      summary: string;
      website?: string;
      linkedin?: string;
      github?: string;
    };
  };
  strengths: Array<{
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{
      description: string;
    }>;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>;
  courses: Array<{
    title: string;
    provider: string;
    link?: string;
  }>;
  interests: Array<{
    name: string;
    icon: string;
  }>;
}, template: string): Uint8Array {
  const { personalInfo } = data.content;
  
  // Create PDF document
  const pdf = new jsPDF('p', 'pt', 'letter');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  
  // Helper function to format dates
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
  
  // Helper function to format URLs
  const formatUrl = (url: string): string => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * fontSize * 0.4; // Return height used
  };
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  if (template === 'modern') {
    // Modern template styling - match the React component closely
    const MASTER_COLOR = '#c8665b';
    const masterColorRGB = [200, 102, 91]; // RGB values for #c8665b
    
    // Set up two-column layout
    const leftColumnWidth = 221; // Match React component
    const rightColumnWidth = pageWidth - leftColumnWidth - (margin * 2);
    const rightColumnX = margin + leftColumnWidth;
    
    // Left column content (skills and interests)
    let leftColumnY = margin;
    
    // Skills section
    if (data.strengths && data.strengths.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.text('TECHNICAL SKILLS', margin, leftColumnY);
      leftColumnY += 25;
      
      // Add decorative line
      pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.setLineWidth(2);
      pdf.line(margin, leftColumnY, margin + 180, leftColumnY);
      leftColumnY += 15;
      
      // Add decorative dots
      for (let i = 0; i < 4; i++) {
        pdf.setFillColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        pdf.rect(margin + (i * 45), leftColumnY, 2, 5, 'F');
      }
      leftColumnY += 20;
      
      // Skills list
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      for (const skill of data.strengths) {
        checkNewPage(20);
        pdf.text(skill.skillName, margin, leftColumnY);
        leftColumnY += 18;
        
        // Skill rating bar
        pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        pdf.setLineWidth(2);
        pdf.rect(margin, leftColumnY, 180, 10, 'S'); // Border
        pdf.setFillColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        const barWidth = (skill.rating / 10) * 180;
        pdf.rect(margin, leftColumnY, barWidth, 10, 'F'); // Fill
        leftColumnY += 20;
      }
    }
    
    // Interests section
    if (data.interests && data.interests.length > 0) {
      leftColumnY += 20;
      checkNewPage(50);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.text('INTERESTS', margin, leftColumnY);
      leftColumnY += 25;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      for (const interest of data.interests) {
        checkNewPage(20);
        pdf.text(`${interest.icon} ${interest.name}`, margin, leftColumnY);
        leftColumnY += 18;
      }
    }
    
    // Right column content
    let rightColumnY = margin;
    
    // Header section (only on first page if job title exists)
    if (data.jobTitle) {
      // Colored header background
      pdf.setFillColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.rect(rightColumnX, rightColumnY, rightColumnWidth, 80, 'F');
      
      // Name in header
      pdf.setFontSize(30);
      pdf.setFont('helvetica', 'medium');
      pdf.setTextColor(255, 255, 255);
      pdf.text(personalInfo.name, rightColumnX + 12, rightColumnY + 25);
      
      // Job title in header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'medium');
      pdf.text(data.jobTitle, rightColumnX + 12, rightColumnY + 45);
      
      // White underline
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(1);
      const titleWidth = pdf.getTextWidth(data.jobTitle);
      pdf.line(rightColumnX + 12, rightColumnY + 50, rightColumnX + 12 + titleWidth + 20, rightColumnY + 50);
      
      // Summary in header
      if (personalInfo.summary) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(personalInfo.summary, rightColumnWidth - 24);
        pdf.text(summaryLines, rightColumnX + 12, rightColumnY + 65);
        rightColumnY += summaryLines.length * 15 + 20;
      } else {
        rightColumnY += 80;
      }
    }
    
    // Work Experience
    if (data.workExperience && data.workExperience.length > 0) {
      checkNewPage(100);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.text('WORK EXPERIENCE', rightColumnX + 20, rightColumnY);
      rightColumnY += 25;
      
      // Section underline
      pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.setLineWidth(2);
      pdf.line(rightColumnX + 20, rightColumnY, rightColumnX + rightColumnWidth - 20, rightColumnY);
      rightColumnY += 20;
      
      for (const work of data.workExperience) {
        checkNewPage(120);
        
        // Position
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        pdf.text(work.position, rightColumnX + 20, rightColumnY);
        rightColumnY += 20;
        
        // Company
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'semibold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(work.company, rightColumnX + 20, rightColumnY);
        rightColumnY += 18;
        
        // Dates and location
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        const dateText = `${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}`;
        pdf.text(dateText, rightColumnX + 20, rightColumnY);
        rightColumnY += 15;
        
        // Bullet points
        if (work.bulletPoints && work.bulletPoints.length > 0) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          for (const bullet of work.bulletPoints) {
            checkNewPage(20);
            
            // Custom bullet point (colored square)
            pdf.setFillColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
            pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
            pdf.rect(rightColumnX + 20, rightColumnY - 3, 5, 5, 'S');
            
            // Bullet text
            const bulletText = `  ${bullet.description}`;
            const bulletHeight = addWrappedText(bulletText, rightColumnX + 30, rightColumnY, rightColumnWidth - 50);
            rightColumnY += bulletHeight + 5;
          }
        }
        
        rightColumnY += 15;
      }
    }
    
    // Education
    if (data.education && data.education.length > 0) {
      checkNewPage(100);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.text('EDUCATION', rightColumnX + 20, rightColumnY);
      rightColumnY += 25;
      
      // Section underline
      pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.setLineWidth(2);
      pdf.line(rightColumnX + 20, rightColumnY, rightColumnX + rightColumnWidth - 20, rightColumnY);
      rightColumnY += 20;
      
      for (const edu of data.education) {
        checkNewPage(80);
        
        // Degree
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
        pdf.text(edu.degree, rightColumnX + 20, rightColumnY);
        
        // Dates
        const dateText = `${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('helvetica', 'normal');
        pdf.text(dateText, rightColumnX + rightColumnWidth - dateWidth - 20, rightColumnY);
        rightColumnY += 20;
        
        // Institution
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'semibold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(edu.institution, rightColumnX + 20, rightColumnY);
        rightColumnY += 18;
        
        // Field
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(edu.field, rightColumnX + 20, rightColumnY);
        rightColumnY += 25;
      }
    }
    
    // Courses
    if (data.courses && data.courses.length > 0) {
      checkNewPage(100);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.text('COURSES & TRAININGS', rightColumnX + 20, rightColumnY);
      rightColumnY += 25;
      
      // Section underline
      pdf.setDrawColor(masterColorRGB[0], masterColorRGB[1], masterColorRGB[2]);
      pdf.setLineWidth(2);
      pdf.line(rightColumnX + 20, rightColumnY, rightColumnX + rightColumnWidth - 20, rightColumnY);
      rightColumnY += 20;
      
      for (const course of data.courses) {
        checkNewPage(40);
        
        // Course title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'semibold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(course.title, rightColumnX + 20, rightColumnY);
        rightColumnY += 18;
        
        // Provider
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(course.provider, rightColumnX + 20, rightColumnY);
        rightColumnY += 20;
      }
    }
    
  } else {
    // Classic template styling - match the React component closely
    pdf.setFont('times', 'normal');
    
    // Header section (centered)
    const headerY = margin + 20;
    
    // Name
    pdf.setFontSize(32);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(0, 0, 0);
    const nameWidth = pdf.getTextWidth(personalInfo.name);
    pdf.text(personalInfo.name, (pageWidth - nameWidth) / 2, headerY);
    
    // Job title
    if (data.jobTitle) {
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(51, 51, 51);
      const jobTitleWidth = pdf.getTextWidth(data.jobTitle);
      pdf.text(data.jobTitle, (pageWidth - jobTitleWidth) / 2, headerY + 35);
    }
    
    // Contact info
    pdf.setFontSize(14);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(51, 51, 51);
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.city || personalInfo.state) contactInfo.push([personalInfo.city, personalInfo.state].filter(Boolean).join(', '));
    
    if (contactInfo.length > 0) {
      const contactText = contactInfo.join(' | ');
      const contactWidth = pdf.getTextWidth(contactText);
      pdf.text(contactText, (pageWidth - contactWidth) / 2, headerY + 55);
    }
    
    // Links
    const links = [];
    if (personalInfo.website) links.push(formatUrl(personalInfo.website));
    if (personalInfo.linkedin) links.push(formatUrl(personalInfo.linkedin));
    if (personalInfo.github) links.push(formatUrl(personalInfo.github));
    
    if (links.length > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(102, 102, 102);
      const linksText = links.join(' | ');
      const linksWidth = pdf.getTextWidth(linksText);
      pdf.text(linksText, (pageWidth - linksWidth) / 2, headerY + 75);
    }
    
    // Bottom border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(2);
    pdf.line(margin, headerY + 90, pageWidth - margin, headerY + 90);
    
    yPosition = headerY + 115;
    
    // Summary
    if (personalInfo.summary) {
      checkNewPage(60);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('PROFESSIONAL SUMMARY', margin, yPosition);
      yPosition += 25;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      // Summary text
      pdf.setFontSize(14);
      pdf.setFont('times', 'normal');
      const summaryHeight = addWrappedText(personalInfo.summary, margin, yPosition, contentWidth);
      yPosition += summaryHeight + 20;
    }
    
    // Work Experience
    if (data.workExperience && data.workExperience.length > 0) {
      checkNewPage(80);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('WORK EXPERIENCE', margin, yPosition);
      yPosition += 25;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      for (const work of data.workExperience) {
        checkNewPage(100);
        
        // Position and dates
        pdf.setFontSize(16);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(work.position, margin, yPosition);
        
        const dateText = `${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(102, 102, 102);
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 20;
        
        // Company
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(51, 51, 51);
        pdf.text(work.company, margin, yPosition);
        yPosition += 18;
        
        // Bullet points
        if (work.bulletPoints && work.bulletPoints.length > 0) {
          pdf.setFontSize(13);
          pdf.setFont('times', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          for (const bullet of work.bulletPoints) {
            checkNewPage(20);
            const bulletText = `• ${bullet.description}`;
            const bulletHeight = addWrappedText(bulletText, margin + 10, yPosition, contentWidth - 10);
            yPosition += bulletHeight + 5;
          }
        }
        
        yPosition += 15;
      }
    }
    
    // Education
    if (data.education && data.education.length > 0) {
      checkNewPage(80);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('EDUCATION', margin, yPosition);
      yPosition += 25;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      for (const edu of data.education) {
        checkNewPage(80);
        
        // Degree and dates
        pdf.setFontSize(16);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(edu.degree, margin, yPosition);
        
        const dateText = `${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(102, 102, 102);
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 20;
        
        // Institution
        pdf.setFontSize(14);
        pdf.setFont('times', 'bold');
        pdf.setTextColor(51, 51, 51);
        pdf.text(edu.institution, margin, yPosition);
        yPosition += 18;
        
        // Field
        pdf.setFontSize(12);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(edu.field, margin, yPosition);
        yPosition += 25;
      }
    }
    
    // Skills
    if (data.strengths && data.strengths.length > 0) {
      checkNewPage(80);
      
      // Section header
      pdf.setFontSize(18);
      pdf.setFont('times', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('TECHNICAL SKILLS', margin, yPosition);
      yPosition += 25;
      
      // Section underline
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('times', 'normal');
      for (const skill of data.strengths) {
        checkNewPage(20);
        pdf.text(skill.skillName, margin, yPosition);
        yPosition += 18;
      }
    }
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
} 