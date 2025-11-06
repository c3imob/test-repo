import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { getServerSession } from "next-auth";
import nodemailer from "nodemailer";

import { prisma } from "./prisma";

export const FREE_GENERATION_LIMIT = 5;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        if (!process.env.EMAIL_SERVER_HOST) {
          console.info("Verification link", url);
          return;
        }

        await transporter.sendMail({
          to: identifier,
          from: process.env.EMAIL_FROM,
          subject: "Sign in to AI BlogCraft",
          text: `Sign in to AI BlogCraft by clicking on ${url}`,
          html: `<p>Sign in to <strong>AI BlogCraft</strong></p><p><a href="${url}">Click here to finish signing in</a></p>`
        });
      }
    })
  ],
  callbacks: {
    session: async ({ session, user }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          subscription: true
        }
      });

      const enriched: Session = {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: dbUser?.role ?? "FREE",
          subscriptionStatus: dbUser?.subscription?.status ?? null
        } as Session["user"] & {
          id: string;
          role: string;
          subscriptionStatus: string | null;
        }
      };

      return enriched;
    }
  }
};

export const getServerAuthSession = () => getServerSession(authOptions);
