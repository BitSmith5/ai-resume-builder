import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { transformResumeData } from '../../../../../services';
import puppeteer from 'puppeteer';



export const runtime = 'nodejs';

// Import the unified PDF generation logic
import { generatePdfHtml, ExportSettings as PdfExportSettings } from '../../../../../services';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get export settings from request body
    const body = await request.json();
    const exportSettings: PdfExportSettings = body.exportSettings;
    const { generatePdf = false } = body;
    
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
        projects: true,
        languages: true,
        publications: true,
        awards: true,
        volunteerExperience: true,
        references: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Use shared data transformer for consistency
    const resumeData = transformResumeData(resume, 'iso');
    
    // Get section order and filter deleted sections (same logic as PDF)
    const sectionOrder = (resume.sectionOrder as string[]) || [
      'Professional Summary',
      'Work Experience',
      'Projects',
      'Education',
      'Technical Skills',
      'Courses',
      'Interests',
      'Languages',
      'Publications',
      'Awards',
      'Volunteer Experience',
      'References'
    ];

    const deletedSections = (resume.deletedSections as string[]) || [];
    const activeSections = sectionOrder.filter(section => !deletedSections.includes(section));
    
    // Use the same rendering logic as the PDF route
    const template = exportSettings.template === 'standard' ? 'classic' : 'modern';
    
         // Generate HTML using the unified PDF generator - SAME CODE FOR BOTH
     const html = generatePdfHtml(resumeData, activeSections, exportSettings);

     // Check if we should generate PDF or return HTML
     
     if (generatePdf) {
       
       try {
         // Launch Puppeteer with basic configuration (this was working before)
         const browser = await puppeteer.launch({
           headless: true,
           args: ['--no-sandbox', '--disable-setuid-sandbox']
         });
         
         const page = await browser.newPage();
         
         // Set content and wait for it to load
         await page.setContent(html, { waitUntil: 'networkidle0' });
         
         // Generate PDF with basic settings (this was working before)
         const pdf = await page.pdf({
           format: 'letter',
           printBackground: true
         });
         
         await browser.close();
         
         // Return PDF with proper headers
         return new NextResponse(pdf as any, {
           headers: {
             'Content-Type': 'application/pdf',
             'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
             'Cache-Control': 'no-cache'
           }
         });
         
               } catch (pdfError) {
          console.error('🎯 HTML PDF - PDF generation error:', pdfError);
          return NextResponse.json(
            { error: 'Failed to generate PDF', details: pdfError instanceof Error ? pdfError.message : 'Unknown error' },
            { status: 500 }
          );
        }
     } else {
       // Return HTML for preview
       return new NextResponse(html, {
         headers: {
           'Content-Type': 'text/html',
           'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.html"`,
           'Cache-Control': 'no-cache'
         }
       });
     }

  } catch (error) {
    console.error('🎯 HTML PDF - Error:', error);
    console.error('🎯 HTML PDF - Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json(
      { 
        error: 'Failed to generate HTML', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
} 