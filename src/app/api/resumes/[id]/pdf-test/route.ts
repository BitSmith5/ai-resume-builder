import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Handle profile picture - support both data URLs and localStorage IDs
    let profilePictureUrl = resume.profilePicture;
    console.log('TEST ROUTE - Original profile picture:', profilePictureUrl ? profilePictureUrl.substring(0, 50) + '...' : 'None');
    
    if (profilePictureUrl) {
      if (profilePictureUrl.startsWith('data:')) {
        // Data URL - use as is (perfect for PDF generation)
        profilePictureUrl = profilePictureUrl;
        console.log('TEST ROUTE - Using data URL for PDF generation');
      } else if (profilePictureUrl.startsWith('http')) {
        // Absolute URL - use as is
        profilePictureUrl = profilePictureUrl;
        console.log('TEST ROUTE - Using absolute URL as is:', profilePictureUrl);
      } else if (profilePictureUrl.startsWith('profile_')) {
        // This is a localStorage image ID - we can't access localStorage from server
        console.log('TEST ROUTE - Profile picture stored in localStorage - skipping for PDF generation');
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
        
        console.log('TEST ROUTE - Converted legacy path to absolute URL:', profilePictureUrl);
      }
    } else {
      console.log('TEST ROUTE - No profile picture found');
    }

    // For now, just return the profile picture data to confirm it's working
    return NextResponse.json({
      success: true,
      message: 'Test route working - profile picture data confirmed',
      profilePicture: profilePictureUrl ? profilePictureUrl.substring(0, 100) + '...' : 'None',
      hasProfilePicture: !!profilePictureUrl,
      profilePictureType: profilePictureUrl ? (profilePictureUrl.startsWith('data:') ? 'data URL' : 'other') : 'none'
    });

  } catch (error) {
    console.error('TEST ROUTE - Error:', error);
    return NextResponse.json(
      { error: 'Test route failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 