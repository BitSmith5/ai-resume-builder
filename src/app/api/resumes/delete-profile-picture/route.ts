import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";
import fs from "fs";
import path from "path";

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

    // Ensure the file path is within the uploads directory for security
    if (!filePath.startsWith('/uploads/profile-pictures/')) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Convert the relative path to absolute path
    const absolutePath = path.join(process.cwd(), 'public', filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      // Return success even if file doesn't exist - it might have been already deleted
      return NextResponse.json({ success: true, message: "File not found (may have been already deleted)" });
    }

    // Delete the file
    fs.unlinkSync(absolutePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
} 