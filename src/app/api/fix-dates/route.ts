import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all resumes and filter those without createdAt
    const allResumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    const resumesWithoutCreatedAt = allResumes.filter(r => !r.createdAt);

    // Update resumes without createdAt
    if (resumesWithoutCreatedAt.length > 0) {
      const now = new Date();
      const resumeIds = resumesWithoutCreatedAt.map(r => r.id);
      
      const updatedResumes = await prisma.resume.updateMany({
        where: {
          userId: user.id,
          id: {
            in: resumeIds,
          },
        },
        data: {
          createdAt: now,
          updatedAt: now,
        },
      });

      return NextResponse.json({
        message: `Updated ${updatedResumes.count} resumes with current date`,
        updatedCount: updatedResumes.count,
        currentDate: now.toISOString(),
      });
    }

    return NextResponse.json({
      message: "No resumes found without createdAt",
      updatedCount: 0,
    });
  } catch (error) {
    console.error("Error fixing dates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 