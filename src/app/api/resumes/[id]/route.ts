import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";

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
        // projects: true,
        // languages: true,
        // publications: true,
        // awards: true,
        // volunteerExperience: true,
        // references: true,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Convert dates to YYYY-MM-DD format for HTML date inputs and extract additional data from content
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
      // Extract additional data from content JSON
      projects: (resume.content as any)?.projects || [],
      languages: (resume.content as any)?.languages || [],
      publications: (resume.content as any)?.publications || [],
      awards: (resume.content as any)?.awards || [],
      volunteerExperience: (resume.content as any)?.volunteerExperience || [],
      references: (resume.content as any)?.references || [],
    };

    // Add deletedSections and sectionOrder to the response
    (processedResume as any).deletedSections = (resume as any).deletedSections || [];
    (processedResume as any).sectionOrder = (resume as any).sectionOrder || [];

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
    const { 
      title, 
      jobTitle, 
      template, 
      content, 
      profilePicture, 
      deletedSections,
      sectionOrder,
      strengths, 
      workExperience, 
      education, 
      courses, 
      interests,
      projects,
      languages,
      publications,
      awards,
      volunteerExperience,
      references
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects for workExperience and remove id/resumeId fields
    const processedWorkExperience = (workExperience || []).map((exp: { id?: number; resumeId?: number; startDate: string; endDate?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = exp;
      return {
        ...rest,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
      };
    });

    // Convert string dates to Date objects for education and remove id/resumeId fields
    const processedEducation = (education || []).map((edu: { id?: number; resumeId?: number; startDate: string; endDate?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = edu;
      return {
        ...rest,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
      };
    });

    // Filter out id and resumeId fields from strengths
    const processedStrengths = (strengths || []).map((strength: { id?: number; resumeId?: number; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = strength;
      return rest;
    });

    // Filter out id and resumeId fields from courses
    const processedCourses = (courses || []).map((course: { id?: number; resumeId?: number; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = course;
      return rest;
    });

    // Filter out id and resumeId fields from interests
    const processedInterests = (interests || []).map((interest: { id?: number; resumeId?: number; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = interest;
      return rest;
    });

    // Process additional fields (will be stored in content JSON for now)
    const additionalData = {
      projects: projects || [],
      languages: languages || [],
      publications: publications || [],
      awards: awards || [],
      volunteerExperience: volunteerExperience || [],
      references: references || [],
    };

    // Get the current resume to check for profile picture changes
    const currentResume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
    });

    // Delete old profile picture if it's being replaced or removed
    // For data URLs, we don't need to delete anything from storage
    // The old data URL will be replaced with the new one
    if (currentResume && (currentResume as { profilePicture?: string }).profilePicture && (currentResume as { profilePicture?: string }).profilePicture !== profilePicture) {
      console.log("Profile picture being replaced - old data URL will be overwritten");
    }

    // Use a transaction to ensure data consistency
    const resume = await prisma.$transaction(async (tx) => {
      // Delete existing related data within the transaction
      await tx.strength.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.workExperience.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.education.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.course.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.interest.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });

      // Update the resume and recreate related data within the same transaction
      return await tx.resume.update({
        where: {
          id: parseInt(resolvedParams.id),
          userId: user.id,
        },
        data: {
          title,
          jobTitle,
          template: template || "modern",
          content: { ...content, ...additionalData },
          profilePicture: profilePicture || null,
          deletedSections: deletedSections || [],
          sectionOrder: sectionOrder || [],
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
        } as Prisma.ResumeUpdateInput,
        include: {
          strengths: true,
          workExperience: true,
          education: true,
          courses: true,
          interests: true,
          // projects: true,
          // languages: true,
          // publications: true,
          // awards: true,
          // volunteerExperience: true,
          // references: true,
        },
      });
    });

    // Convert dates to YYYY-MM-DD format for HTML date inputs and extract additional data from content
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
      // Extract additional data from content JSON
      projects: (resume.content as any)?.projects || [],
      languages: (resume.content as any)?.languages || [],
      publications: (resume.content as any)?.publications || [],
      awards: (resume.content as any)?.awards || [],
      volunteerExperience: (resume.content as any)?.volunteerExperience || [],
      references: (resume.content as any)?.references || [],
    };

    // Add deletedSections to the response
    (processedResume as any).deletedSections = (resume as any).deletedSections || [];

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
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the resume first to check if it has a profile picture
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Delete the profile picture file if it exists
    // For data URLs, we don't need to delete anything from storage
    if ((resume as { profilePicture?: string }).profilePicture) {
      console.log("Resume being deleted - profile picture data URL will be removed from database");
    }

    // Delete the resume from database
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