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
        projects: true,
        languages: true,
        publications: true,
        awards: true,
        volunteerExperience: true,
        references: true,
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
      projects: resume.projects?.map((project) => ({
        ...project,
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
      })) || [],
      // Extract additional data from content JSON
      skillCategories: (resume.content as Record<string, unknown>)?.skillCategories || [],
      languages: resume.languages || [],
      publications: resume.publications || [],
      awards: (resume.content as Record<string, unknown>)?.awards || [],
      volunteerExperience: resume.volunteerExperience || [],
      references: resume.references || [],
    };

    // Add deletedSections, sectionOrder, and exportSettings to the response
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).deletedSections = (resume as { deletedSections?: unknown }).deletedSections || [];
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).sectionOrder = (resume as { sectionOrder?: unknown }).sectionOrder || [];
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).exportSettings = (resume as { exportSettings?: unknown }).exportSettings || {};

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
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("PUT request body received:", JSON.stringify(body, null, 2));
    console.log("🔍 PUT DEBUG - Body skillCategories field:", body.skillCategories);
    
    const { 
      title, 
      jobTitle, 
      template, 
      content, 
      profilePicture, 
      deletedSections,
      sectionOrder,
      exportSettings,
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
    
    console.log("🔍 PUT DEBUG - Destructured skillCategories:", skillCategories);

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Validate that the resume exists and belongs to the user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        userId: user.id,
      },
    });

    if (!existingResume) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Convert string dates to Date objects for workExperience and remove id/resumeId fields
    const processedWorkExperience = (workExperience || [])
      .filter((exp: { company: string; position: string; startDate: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return exp.company && exp.position && exp.startDate;
      })
      .map((exp: { id?: number; resumeId?: number; startDate: string; endDate?: string; company: string; position: string; location?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = exp;
        
        // Convert "MMM YYYY" format to Date object for database storage
        const parseDate = (dateStr: string): Date => {
          if (!dateStr || dateStr.trim() === '') return new Date();
          
          // Handle different date formats
          if (dateStr.includes(' ')) {
            // "MMM YYYY" format
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = dateStr.split(' ');
            if (parts.length >= 2) {
              const month = parts[0];
              const year = parts[1];
              const monthIndex = months.indexOf(month);
              if (monthIndex !== -1 && !isNaN(parseInt(year))) {
                return new Date(parseInt(year), monthIndex, 1);
              }
            }
          } else if (dateStr.includes('-')) {
            // ISO date format (YYYY-MM-DD)
            return new Date(dateStr);
          }
          
          // Fallback to current date if parsing fails
          console.warn(`Failed to parse date: ${dateStr}, using current date`);
          return new Date();
        };

        // Remove location field as it's not in the database schema
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { location, ...restWithoutLocation } = rest;
        
        return {
          ...restWithoutLocation,
          startDate: parseDate(exp.startDate),
          endDate: exp.endDate ? parseDate(exp.endDate) : null,
        };
      });

    // Convert string dates to Date objects for education and remove id/resumeId fields
    const processedEducation = (education || [])
      .filter((edu: { institution: string; degree: string; field: string; startDate: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return edu.institution && edu.degree && edu.field && edu.startDate;
      })
      .map((edu: { id?: number; resumeId?: number; startDate: string; endDate?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = edu;
        
        // Convert "MMM YYYY" format to Date object for database storage
        const parseDate = (dateStr: string): Date => {
          if (!dateStr || dateStr.trim() === '') return new Date();
          
          // Handle different date formats
          if (dateStr.includes(' ')) {
            // "MMM YYYY" format
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = dateStr.split(' ');
            if (parts.length >= 2) {
              const month = parts[0];
              const year = parts[1];
              const monthIndex = months.indexOf(month);
              if (monthIndex !== -1 && !isNaN(parseInt(year))) {
                return new Date(parseInt(year), monthIndex, 1);
              }
            }
          } else if (dateStr.includes('-')) {
            // ISO date format (YYYY-MM-DD)
            return new Date(dateStr);
          }
          
          // Fallback to current date if parsing fails
          console.warn(`Failed to parse date: ${dateStr}, using current date`);
          return new Date();
        };

        return {
          ...rest,
          startDate: parseDate(edu.startDate),
          endDate: edu.endDate ? parseDate(edu.endDate) : null,
        };
      });

    console.log('🔍 PUT DEBUG - Received strengths:', strengths);
    console.log('🔍 PUT DEBUG - Received volunteerExperience:', volunteerExperience);
    console.log('🔍 PUT DEBUG - Received references:', references);
    
    // Filter out id and resumeId fields from strengths
    const processedStrengths = (strengths || [])
      .filter((strength: { skillName: string; rating: number; [key: string]: unknown }) => {
        // Filter out empty entries
        return strength.skillName && strength.rating;
      })
      .map((strength: { id?: number; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = strength;
        return rest;
      });
    
    console.log('🔍 PUT DEBUG - Processed strengths:', processedStrengths);

    // Filter out id and resumeId fields from courses
    const processedCourses = (courses || [])
      .filter((course: { title: string; provider: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return course.title && course.provider;
      })
      .map((course: { id?: number; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = course;
        return rest;
      });

    // Filter out id and resumeId fields from interests
    const processedInterests = (interests || [])
      .filter((interest: { name: string; icon: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return interest.name && interest.icon;
      })
      .map((interest: { id?: number; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = interest;
        return rest;
      });

    // Process projects data
    const processedProjects = (projects || [])
      .filter((project: { title: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return project.title;
      })
      .map((project: { id?: string; resumeId?: number; startDate: string; endDate?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = project;
        
        // Convert "MMM YYYY" format to Date object for database storage
        const parseDate = (dateStr: string): Date => {
          if (!dateStr || dateStr.trim() === '') return new Date();
          
          // Handle different date formats
          if (dateStr.includes(' ')) {
            // "MMM YYYY" format
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = dateStr.split(' ');
            if (parts.length >= 2) {
              const month = parts[0];
              const year = parts[1];
              const monthIndex = months.indexOf(month);
              if (monthIndex !== -1 && !isNaN(parseInt(year))) {
                return new Date(parseInt(year), monthIndex, 1);
              }
            }
          } else if (dateStr.includes('-')) {
            // ISO date format (YYYY-MM-DD)
            return new Date(dateStr);
          }
          
          // Fallback to current date if parsing fails
          console.warn(`Failed to parse date: ${dateStr}, using current date`);
          return new Date();
        };

        return {
          ...rest,
          startDate: parseDate(project.startDate),
          endDate: project.endDate ? parseDate(project.endDate) : null,
        };
      });

    // Process languages data
    const processedLanguages = (languages || [])
      .filter((language: { name: string; proficiency: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return language.name && language.proficiency;
      })
      .map((language: { id?: string; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = language;
        return rest;
      });

    // Process publications data
    const processedPublications = (publications || [])
      .filter((publication: { title: string; authors: string; journal: string; year: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return publication.title && publication.authors && publication.journal && publication.year;
      })
      .map((publication: { id?: string; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = publication;
        return rest;
      });

    // Process awards data
    const processedAwards = (awards || [])
      .filter((award: { title: string; organization: string; year: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return award.title && award.organization && award.year;
      })
      .map((award: { id?: string; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = award;
        return rest;
      });

    // Process volunteer experience data
    const processedVolunteerExperience = (volunteerExperience || [])
      .map((volunteer: { id?: string; resumeId?: number; startDate: string; endDate?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = volunteer;
        
        // Convert string dates to Date objects for database storage
        const parseDate = (dateStr: string): Date => {
          if (!dateStr || dateStr.trim() === '') return new Date();
          
          // Handle different date formats
          if (dateStr.includes(' ')) {
            // "MMM YYYY" format
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const parts = dateStr.split(' ');
            if (parts.length >= 2) {
              const month = parts[0];
              const year = parts[1];
              const monthIndex = months.indexOf(month);
              if (monthIndex !== -1 && !isNaN(parseInt(year))) {
                return new Date(parseInt(year), monthIndex, 1);
              }
            }
          } else if (dateStr.includes('-')) {
            // ISO date format (YYYY-MM-DD)
            return new Date(dateStr);
          }
          
          // Fallback to current date if parsing fails
          console.warn(`Failed to parse date: ${dateStr}, using current date`);
          return new Date();
        };

        return {
          ...rest,
          startDate: parseDate(volunteer.startDate),
          endDate: volunteer.endDate ? parseDate(volunteer.endDate) : null,
        };
      });
    
    console.log('🔍 PUT DEBUG - Processed volunteerExperience:', processedVolunteerExperience);

    // Process references data
    const processedReferences = (references || [])
      .filter((reference: { name: string; title: string; company: string; [key: string]: unknown }) => {
        // Filter out empty entries
        return reference.name && reference.title && reference.company;
      })
      .map((reference: { id?: string; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = reference;
        return rest;
      });
    
    console.log('🔍 PUT DEBUG - Processed references:', processedReferences);

    // Process additional fields (will be stored in content JSON for now)
    const additionalData = {
      skillCategories: skillCategories || [],
      workExperience: workExperience || [], // Include work experience with location in content
      projects: projects || [],
      languages: languages || [],
      publications: publications || [],
      awards: awards || [],
      volunteerExperience: volunteerExperience || [],
      references: references || [],
    };
    
          console.log('🔍 PUT DEBUG - Skill Categories:', additionalData.skillCategories);
      console.log('🔍 PUT DEBUG - Content with skillCategories:', { ...content, ...additionalData });
      console.log('🔍 PUT DEBUG - Full additionalData:', additionalData);

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
    if (currentResume && currentResume.profilePicture && currentResume.profilePicture !== profilePicture) {
      console.log("Profile picture being replaced - old data URL will be overwritten");
    }

    // Use a transaction to ensure data consistency
    console.log("Starting database transaction...");
    const resume = await prisma.$transaction(async (tx) => {
      console.log("Deleting existing data...");
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
      await tx.project.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.language.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.publication.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.award.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.volunteerExperience.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });
      await tx.reference.deleteMany({
        where: { resumeId: parseInt(resolvedParams.id) },
      });

      // Update the resume and recreate related data within the same transaction
      console.log("Updating resume with basic data:", {
        title,
        jobTitle,
        template,
        deletedSections,
        sectionOrder,
        exportSettings,
      });
      
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
          exportSettings: exportSettings || {},
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
          projects: {
            create: processedProjects,
          },
          languages: {
            create: processedLanguages,
          },
          publications: {
            create: processedPublications,
          },
          awards: {
            create: processedAwards,
          },
          volunteerExperience: {
            create: processedVolunteerExperience,
          },
          references: {
            create: processedReferences,
          },
        } as Prisma.ResumeUpdateInput,
        include: {
          strengths: true,
          workExperience: true,
          education: true,
          courses: true,
          interests: true,
          projects: true,
          languages: true,
          publications: true,
          awards: true,
          volunteerExperience: true,
          references: true,
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
      projects: resume.projects?.map((project) => ({
        ...project,
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
      })) || [],
      // Extract additional data from content JSON
      skillCategories: (resume.content as Record<string, unknown>)?.skillCategories || [],
      languages: resume.languages || [],
      publications: resume.publications || [],
      awards: (resume.content as Record<string, unknown>)?.awards || [],
      volunteerExperience: resume.volunteerExperience || [],
      references: resume.references || [],
    };

    // Add deletedSections, sectionOrder, and exportSettings to the response
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).deletedSections = (resume as { deletedSections?: unknown }).deletedSections || [];
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).sectionOrder = (resume as { sectionOrder?: unknown }).sectionOrder || [];
    (processedResume as { deletedSections?: unknown; sectionOrder?: unknown; exportSettings?: unknown }).exportSettings = (resume as { exportSettings?: unknown }).exportSettings || {};

    return NextResponse.json(processedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
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
    if (resume.profilePicture) {
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