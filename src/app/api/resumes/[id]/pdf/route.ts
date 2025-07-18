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
    // Modern template styling
    const MASTER_COLOR = '#c8665b';
    
    // Header section
    pdf.setFillColor(parseInt(MASTER_COLOR.slice(1, 3), 16), parseInt(MASTER_COLOR.slice(3, 5), 16), parseInt(MASTER_COLOR.slice(5, 7), 16));
    
    // Name
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text(personalInfo.name, margin, yPosition + 30);
    yPosition += 50;
    
    // Job title
    if (data.jobTitle) {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.jobTitle, margin, yPosition);
      yPosition += 30;
    }
    
    // Contact info
    pdf.setFontSize(12);
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.city || personalInfo.state) contactInfo.push([personalInfo.city, personalInfo.state].filter(Boolean).join(', '));
    
    if (contactInfo.length > 0) {
      pdf.text(contactInfo.join(' • '), margin, yPosition);
      yPosition += 25;
    }
    
    // Links
    const links = [];
    if (personalInfo.website) links.push(formatUrl(personalInfo.website));
    if (personalInfo.linkedin) links.push(formatUrl(personalInfo.linkedin));
    if (personalInfo.github) links.push(formatUrl(personalInfo.github));
    
    if (links.length > 0) {
      pdf.setFontSize(10);
      pdf.text(links.join(' • '), margin, yPosition);
      yPosition += 20;
    }
    
    yPosition += 20;
    
    // Summary
    if (personalInfo.summary) {
      checkNewPage(50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROFESSIONAL SUMMARY', margin, yPosition);
      yPosition += 20;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const summaryHeight = addWrappedText(personalInfo.summary, margin, yPosition, contentWidth);
      yPosition += summaryHeight + 20;
    }
    
    // Work Experience
    if (data.workExperience && data.workExperience.length > 0) {
      checkNewPage(80);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('WORK EXPERIENCE', margin, yPosition);
      yPosition += 25;
      
      for (const work of data.workExperience) {
        checkNewPage(100);
        
        // Position and dates
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(work.position, margin, yPosition);
        
        const dateText = `${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('helvetica', 'normal');
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 20;
        
        // Company
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(work.company, margin, yPosition);
        yPosition += 18;
        
        // Bullet points
        if (work.bulletPoints && work.bulletPoints.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
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
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EDUCATION', margin, yPosition);
      yPosition += 25;
      
      for (const edu of data.education) {
        checkNewPage(60);
        
        // Degree
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(edu.degree, margin, yPosition);
        
        const dateText = `${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('helvetica', 'normal');
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 20;
        
        // Institution and field
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(edu.institution, margin, yPosition);
        yPosition += 18;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(edu.field, margin, yPosition);
        yPosition += 25;
      }
    }
    
    // Skills
    if (data.strengths && data.strengths.length > 0) {
      checkNewPage(80);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TECHNICAL SKILLS', margin, yPosition);
      yPosition += 25;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      for (const skill of data.strengths) {
        checkNewPage(20);
        pdf.text(`${skill.skillName}`, margin, yPosition);
        yPosition += 18;
      }
    }
    
  } else {
    // Classic template styling
    pdf.setFontSize(24);
    pdf.setFont('times', 'bold');
    pdf.text(personalInfo.name, pageWidth / 2, yPosition + 20, { align: 'center' });
    yPosition += 40;
    
    if (data.jobTitle) {
      pdf.setFontSize(16);
      pdf.setFont('times', 'italic');
      pdf.text(data.jobTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;
    }
    
    // Contact info
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal');
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.city || personalInfo.state) contactInfo.push([personalInfo.city, personalInfo.state].filter(Boolean).join(', '));
    
    if (contactInfo.length > 0) {
      pdf.text(contactInfo.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
    }
    
    yPosition += 20;
    
    // Summary
    if (personalInfo.summary) {
      checkNewPage(50);
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.text('PROFESSIONAL SUMMARY', margin, yPosition);
      yPosition += 20;
      
      pdf.setFontSize(12);
      pdf.setFont('times', 'normal');
      const summaryHeight = addWrappedText(personalInfo.summary, margin, yPosition, contentWidth);
      yPosition += summaryHeight + 20;
    }
    
    // Work Experience
    if (data.workExperience && data.workExperience.length > 0) {
      checkNewPage(80);
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.text('WORK EXPERIENCE', margin, yPosition);
      yPosition += 25;
      
      for (const work of data.workExperience) {
        checkNewPage(100);
        
        // Position
        pdf.setFontSize(12);
        pdf.setFont('times', 'bold');
        pdf.text(work.position, margin, yPosition);
        
        const dateText = `${formatDate(work.startDate)} - ${work.current ? 'Present' : formatDate(work.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('times', 'normal');
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 18;
        
        // Company
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.text(work.company, margin, yPosition);
        yPosition += 16;
        
        // Bullet points
        if (work.bulletPoints && work.bulletPoints.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont('times', 'normal');
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
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.text('EDUCATION', margin, yPosition);
      yPosition += 25;
      
      for (const edu of data.education) {
        checkNewPage(60);
        
        // Degree
        pdf.setFontSize(12);
        pdf.setFont('times', 'bold');
        pdf.text(edu.degree, margin, yPosition);
        
        const dateText = `${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}`;
        const dateWidth = pdf.getTextWidth(dateText);
        pdf.setFont('times', 'normal');
        pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);
        yPosition += 18;
        
        // Institution and field
        pdf.setFontSize(11);
        pdf.setFont('times', 'bold');
        pdf.text(edu.institution, margin, yPosition);
        yPosition += 16;
        
        pdf.setFont('times', 'normal');
        pdf.text(edu.field, margin, yPosition);
        yPosition += 25;
      }
    }
  }
  
  return new Uint8Array(pdf.output('arraybuffer'));
} 