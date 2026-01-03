import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const rateLimit = await rateLimiters.auth.check(5, getClientIp(req));
        if (!rateLimit.success) {
          throw new Error("TooManyRequests");
        }

        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user?: { id?: string; plan?: string } | null;
      trigger?: "signIn" | "update";
    }) {
      if (user?.id) {
        token.id = user.id;
        token.plan = user.plan as any;
      }

      if (trigger === "update" && token.id) {
        const refreshed = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        });
        if (refreshed?.plan) {
          token.plan = refreshed.plan;
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/status/429",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAuthSession = () => getServerSession(authOptions as any) as Promise<Session | null>;
