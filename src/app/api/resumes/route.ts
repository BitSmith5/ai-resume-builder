import { NextRequest, NextResponse } from "next/server";
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

    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      include: {
        strengths: true,
        workExperience: true,
        education: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, strengths, workExperience, education } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects for workExperience and remove id/resumeId fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedWorkExperience = (workExperience || []).map((exp: any) => {
      const { id, resumeId, ...rest } = exp;
      return {
        ...rest,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
      };
    });

    // Convert string dates to Date objects for education and remove id/resumeId fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedEducation = (education || []).map((edu: any) => {
      const { id, resumeId, ...rest } = edu;
      return {
        ...rest,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
      };
    });

    // Filter out id and resumeId fields from strengths
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedStrengths = (strengths || []).map((strength: any) => {
      const { id, resumeId, ...rest } = strength;
      return rest;
    });

    const resume = await prisma.resume.create({
      data: {
        title,
        content: content,
        userId: user.id,
        strengths: {
          create: processedStrengths,
        },
        workExperience: {
          create: processedWorkExperience,
        },
        education: {
          create: processedEducation,
        },
      },
      include: {
        strengths: true,
        workExperience: true,
        education: true,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 