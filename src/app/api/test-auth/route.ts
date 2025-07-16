import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    await req.json(); // Just consume the request body
    
    // Test the authorize function directly
    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials');
    
    return NextResponse.json({ 
      hasCredentialsProvider: !!credentialsProvider,
      providers: authOptions.providers.map(p => p.id)
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json({ error: "Failed to test auth" }, { status: 500 });
  }
}

export async function GET() {
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