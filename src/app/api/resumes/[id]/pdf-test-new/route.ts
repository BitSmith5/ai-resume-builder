import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer-core';
import { renderResumeToHtml } from '@/lib/renderResumeToHtml';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('NEW PDF generation function started');
  
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

    console.log('Resume data for PDF generation:', {
      title: resumeData.title,
      jobTitle: resumeData.jobTitle,
      profilePicture: resumeData.profilePicture ? resumeData.profilePicture.substring(0, 50) + '...' : 'None',
      hasProfilePicture: !!resumeData.profilePicture,
      profilePictureType: resumeData.profilePicture ? (resumeData.profilePicture.startsWith('data:') ? 'data URL' : 'other') : 'none'
    });

    console.log('Using template for PDF generation:', template);
    console.log('About to render HTML...');
    const html = renderResumeToHtml(resumeData, template);
    console.log('HTML rendered successfully, length:', html.length);

    // Launch Puppeteer with serverless-compatible configuration
    console.log('Launching Puppeteer with serverless configuration...');
    
    let browser;
    let launchError;

    // Try to find Chrome in common serverless locations
    const chromePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/opt/google/chrome/chrome',
      '/usr/bin/chrome',
      '/usr/bin/chrome-browser',
      '/snap/bin/chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser-stable',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser-stable',
      '/usr/bin/chromium-stable',
      '/usr/bin/google-chrome-beta',
      '/usr/bin/chromium-browser-beta',
      '/usr/bin/google-chrome-dev',
      '/usr/bin/chromium-browser-dev',
      process.env.CHROME_BIN,
      process.env.CHROME_PATH,
      process.env.CHROMIUM_PATH,
    ].filter(Boolean);

    console.log('Available Chrome paths:', chromePaths);
    
    // Check what's actually available in the system
    try {
      const { execSync } = await import('child_process');
      console.log('Checking system for Chrome installations...');
      try {
        const whichChrome = execSync('which google-chrome', { encoding: 'utf8' }).trim();
        console.log('Found google-chrome at:', whichChrome);
      } catch {
        console.log('google-chrome not found in PATH');
      }
      try {
        const whichChromium = execSync('which chromium-browser', { encoding: 'utf8' }).trim();
        console.log('Found chromium-browser at:', whichChromium);
      } catch {
        console.log('chromium-browser not found in PATH');
      }
      try {
        const whichChromium2 = execSync('which chromium', { encoding: 'utf8' }).trim();
        console.log('Found chromium at:', whichChromium2);
      } catch {
        console.log('chromium not found in PATH');
      }
    } catch (error) {
      console.log('Could not check system for Chrome installations:', error);
    }

    // Try launching with different configurations
    for (const chromePath of chromePaths) {
      try {
        console.log(`Trying to launch Chrome from: ${chromePath}`);
        browser = await puppeteer.launch({
          headless: true,
          executablePath: chromePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
          ]
        });
        console.log('Puppeteer launched successfully with Chrome path:', chromePath);
        break;
      } catch (error) {
        console.log(`Failed to launch with Chrome path ${chromePath}:`, error instanceof Error ? error.message : 'Unknown error');
        launchError = error;
        continue;
      }
    }

    // If no Chrome found, try to install Chrome or use a different approach
    if (!browser) {
      try {
        console.log('Trying to install Chrome using apt-get...');
        const { execSync } = await import('child_process');
        
        try {
          // Try to install Chrome
          execSync('apt-get update && apt-get install -y google-chrome-stable', { 
            stdio: 'pipe',
            timeout: 30000 
          });
          console.log('Chrome installed successfully');
          
          // Try launching with the newly installed Chrome
          browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-extensions',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-features=TranslateUI',
              '--disable-ipc-flooding-protection',
            ]
          });
          console.log('Puppeteer launched successfully with newly installed Chrome');
        } catch (installError) {
          console.log('Failed to install Chrome:', installError instanceof Error ? installError.message : 'Unknown error');
          
          // Try launching without executablePath as last resort
          console.log('Trying to launch Puppeteer without executablePath...');
          browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-extensions',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-features=TranslateUI',
              '--disable-ipc-flooding-protection',
            ]
          });
          console.log('Puppeteer launched successfully without executablePath');
        }
      } catch (error) {
        console.error('Failed to launch Puppeteer:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error(`Failed to launch Puppeteer: ${launchError instanceof Error ? launchError.message : 'Unknown error'}`);
      }
    }

    console.log('Creating new page...');
    const page = await browser.newPage();
    console.log('Page created successfully');
    
    // Set viewport to match the template dimensions exactly
    const viewportWidth = template === 'classic' ? 850 : 850; // Both templates now use 850px
    const viewportHeight = template === 'classic' ? 1100 : 1100; // Both templates now use 1100px
    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 2
    });

    // Enable images and wait for them to load
    await page.setRequestInterception(false);
    
    // Set content and wait for images to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Additional wait to ensure images are loaded and fonts are rendered
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Debug: Check if profile picture is visible
    if (resumeData.profilePicture) {
      try {
        const profilePictureVisible = await page.evaluate(() => {
          const profileDiv = document.querySelector('div[style*="background-image"]');
          return profileDiv !== null;
        });
        console.log('Profile picture div found:', profilePictureVisible);
      } catch (error) {
        console.log('Error checking profile picture visibility:', error);
      }
    }

    // Generate PDF with proper page breaks - using Letter size to match template aspect ratio
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    await browser.close();

    // Return PDF with proper headers
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resume.title || 'resume'}-NEW.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('NEW PDF generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 