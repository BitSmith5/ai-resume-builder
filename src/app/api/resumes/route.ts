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
        courses: true,
        interests: true,
        // projects: true,
        // languages: true,
        // publications: true,
        // awards: true,
        // volunteerExperience: true,
        // references: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // Convert dates to YYYY-MM-DD format for HTML date inputs
    const processedResumes = resumes.map((resume) => ({
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
      deletedSections: (resume as { deletedSections?: string[] }).deletedSections || [],
      sectionOrder: (resume as { sectionOrder?: string[] }).sectionOrder || [],
    }));

    return NextResponse.json(processedResumes);
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
    const session = await getServerSession(authOptions) as Session;
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
      skillCategories,
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
    const processedWorkExperience = (workExperience || []).map((exp: { id?: string; resumeId?: string; startDate: string; endDate?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = exp;
      return {
        ...rest,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
      };
    });

    // Convert string dates to Date objects for education and remove id/resumeId fields
    const processedEducation = (education || []).map((edu: { id?: string; resumeId?: string; startDate: string; endDate?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = edu;
      return {
        ...rest,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
      };
    });

    // Filter out id and resumeId fields from strengths
    const processedStrengths = (strengths || []).map((strength: { id?: string; resumeId?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = strength;
      return rest;
    });

    // Filter out id and resumeId fields from courses
    const processedCourses = (courses || []).map((course: { id?: string; resumeId?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = course;
      return rest;
    });

    // Filter out id and resumeId fields from interests
    const processedInterests = (interests || []).map((interest: { id?: string; resumeId?: string; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, resumeId, ...rest } = interest;
      return rest;
    });

    // Process additional fields (will be stored in content JSON for now)
    const additionalData = {
      skillCategories: skillCategories || [],
      projects: projects || [],
      languages: languages || [],
      publications: publications || [],
      awards: awards || [],
      volunteerExperience: volunteerExperience || [],
      references: references || [],
    };

    const resume = await prisma.resume.create({
      data: {
        title,
        jobTitle,
        template: template || "modern",
        content: { ...content, ...additionalData },
        profilePicture: profilePicture || null,
        deletedSections: deletedSections || [],
        sectionOrder: sectionOrder || [],
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
        courses: {
          create: processedCourses,
        },
        interests: {
          create: processedInterests,
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        strengths: true,
        workExperience: true,
        education: true,
        courses: true,
        interests: true,
      },
    });

    // Convert dates to YYYY-MM-DD format for HTML date inputs and extract additional data from content
    const processedResume = {
      ...resume,
      workExperience: (resume as { workExperience?: Array<{ startDate: Date; endDate?: Date | null; [key: string]: unknown }> }).workExperience?.map((exp: { startDate: Date; endDate?: Date | null; [key: string]: unknown }) => ({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toISOString().split('T')[0] : '',
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
      })) || [],
      education: (resume as { education?: Array<{ startDate: Date; endDate?: Date | null; [key: string]: unknown }> }).education?.map((edu: { startDate: Date; endDate?: Date | null; [key: string]: unknown }) => ({
        ...edu,
        startDate: edu.startDate ? edu.startDate.toISOString().split('T')[0] : '',
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
      })) || [],
      // Extract additional data from content JSON
      projects: (resume.content as { projects?: unknown[] })?.projects || [],
      languages: (resume.content as { languages?: unknown[] })?.languages || [],
      publications: (resume.content as { publications?: unknown[] })?.publications || [],
      awards: (resume.content as { awards?: unknown[] })?.awards || [],
      volunteerExperience: (resume.content as { volunteerExperience?: unknown[] })?.volunteerExperience || [],
      references: (resume.content as { references?: unknown[] })?.references || [],
    };

    return NextResponse.json(processedResume, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 