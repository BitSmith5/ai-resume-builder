import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('PDF REDIRECT function started');
  
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const templateParam = searchParams.get('template');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Redirect to a dedicated HTML page - use relative URL to work in both local and production
    const redirectUrl = `/dashboard/resumes/${id}/pdf-view?template=${templateParam || 'modern'}`;
    console.log('Redirecting to:', redirectUrl);
    
    // Use relative redirect to work in both local and production environments
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('PDF REDIRECT error:', error);
    return NextResponse.json(
      { error: 'Failed to redirect to PDF view' },
      { status: 500 }
    );
  }
} 