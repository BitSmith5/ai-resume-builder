import { NextResponse } from 'next/server';
import { renderResumeToHtml } from '@/lib/renderResumeToHtml';

export async function GET() {
  try {
    console.log('🎯 TEST PDF - Starting test PDF generation');
    
    // Create test resume data
    const testResumeData = {
      title: "Test Resume",
      jobTitle: "Software Engineer",
      content: {
        personalInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "(555) 123-4567",
          city: "San Francisco",
          state: "CA",
          summary: "Experienced software engineer with 5+ years of experience in web development.",
          website: "https://johndoe.com",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe"
        }
      },
      strengths: [
        { skillName: "JavaScript", rating: 9 },
        { skillName: "React", rating: 8 },
        { skillName: "Node.js", rating: 7 }
      ],
      workExperience: [
        {
          company: "Tech Corp",
          position: "Senior Developer",
          startDate: "2022-01-01",
          endDate: "",
          current: true,
          bulletPoints: [
            { description: "Led development of web applications" },
            { description: "Mentored junior developers" }
          ]
        }
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2018-09-01",
          endDate: "2022-05-01",
          current: false,
          gpa: 3.8
        }
      ],
      courses: [
        {
          title: "Advanced React",
          provider: "Udemy",
          link: "https://udemy.com/course/react"
        }
      ],
      interests: [
        { name: "Programming", icon: "💻" },
        { name: "Reading", icon: "📚" }
      ]
    };

    console.log('🎯 TEST PDF - Test data created');
    
    // Render HTML
    const template = 'modern';
    console.log('🎯 TEST PDF - Using template:', template);
    const renderedHtml = renderResumeToHtml(testResumeData, template);
    console.log('🎯 TEST PDF - HTML rendered, length:', renderedHtml.length);
    
    // Create HTML with auto-print
    const htmlWithAutoPrint = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test Resume</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .header-background {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .skill-bar-fill {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            div[style*="background: #c8665b"] {
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            div[style*="height: 2px"] {
              height: 2px !important;
              min-height: 2px !important;
              background-color: #c8665b !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              body { margin: 0; }
              .resume-page { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div style="position: fixed; top: 10px; right: 10px; background: #c8665b; color: white; padding: 10px; border-radius: 5px; font-size: 12px; z-index: 9999;">
            🎯 TEST PDF ROUTE<br>
            Template: ${template}<br>
            Auto-print in 2 seconds...
          </div>
          ${renderedHtml}
          <script>
            setTimeout(() => {
              window.print();
            }, 2000);
          </script>
        </body>
      </html>
    `;
    
    console.log('🎯 TEST PDF - Final HTML created, length:', htmlWithAutoPrint.length);
    
    // Return HTML
    const response = new NextResponse(htmlWithAutoPrint);
    response.headers.set('Content-Type', 'text/html');
    console.log('🎯 TEST PDF - Returning HTML with auto-print');
    return response;

  } catch (error) {
    console.error('🎯 TEST PDF - Error:', error);
    return NextResponse.json(
      { error: 'Test PDF generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 