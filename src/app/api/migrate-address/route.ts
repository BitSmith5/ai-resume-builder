import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all resumes for the user
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
      },
    });

    let migratedCount = 0;

    for (const resume of resumes) {
      const content = resume.content as Record<string, unknown>;
      
      // Check if this resume has the old address field
      const personalInfo = content?.personalInfo as Record<string, unknown> | undefined;
      if (personalInfo?.address && !personalInfo?.city && !personalInfo?.state) {
        // Extract city and state from address (simple split by comma)
        const address = personalInfo.address as string;
        const parts = address.split(',').map((part: string) => part.trim());
        
        let city = '';
        let state = '';
        
        if (parts.length >= 2) {
          city = parts[0];
          state = parts[1];
        } else if (parts.length === 1) {
          // If only one part, assume it's the city
          city = parts[0];
        }
        
        // Update the content with new city/state fields and remove address
        const updatedContent = {
          ...content,
          personalInfo: {
            ...(content.personalInfo as Record<string, unknown>),
            city,
            state,
            address: undefined, // Remove the old address field
          },
        };
        
        // Update the resume in the database
        await prisma.resume.update({
          where: { id: resume.id },
          data: { content: updatedContent },
        });
        
        migratedCount++;
      }
    }

    return NextResponse.json({
      message: `Migration completed. ${migratedCount} resumes migrated from address to city/state fields.`,
      migratedCount,
    });
  } catch (error) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 