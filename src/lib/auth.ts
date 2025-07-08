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
    strategy: "jwt",
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
      token: any;
    }) => {
      console.log("Session callback - token:", token);
      console.log("Session callback - session:", session);
      
      if (session?.user && token) {
        session.user.id = token.id;
      }
      
      console.log("Session callback - final session:", session);
      return session;
    },
    jwt: async ({ token, user }: { token: any; user: any }) => {
      console.log("JWT callback - token:", token);
      console.log("JWT callback - user:", user);
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      console.log("JWT callback - final token:", token);
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}; 