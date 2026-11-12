import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    sponsorSlug?: string;
  }
  interface Session {
    user: {
      role?: string;
      sponsorSlug?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    sponsorSlug?: string;
  }
}
