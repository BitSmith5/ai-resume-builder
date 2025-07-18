import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, or HEIC/HEIF allowed" }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Convert the file to a data URL for database storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Generate a unique identifier for the image
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const imageId = `profile_${user.id}_${timestamp}_${randomId}`;

    // Return both the image ID (for localStorage) and the data URL (for database)
    return NextResponse.json({ 
      filePath: imageId,
      dataUrl: dataUrl,
      message: "Image uploaded successfully. Store the data URL in the resume record for PDF generation."
    });
  } catch (error) {
    console.error("Error processing profile picture:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
} 