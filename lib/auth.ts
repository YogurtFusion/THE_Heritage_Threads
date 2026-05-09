import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase().trim(),
          }).select("+password");

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password as string
          );

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar ?? null,
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.avatar = (user as { avatar?: string | null }).avatar ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { userId?: string }).userId = token.userId as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "user";
        (session.user as { avatar?: string | null }).avatar = token.avatar as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
