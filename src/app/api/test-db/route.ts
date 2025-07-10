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

    // Test creating a simple resume to see if createdAt is set
    const testResume = await prisma.resume.create({
      data: {
        title: "Test Resume - " + new Date().toISOString(),
        content: { test: true },
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Delete the test resume
    await prisma.resume.delete({
      where: {
        id: testResume.id,
      },
    });

    // Get all resumes for the user
    const allResumes = await prisma.resume.findMany({
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

    return NextResponse.json({
      testResume,
      allResumes,
      message: "Database test completed"
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
} 