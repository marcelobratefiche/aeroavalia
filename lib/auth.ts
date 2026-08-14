import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth strategy
// -------------
// We use JWT sessions (no DB session table needed) so a Google sign-in
// never touches the database beyond what a passenger's own submission
// explicitly stores.
//
// Google's OAuth flow always returns an e-mail claim as part of basic
// identity verification, but we deliberately DO NOT persist or display
// e-mail anywhere in this app. It exists only in the short-lived
// server-side JWT, for exactly one purpose: checking whether the signed
// in account is one of the airport's admin accounts (ADMIN_EMAILS).
// Passenger submissions store only the Google display name + an opaque
// "sub" id (used solely to rate-limit duplicate submissions).
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.sub as string;
        token.name = profile.name as string;
        token.email = (profile as { email?: string }).email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.sub = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/entrar",
  },
});
