import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // For data URLs, we don't need to delete anything from storage
    // The data URL will be replaced when a new image is uploaded
    // Just return success
    return NextResponse.json({ success: true, message: "Profile picture cleared" });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
} 