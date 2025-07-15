import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
      include: {
        strengths: true,
        workExperience: true,
        education: true,
        courses: true,
        interests: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Convert dates to YYYY-MM-DD format for HTML date inputs
    const processedResume = {
      ...resume,
      workExperience: resume.workExperience.map((exp) => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toISOString().split('T')[0] : '',
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
      })),
      education: resume.education.map((edu) => ({
        ...edu,
        startDate: edu.startDate ? edu.startDate.toISOString().split('T')[0] : '',
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      })),
    };

    return NextResponse.json(processedResume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, profilePicture, strengths, workExperience, education, courses, interests } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects for workExperience and remove id/resumeId fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedWorkExperience = (workExperience || []).map((exp: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = strength;
      return rest;
    });

    // Filter out id and resumeId fields from courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedCourses = (courses || []).map((course: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = course;
      return rest;
    });

    // Filter out id and resumeId fields from interests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedInterests = (interests || []).map((interest: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = interest;
      return rest;
    });

    // Delete existing related data
    await prisma.strength.deleteMany({
      where: { resumeId: parseInt(resolvedParams.id) },
    });
    await prisma.workExperience.deleteMany({
      where: { resumeId: parseInt(resolvedParams.id) },
    });
    await prisma.education.deleteMany({
      where: { resumeId: parseInt(resolvedParams.id) },
    });
    await prisma.course.deleteMany({
      where: { resumeId: parseInt(resolvedParams.id) },
    });
    await prisma.interest.deleteMany({
      where: { resumeId: parseInt(resolvedParams.id) },
    });

    const resume = await prisma.resume.update({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
      data: {
        title,
        content,
        profilePicture: profilePicture || null,
        strengths: {
          create: processedStrengths,
        },
        workExperience: {
          create: processedWorkExperience,
        },
        education: {
          create: processedEducation,
        },
        courses: {
          create: processedCourses,
        },
        interests: {
          create: processedInterests,
        },
      } as any,
      include: {
        strengths: true,
        workExperience: true,
        education: true,
        courses: true,
        interests: true,
      },
    });

    // Convert dates to YYYY-MM-DD format for HTML date inputs
    const processedResume = {
      ...resume,
      workExperience: resume.workExperience.map((exp) => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toISOString().split('T')[0] : '',
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
      })),
      education: resume.education.map((edu) => ({
        ...edu,
        startDate: edu.startDate ? edu.startDate.toISOString().split('T')[0] : '',
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      })),
    };

    return NextResponse.json(processedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.resume.delete({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 