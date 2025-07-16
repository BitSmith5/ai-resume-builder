import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({ 
      session,
      authenticated: !!session,
      user: session?.user || null
    });
  } catch (error) {
    console.error("Session test error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
} 