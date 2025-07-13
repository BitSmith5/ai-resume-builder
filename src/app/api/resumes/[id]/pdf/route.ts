import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { renderResumeToHtml } from '../../../../../lib/renderResumeToHtml';
import puppeteer from 'puppeteer';
import type { Session } from 'next-auth';

// Transform database resume data to the format expected by renderResumeToHtml
function transformResumeData(resume: any) {
  // Ensure content exists and has the expected structure
  const content = resume.content || {};
  const personalInfo = content.personalInfo || {};
  
  return {
    title: resume.title,
    content: {
      personalInfo: {
        name: personalInfo.name || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        city: personalInfo.city || '',
        state: personalInfo.state || '',
        summary: personalInfo.summary || '',
        website: personalInfo.website || '',
        linkedin: personalInfo.linkedin || '',
        github: personalInfo.github || '',
      },
    },
    strengths: resume.strengths.map((strength: any) => ({
      skillName: strength.skillName,
      rating: strength.rating,
    })),
    workExperience: resume.workExperience.map((work: any) => ({
      company: work.company,
      position: work.position,
      startDate: work.startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      endDate: work.endDate ? work.endDate.toISOString().split('T')[0] : '',
      current: work.current,
      bulletPoints: Array.isArray(work.bulletPoints) 
        ? work.bulletPoints.map((bullet: any) => ({ description: bullet.description || bullet }))
        : [],
    })),
    education: resume.education.map((edu: any) => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      current: edu.current,
      gpa: edu.gpa,
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template') || 'modern';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch resume data from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
      include: {
        strengths: true,
        workExperience: true,
        education: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Transform the resume data to match the expected format
    const transformedResume = transformResumeData(resume);

    // Render HTML using the utility
    const html = renderResumeToHtml(transformedResume, template);

    // Generate PDF with puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=resume-${resolvedParams.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
} 