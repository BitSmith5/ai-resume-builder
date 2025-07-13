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
      let needsUpdate = false;
      
      // Check if this resume has work experience with old description field
      if (content?.workExperience && Array.isArray(content.workExperience)) {
        const updatedWorkExperience = (content.workExperience as Array<Record<string, unknown>>).map((exp: Record<string, unknown>) => {
          if (exp.description && !exp.bulletPoints) {
            needsUpdate = true;
            // Convert description to bullet points
            const description = exp.description as string;
            const bulletPoints = description.trim() ? [{ description }] : [];
            return {
              ...exp,
              bulletPoints,
              description: undefined, // Remove the old description field
            };
          }
          return exp;
        });

        if (needsUpdate) {
          const updatedContent = {
            ...content,
            workExperience: updatedWorkExperience as unknown,
          };
          
          // Update the resume in the database
          await prisma.resume.update({
            where: { id: resume.id },
            data: { content: updatedContent },
          });
          
          migratedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Migration completed. ${migratedCount} resumes migrated from description to bullet points.`,
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