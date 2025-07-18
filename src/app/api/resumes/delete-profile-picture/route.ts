import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";
import { del } from '@vercel/blob';

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

    // For Vercel Blob, we need to extract the blob URL
    // The filePath should be a full URL from Vercel Blob
    if (!filePath.startsWith('https://') || !filePath.includes('blob.vercel-storage.com')) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    try {
      // Delete the blob
      await del(filePath);
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      // If the blob doesn't exist, that's fine - it might have been already deleted
      console.warn("Blob not found for deletion:", deleteError);
      return NextResponse.json({ success: true, message: "File not found (may have been already deleted)" });
    }
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
} 