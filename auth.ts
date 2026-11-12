import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getProjectAccess } from "@/lib/project-access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      authorization: { params: { hd: process.env.ALPHAVILLE_WORKSPACE_DOMAIN ?? "alphaville.hk" } },
      profile(profile) {
        return { id: profile.sub, name: profile.name, email: profile.email, image: profile.picture };
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
      return false;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const access = getProjectAccess(user.email);
        if (access) token.role = access.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
