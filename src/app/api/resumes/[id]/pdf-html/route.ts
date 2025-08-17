import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { transformResumeData } from '../../../../../lib/resumeDataTransformer';
import puppeteer from 'puppeteer';



export const runtime = 'nodejs';

// Import the unified PDF generation logic
import { generatePdfHtml, ExportSettings as PdfExportSettings } from '../../../../../lib/pdfGenerator';

console.log('🎯 PDF-HTML ROUTE LOADED');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎯 HTML PDF - Starting HTML generation');
  console.log('🎯 HTML PDF - Request URL:', request.url);
  console.log('🎯 HTML PDF - Request method:', request.method);
  
  try {
    const { id } = await params;
    console.log('🎯 HTML PDF - Resume ID:', id);
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('🎯 HTML PDF - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎯 HTML PDF - User authorized:', session.user.email);
    
    // Get export settings from request body
    const body = await request.json();
    const exportSettings: PdfExportSettings = body.exportSettings;
    const { generatePdf = false } = body;

    console.log('🎯 HTML PDF - Export settings:', exportSettings);
    
    console.log('🎯 HTML PDF - Fetching resume data...');
    
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
      console.log('🎯 HTML PDF - Resume not found');
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    console.log('🎯 HTML PDF - Resume found:', resume.title);
    
    // Use shared data transformer for consistency
    const resumeData = transformResumeData(resume, 'iso');

    console.log('🎯 HTML PDF - Resume data prepared');
    console.log('🎯 HTML PDF - Strengths count:', resumeData.strengths.length);
    console.log('🎯 HTML PDF - Skill categories count:', resumeData.skillCategories.length);
    console.log('🎯 HTML PDF - Skill categories:', resumeData.skillCategories);
    
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

    console.log('🎯 HTML PDF - Section order:', sectionOrder);
    console.log('🎯 HTML PDF - Deleted sections:', deletedSections);
    console.log('🎯 HTML PDF - Active sections:', activeSections);
    console.log('🎯 HTML PDF - Work Experience in activeSections:', activeSections.includes('Work Experience'));
    console.log('🎯 HTML PDF - resumeData.workExperience:', resumeData.workExperience);
    console.log('🎯 HTML PDF - Work Experience count:', resumeData.workExperience?.length);
    
    // Use the same rendering logic as the PDF route
    const template = exportSettings.template === 'standard' ? 'classic' : 'modern';
    console.log('🎯 HTML PDF - Using template:', template);
    
         // Generate HTML using the unified PDF generator - SAME CODE FOR BOTH
     const html = generatePdfHtml(resumeData, activeSections, exportSettings);
     console.log('🎯 HTML PDF - HTML rendered successfully, length:', html.length);
 
          console.log('🎯 HTML PDF - HTML generated successfully');

     // Check if we should generate PDF or return HTML
     
     if (generatePdf) {
       console.log('🎯 HTML PDF - Generating PDF from HTML...');
       
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
         
         console.log('🎯 HTML PDF - PDF generated successfully');
         
         // Return PDF with proper headers
         return new NextResponse(pdf, {
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