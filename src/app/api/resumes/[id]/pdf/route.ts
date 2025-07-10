import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import puppeteer from 'puppeteer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as Session;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumeId = parseInt(params.id);
    if (isNaN(resumeId)) {
      return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
      include: {
        strengths: true,
        workExperience: true,
        education: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Generate PDF using Puppeteer
    const pdfBuffer = await generatePDF(resume);

    // Return PDF content
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.title.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generatePDF(resume: unknown): Promise<Uint8Array> {
  const htmlContent = generatePDFHTML(resume);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function generatePDFHTML(resume: unknown): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStrengthColor = (rating: number) => {
    if (rating >= 8) return '#4caf50';
    if (rating >= 6) return '#ff9800';
    return '#f44336';
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${(resume as any).title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .contact-info {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .summary {
            font-size: 12px;
            color: #333;
            margin-bottom: 15px;
        }
        .experience-item, .education-item {
            margin-bottom: 15px;
        }
        .job-title, .degree {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
        }
        .company, .institution {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
        }
        .date-range {
            font-size: 11px;
            color: #888;
            margin-bottom: 5px;
        }
        .description {
            font-size: 11px;
            color: #333;
            margin-top: 5px;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
        }
        .skill {
            background-color: #f8f9fa;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            border: 1px solid #ddd;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${(resume as any).content.personalInfo.name || 'Your Name'}</div>
        <div class="contact-info">${(resume as any).content.personalInfo.email || 'email@example.com'}</div>
        <div class="contact-info">${(resume as any).content.personalInfo.phone || 'Phone Number'}</div>
        <div class="contact-info">${(resume as any).content.personalInfo.address || 'Address'}</div>
    </div>

    ${(resume as any).content.personalInfo.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">${(resume as any).content.personalInfo.summary}</div>
    </div>
    ` : ''}

    ${(resume as any).strengths.length > 0 ? `
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-container">
            ${(resume as any).strengths.map((strength: unknown) => `
                <span class="skill" style="border-color: ${getStrengthColor((strength as any).rating)}">
                    ${(strength as any).skillName} (${(strength as any).rating}/10)
                </span>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${(resume as any).workExperience.length > 0 ? `
    <div class="section">
        <div class="section-title">Work Experience</div>
        ${(resume as any).workExperience.map((exp: unknown) => `
            <div class="experience-item">
                <div class="job-title">${(exp as any).position}</div>
                <div class="company">${(exp as any).company}</div>
                <div class="date-range">
                    ${formatDate((exp as any).startDate)} - ${(exp as any).current ? 'Present' : formatDate((exp as any).endDate)}
                </div>
                ${(exp as any).description ? `<div class="description">${(exp as any).description}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${(resume as any).education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${(resume as any).education.map((edu: unknown) => `
            <div class="education-item">
                <div class="degree">${(edu as any).degree} in ${(edu as any).field}</div>
                <div class="institution">${(edu as any).institution}</div>
                <div class="date-range">
                    ${formatDate((edu as any).startDate)} - ${(edu as any).current ? 'Present' : formatDate((edu as any).endDate)}
                    ${(edu as any).gpa ? ` • GPA: ${(edu as any).gpa}` : ''}
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
  `;
} 