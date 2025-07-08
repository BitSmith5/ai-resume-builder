import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ 
      session, 
      user 
    }: { 
      session: { 
        user?: { id?: string; name?: string | null; email?: string | null; image?: string | null }; 
        expires?: string;
      }; 
      user: { id: string; name?: string | null; email?: string | null; image?: string | null } 
    }) => {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return {
        ...session,
        expires: session.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    },
  },
  pages: {
    signIn: "/login",
  },
}; 