import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        phone: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        preferences: true,
      },
    });

    if (!userProfile) {
      // Create user profile if it doesn't exist
      try {
        const newUserProfile = await prisma.user.create({
          data: {
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            image: user.image || null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            location: true,
            phone: true,
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
            preferences: true,
          },
        });
        return NextResponse.json(newUserProfile);
      } catch (createError) {
        console.error("Error creating user profile:", createError);
        // If creation fails, try to fetch again (in case of race condition)
        const retryUserProfile = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            location: true,
            phone: true,
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
            preferences: true,
          },
        });
        if (retryUserProfile) {
          return NextResponse.json(retryUserProfile);
        }
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      bio, 
      location, 
      phone, 
      linkedinUrl, 
      githubUrl,
      portfolioUrl, 
      preferences 
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        preferences: preferences || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        phone: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        preferences: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 