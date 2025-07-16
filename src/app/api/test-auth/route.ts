import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    // Test the authorize function directly
    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials') as any;
    const authorizeResult = credentialsProvider?.authorize?.({ username, password }, req);
    
    return NextResponse.json({ 
      authorizeResult,
      hasCredentialsProvider: !!credentialsProvider,
      providers: authOptions.providers.map(p => p.id)
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({ error: "Failed to test auth" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({ 
      session,
      authenticated: !!session,
      user: session?.user || null,
      authOptions: {
        sessionStrategy: authOptions.session?.strategy,
        providers: authOptions.providers.map(p => p.id)
      }
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({ error: "Failed to test auth" }, { status: 500 });
  }
} 