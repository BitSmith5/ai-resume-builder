import { prisma } from './prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';

export interface ResumeData {
  title: string;
  content: Prisma.InputJsonValue;
  strengths: Array<{
    skillName: string;
    rating: number;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    gpa?: number;
  }>;
}

export const getResumes = async () => {
  const session = await getServerSession(authOptions as any) as Session;
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await prisma.resume.findMany({
    where: { userId },
    include: {
      strengths: true,
      workExperience: true,
      education: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getResume = async (id: string) => {
  const session = await getServerSession(authOptions as any) as Session;
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await prisma.resume.findFirst({
    where: { 
      id: parseInt(id),
      userId 
    },
    include: {
      strengths: true,
      workExperience: true,
      education: true,
    },
  });
};

export const createResume = async (data: ResumeData) => {
  const session = await getServerSession(authOptions as any) as Session;
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await prisma.resume.create({
    data: {
      title: data.title,
      content: data.content,
      userId,
      strengths: {
        create: data.strengths || [],
      },
      workExperience: {
        create: data.workExperience || [],
      },
      education: {
        create: data.education || [],
      },
    },
    include: {
      strengths: true,
      workExperience: true,
      education: true,
    },
  });
};

export const updateResume = async (id: string, data: ResumeData) => {
  const session = await getServerSession(authOptions as any) as Session;
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Delete existing related data
  await prisma.strength.deleteMany({
    where: { resumeId: parseInt(id) },
  });
  await prisma.workExperience.deleteMany({
    where: { resumeId: parseInt(id) },
  });
  await prisma.education.deleteMany({
    where: { resumeId: parseInt(id) },
  });

  return await prisma.resume.update({
    where: { 
      id: parseInt(id),
      userId 
    },
    data: {
      title: data.title,
      content: data.content,
      strengths: {
        create: data.strengths || [],
      },
      workExperience: {
        create: data.workExperience || [],
      },
      education: {
        create: data.education || [],
      },
    },
    include: {
      strengths: true,
      workExperience: true,
      education: true,
    },
  });
};

export const deleteResume = async (id: string) => {
  const session = await getServerSession(authOptions as any) as Session;
  const userId = (session?.user as any)?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await prisma.resume.delete({
    where: { 
      id: parseInt(id),
      userId 
    },
  });

  return true;
};

// Add the missing handler export
export const handler = async () => {
  // This is a placeholder - you'll need to implement the actual GraphQL handler
  // For now, we'll return a simple response
  return new Response(JSON.stringify({ message: 'GraphQL endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}; 