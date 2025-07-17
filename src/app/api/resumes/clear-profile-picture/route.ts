import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import type { Session } from "next-auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session;
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await request.json();
    
    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    // Update the resume to clear the profile picture
    const updatedResume = await prisma.resume.update({
      where: {
        id: parseInt(resumeId),
        userId: user.id,
      },
      data: {
        profilePicture: "",
      },
    });

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (error) {
    console.error("Error clearing profile picture:", error);
    return NextResponse.json({ error: "Failed to clear profile picture" }, { status: 500 });
  }
} 