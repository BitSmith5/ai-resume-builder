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
    const session = await getServerSession(authOptions) as Session;
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
      // Add deletedSections, sectionOrder, and exportSettings to the response
      deletedSections: resume.deletedSections || [],
      sectionOrder: resume.sectionOrder || [],
      exportSettings: resume.exportSettings || {},
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

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Clean the content field to remove any fields that should be handled by separate models
    const cleanContent = { ...content };
    const fieldsToRemove = [
      'workExperience', 'projects', 'languages', 'publications', 
      'awards', 'volunteerExperience', 'references', 'strengths',
      'education', 'courses', 'interests'
    ];
    fieldsToRemove.forEach(field => {
      if (cleanContent[field as keyof typeof cleanContent]) {
        delete cleanContent[field as keyof typeof cleanContent];
      }
    });

    // Validate data types and structure
    const validationErrors = [];
    
    // Check if arrays are actually arrays
    if (strengths && !Array.isArray(strengths)) {
      validationErrors.push("strengths must be an array");
    }
    if (workExperience && !Array.isArray(workExperience)) {
      validationErrors.push("workExperience must be an array");
    }
    if (education && !Array.isArray(education)) {
      validationErrors.push("education must be an array");
    }
    if (courses && !Array.isArray(courses)) {
      validationErrors.push("courses must be an array");
    }
    if (interests && !Array.isArray(interests)) {
      validationErrors.push("interests must be an array");
    }
    if (projects && !Array.isArray(projects)) {
      validationErrors.push("projects must be an array");
    }
    if (languages && !Array.isArray(languages)) {
      validationErrors.push("languages must be an array");
    }
    if (publications && !Array.isArray(publications)) {
      validationErrors.push("publications must be an array");
    }
    if (awards && !Array.isArray(awards)) {
      validationErrors.push("awards must be an array");
    }
    if (volunteerExperience && !Array.isArray(volunteerExperience)) {
      validationErrors.push("volunteerExperience must be an array");
    }
    if (references && !Array.isArray(references)) {
      validationErrors.push("references must be an array");
    }
    
    // Check for unexpected fields that might cause issues
    const expectedFields = [
      'title', 'jobTitle', 'template', 'content', 'profilePicture',
      'deletedSections', 'sectionOrder', 'exportSettings', 'strengths',
      'workExperience', 'education', 'courses', 'interests', 'projects',
      'languages', 'publications', 'awards', 'volunteerExperience', 'references'
    ];
    
    const unexpectedFields = Object.keys(body).filter(key => !expectedFields.includes(key));
    if (unexpectedFields.length > 0) {
      console.warn("Unexpected fields in request:", unexpectedFields);
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Data validation failed", details: validationErrors },
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
        // Allow work experience to be saved even if partially filled - just need at least one field
        return exp.company || exp.position || exp.startDate || exp.location;
      })
      .map((exp: { id?: number; resumeId?: number; startDate: string; endDate?: string; company: string; position: string; location?: string; bulletPoints?: unknown[]; [key: string]: unknown }) => {
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
          bulletPoints: Array.isArray(exp.bulletPoints) ? exp.bulletPoints : [],
        };
      });

    // Convert string dates to Date objects for education and remove id/resumeId fields
    const processedEducation = (education || [])
      .filter((edu: { institution: string; degree: string; field: string; startDate: string; [key: string]: unknown }) => {
        // Allow education to be saved even if partially filled - just need at least one field
        return edu.institution || edu.degree || edu.field || edu.startDate;
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

    // Filter out id and resumeId fields from strengths
    const processedStrengths = (strengths || [])
      .filter((strength: { skillName: string; rating: number; [key: string]: unknown }) => {
        // Allow strengths to be saved even if partially filled - just need at least one field
        return strength.skillName || strength.rating;
      })
      .map((strength: { id?: number; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = strength;
        return rest;
      });
    

    // Filter out id and resumeId fields from courses
    const processedCourses = (courses || [])
      .filter((course: { title: string; provider: string; [key: string]: unknown }) => {
        // Allow courses to be saved even if partially filled - just need at least one field
        return course.title || course.provider;
      })
      .map((course: { id?: number; resumeId?: number; title: string; provider: string; link?: string; startDate?: string; endDate?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, startDate, endDate, ...rest } = course;
        return rest;
      });

    // Filter out id and resumeId fields from interests
    const processedInterests = (interests || [])
      .filter((interest: { name: string; icon: string; [key: string]: unknown }) => {
        // Allow interests to be saved even if partially filled - just need at least one field
        return interest.name || interest.icon;
      })
      .map((interest: { id?: number; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = interest;
        return rest;
      });

    // Process projects data
    const processedProjects = (projects || [])
      .filter((project: { title: string; startDate?: string; endDate?: string; technologies?: unknown[]; link?: string; [key: string]: unknown }) => {
        // Allow projects to be saved even if partially filled - just need at least one field
        return project.title || project.startDate || project.endDate || (project.technologies && project.technologies.length > 0) || project.link;
      })
      .map((project: { id?: string; resumeId?: number; startDate: string; endDate?: string; technologies?: unknown[]; bulletPoints?: unknown[]; [key: string]: unknown }) => {
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
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          bulletPoints: Array.isArray(project.bulletPoints) ? project.bulletPoints : [],
        };
      });

    // Process languages data
    const processedLanguages = (languages || [])
      .filter((language: { name: string; proficiency: string; [key: string]: unknown }) => {
        // Allow languages to be saved even if partially filled - just need at least one field
        return language.name || language.proficiency;
      })
      .map((language: { id?: string; resumeId?: number; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = language;
        return rest;
      });

    // Process publications data
    const processedPublications = (publications || [])
      .filter((publication: { title: string; authors: string; journal: string; year: string; [key: string]: unknown }) => {
        // Allow publications to be saved even if partially filled - just need at least one field
        return publication.title || publication.authors || publication.journal || publication.year || publication.doi || publication.link;
      })
      .map((publication: { id?: string; resumeId?: number; title: string; authors: string; journal: string; year: string; doi?: string; link?: string; date?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, date, ...rest } = publication;
        return rest;
      });

    // Process awards data
    const processedAwards = (awards || [])
      .filter((award: { title: string; organization: string; year: string; [key: string]: unknown }) => {
        // Allow awards to be saved even if partially filled - just need at least one field
        return award.title || award.organization || award.year;
      })
      .map((award: { id?: string; resumeId?: number; title?: string; organization?: string; year?: string; bulletPoints?: unknown[]; date?: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, date, ...rest } = award;
        
        // Ensure bulletPoints is properly formatted as an array
        const processedAward = {
          ...rest,
          bulletPoints: Array.isArray(award.bulletPoints) ? award.bulletPoints : [],
        };
        
        return processedAward;
      });

    // Process volunteer experience data
    const processedVolunteerExperience = (volunteerExperience || [])
      .map((volunteer: { id?: string; resumeId?: number; organization: string; position: string; location?: string; startDate: string; endDate?: string; hoursPerWeek?: string; bulletPoints?: unknown[]; [key: string]: unknown }) => {
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
          bulletPoints: Array.isArray(volunteer.bulletPoints) ? volunteer.bulletPoints : [],
        };
      });
    
    // Process references data
    const processedReferences = (references || [])
      .filter((reference: { name: string; title: string; company: string; [key: string]: unknown }) => {
        // Allow references to be saved even if partially filled - just need at least one field
        return reference.name || reference.title || reference.company || reference.email || reference.phone || reference.relationship;
      })
      .map((reference: { id?: string; resumeId?: number; name: string; title: string; company: string; email: string; phone?: string; relationship: string; [key: string]: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, resumeId, ...rest } = reference;
        return rest;
      });

    // Process additional fields (will be stored in content JSON for now)
    const additionalData = {
      skillCategories: skillCategories || [],
      // Don't include these in content as they're handled by separate models
      // workExperience: workExperience || [], 
      // projects: projects || [], 
      // languages: languages || [], 
      // publications: publications || [], 
      // awards: awards || [], 
      // volunteerExperience: volunteerExperience || [], 
      // references: references || [], 
    };

    // Use a transaction to ensure data consistency
    const resume = await prisma.$transaction(async (tx) => {
      // Update the resume first
      await tx.resume.update({
        where: {
          id: parseInt(resolvedParams.id),
          userId: user.id,
        },
        data: {
          title,
          jobTitle,
          template: template || "modern",
          content: { ...cleanContent, ...additionalData },
          profilePicture: profilePicture || null,
          deletedSections: deletedSections || [],
          sectionOrder: sectionOrder || [],
          exportSettings: exportSettings || {},
        },
      });

      // Use upsert operations for related data - more efficient than delete + create
      if (processedStrengths.length > 0) {
        await tx.strength.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.strength.createMany({
          data: processedStrengths.map((strength: any) => ({
            ...strength,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedWorkExperience.length > 0) {
        await tx.workExperience.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.workExperience.createMany({
          data: processedWorkExperience.map((exp: any) => ({
            ...exp,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedEducation.length > 0) {
        await tx.education.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.education.createMany({
          data: processedEducation.map((edu: any) => ({
            ...edu,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedCourses.length > 0) {
        await tx.course.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.course.createMany({
          data: processedCourses.map((course: any) => ({
            ...course,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedInterests.length > 0) {
        await tx.interest.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.interest.createMany({
          data: processedInterests.map((interest: any) => ({
            ...interest,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedProjects.length > 0) {
        await tx.project.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.project.createMany({
          data: processedProjects.map((project: any) => ({
            ...project,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedLanguages.length > 0) {
        await tx.language.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.language.createMany({
          data: processedLanguages.map((language: any) => ({
            ...language,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedPublications.length > 0) {
        await tx.publication.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.publication.createMany({
          data: processedPublications.map((publication: any) => ({
            ...publication,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedAwards.length > 0) {
        await tx.award.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.award.createMany({
          data: processedAwards.map((award: any) => ({
            ...award,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedVolunteerExperience.length > 0) {
        await tx.volunteerExperience.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.volunteerExperience.createMany({
          data: processedVolunteerExperience.map((volunteer: any) => ({
            ...volunteer,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      if (processedReferences.length > 0) {
        await tx.reference.deleteMany({
          where: { resumeId: parseInt(resolvedParams.id) },
        });
        await tx.reference.createMany({
          data: processedReferences.map((reference: any) => ({
            ...reference,
            resumeId: parseInt(resolvedParams.id),
          })),
        });
      }

      // Fetch the updated resume with all related data
      const resume = await tx.resume.findUnique({
        where: {
          id: parseInt(resolvedParams.id),
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
        throw new Error('Failed to fetch updated resume');
      }

      return resume;
    }, {
      timeout: 30000, // Increase timeout to 30 seconds
      maxWait: 10000, // Maximum time to wait for a transaction to start
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
      // Add deletedSections, sectionOrder, and exportSettings to the response
      deletedSections: resume.deletedSections || [],
      sectionOrder: resume.sectionOrder || [],
      exportSettings: resume.exportSettings || {},
    };

    return NextResponse.json(processedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "Duplicate data detected", details: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: "Invalid reference data", details: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Invalid value')) {
        return NextResponse.json(
          { error: "Invalid data format", details: error.message },
          { status: 400 }
        );
      }
    }
    
    // Check for Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error("Prisma error code:", prismaError.code);
      console.error("Prisma error meta:", prismaError.meta);
      
      switch (prismaError.code) {
        case 'P2002':
          return NextResponse.json(
            { error: "Duplicate entry", details: "A record with this information already exists" },
            { status: 400 }
          );
        case 'P2003':
          return NextResponse.json(
            { error: "Foreign key constraint failed", details: "Referenced data does not exist" },
            { status: 400 }
          );
        case 'P2025':
          return NextResponse.json(
            { error: "Record not found", details: "The resume you're trying to update was not found" },
            { status: 404 }
          );
        case 'P2014':
          return NextResponse.json(
            { error: "Invalid data", details: "The data format is invalid" },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: "Database error", details: `Prisma error: ${prismaError.code}`, message: prismaError.message },
            { status: 500 }
          );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
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