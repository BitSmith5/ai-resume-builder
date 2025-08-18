import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import type { Session } from "next-auth";

export async function GET() {
  try {
    // Test database connectivity
    await prisma.$connect();
    
    // Test basic query
    const userCount = await prisma.user.count();
    
    // Test resume schema
    const resumeCount = await prisma.resume.count();
    
    // Test if we can create a simple record
    const testData = {
      title: "Test Resume",
      jobTitle: "Test Job",
      template: "modern",
      content: { personalInfo: { name: "Test", email: "test@test.com" } },
      userId: "test-user-id", // This will fail but we'll catch the error
    };
    
    return NextResponse.json({
      status: "Database connection successful",
      userCount,
      resumeCount,
      testData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Test the exact data structure being sent
    console.log("Debug POST - Request body:", JSON.stringify(body, null, 2));
    
    // Validate the data structure
    const validationErrors = [];
    
    if (!body.title) validationErrors.push("Missing title");
    if (!body.content) validationErrors.push("Missing content");
    
    // Check for unexpected fields
    const expectedFields = [
      'title', 'jobTitle', 'template', 'content', 'profilePicture',
      'deletedSections', 'sectionOrder', 'exportSettings', 'strengths',
      'workExperience', 'education', 'courses', 'interests', 'projects',
      'languages', 'publications', 'awards', 'volunteerExperience', 'references'
    ];
    
    const unexpectedFields = Object.keys(body).filter(key => !expectedFields.includes(key));
    if (unexpectedFields.length > 0) {
      validationErrors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
    }
    
    // Check data types
    if (body.strengths && !Array.isArray(body.strengths)) {
      validationErrors.push("strengths must be an array");
    }
    
    if (body.workExperience && !Array.isArray(body.workExperience)) {
      validationErrors.push("workExperience must be an array");
    }
    
    if (body.education && !Array.isArray(body.education)) {
      validationErrors.push("education must be an array");
    }
    
    return NextResponse.json({
      status: "Data validation complete",
      validationErrors,
      unexpectedFields,
      dataStructure: {
        title: typeof body.title,
        content: typeof body.content,
        strengths: Array.isArray(body.strengths) ? body.strengths.length : typeof body.strengths,
        workExperience: Array.isArray(body.workExperience) ? body.workExperience.length : typeof body.workExperience,
        education: Array.isArray(body.education) ? body.education.length : typeof body.education,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug POST error:", error);
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 