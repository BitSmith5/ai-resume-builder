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
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    session: async ({ 
      session, 
      token 
    }: { 
      session: { 
        user?: { id?: string; name?: string | null; email?: string | null; image?: string | null }; 
        expires?: string;
      }; 
      token: { id?: string; email?: string; name?: string; picture?: string };
    }) => {
      if (session?.user && token) {
        session.user.id = token.id as string;
      }
      // Ensure expires is always a string
      return {
        ...session,
        expires: session.expires ?? "",
      };
    },
    jwt: async ({ token, user }: { 
      token: { id?: string; email?: string; name?: string; picture?: string }; 
      user: { id: string; email: string; name: string; image: string } | null;
    }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}; 