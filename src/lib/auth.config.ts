import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/cadastro",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role =
          token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as unknown as { role?: string })?.role;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/cadastro");
      const isClientePage =
        pathname.startsWith("/dashboard") || pathname.startsWith("/novo");
      const isAdminPage = pathname.startsWith("/admin");

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(
          new URL(
            userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard",
            nextUrl
          )
        );
      }

      if ((isClientePage || isAdminPage) && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isAdminPage && userRole !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
