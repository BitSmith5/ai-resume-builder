import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get raw database data
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // Check for resumes without createdAt
    const resumesWithoutCreatedAt = resumes.filter(r => !r.createdAt);

    // Test date formatting
    const testDate = new Date();

    return NextResponse.json({
      resumes,
      firstResumeCreatedAt: resumes[0]?.createdAt,
      firstResumeCreatedAtType: typeof resumes[0]?.createdAt,
      totalResumes: resumes.length,
      resumesWithoutCreatedAt: resumesWithoutCreatedAt.length,
      testDate: testDate.toISOString(),
      testDateFormatted: testDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 