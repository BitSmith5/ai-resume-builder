import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as Session;

    // Cast session.user to include id property
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

    // Cast session.user to include id property
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.create({
      data: {
        title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: content as any, // Cast to any for JSON type compatibility
        userId: user.id,
      },
      include: {
        strengths: true,
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