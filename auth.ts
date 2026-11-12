import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getProjectAccess } from "@/lib/project-access";

type ExternalAccount = { email: string; passwordHash: string };
function externalAccounts(): ExternalAccount[] {
  try { return JSON.parse(process.env.EXTERNAL_ACCOUNTS_JSON ?? "[]") as ExternalAccount[]; }
  catch { return []; }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      authorization: { params: { hd: process.env.ALPHAVILLE_WORKSPACE_DOMAIN ?? "alphaville.hk" } },
      profile(profile) {
        return { id: profile.sub, name: profile.name, email: profile.email, image: profile.picture };
      },
    }),
    Credentials({
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        const account = externalAccounts().find((entry) => entry.email.toLowerCase() === email);
        const access = getProjectAccess(email);
        if (!account || !access || !password || !(await bcrypt.compare(password, account.passwordHash))) return null;
        return { id: email, email, name: email, role: access.role, sponsorSlug: access.sponsorSlug };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const access = getProjectAccess(user.email);
      if (!access) return false;
      if (account?.provider === "google") {
        const googleProfile = profile as { hd?: string; email_verified?: boolean } | undefined;
        const domain = (process.env.ALPHAVILLE_WORKSPACE_DOMAIN ?? "alphaville.hk").trim().toLowerCase();
        return Boolean(domain && googleProfile?.hd?.toLowerCase() === domain && googleProfile.email_verified);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const access = getProjectAccess(user.email);
        if (access) { token.role = access.role; token.sponsorSlug = access.sponsorSlug; }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.sponsorSlug = token.sponsorSlug as string | undefined;
      }
      return session;
    },
  },
});
