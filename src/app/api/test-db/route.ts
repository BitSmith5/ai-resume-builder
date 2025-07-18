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

    // Check if template field exists using raw SQL
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Resume' AND column_name = 'template'
    `;

    // Get all resumes for the user using raw SQL to include template field
    const allResumes = await prisma.$queryRaw`
      SELECT id, title, "jobTitle", template, "createdAt", "updatedAt"
      FROM "Resume" 
      WHERE "userId" = ${user.id}
      ORDER BY id DESC
    `;

    // Test creating a resume with template using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "Resume" (title, template, "jobTitle", content, "userId", "createdAt", "updatedAt")
      VALUES (${"Test Resume - " + new Date().toISOString()}, 'classic', 'Test Job', '{"test": true}', ${user.id}, NOW(), NOW())
    `;

    // Get the last inserted resume to verify template was saved
    const lastResume = await prisma.$queryRaw`
      SELECT id, title, "jobTitle", template, "createdAt", "updatedAt"
      FROM "Resume" 
      WHERE "userId" = ${user.id}
      ORDER BY id DESC
      LIMIT 1
    `;

    // Delete the test resume
    if (lastResume && Array.isArray(lastResume) && lastResume.length > 0) {
      const testId = (lastResume[0] as { id: number }).id;
      await prisma.$executeRaw`DELETE FROM "Resume" WHERE id = ${testId}`;
    }

    return NextResponse.json({
      tableInfo,
      allResumes,
      lastResume,
      message: "Database test completed - template field verified with raw SQL"
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
} 