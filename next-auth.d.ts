import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "FREE" | "PRO";
      subscriptionStatus: string | null;
    };
  }

  interface User {
    id: string;
    role: "FREE" | "PRO";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "FREE" | "PRO";
  }
}
