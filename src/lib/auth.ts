import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { findMemberByEmail, findMemberByProvider, createMember } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }
        const member = findMemberByEmail(credentials.email);
        if (!member || !member.passwordHash) {
          throw new Error("ไม่พบบัญชีผู้ใช้นี้ในระบบ");
        }
        const valid = await bcrypt.compare(credentials.password, member.passwordHash);
        if (!valid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }
        return { id: member.id, name: member.name, email: member.email };
      },
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID || "",
      clientSecret: process.env.LINE_CLIENT_SECRET || "",
      authorization: { params: { scope: "openid profile email" } },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      authorization: "https://www.facebook.com/v21.0/dialog/oauth?scope=email",
      token: "https://graph.facebook.com/v21.0/oauth/access_token",
      userinfo: "https://graph.facebook.com/me?fields=id,name,email,picture",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") {
        return true;
      }

      const providerId = account.providerAccountId;
      const provider = account.provider as "line" | "facebook" | "google";

      const existingByProvider = findMemberByProvider(provider, providerId);
      if (existingByProvider) {
        user.id = existingByProvider.id;
        return true;
      }

      const email = (profile as { email?: string } | undefined)?.email || user.email;
      if (email) {
        const existingByEmail = findMemberByEmail(email);
        if (existingByEmail) {
          return "/login?error=EmailInUse";
        }
      }

      const newMember = createMember({
        name: user.name || "สมาชิกใหม่",
        email: email || `${provider}-${providerId}@tukshop.local`,
        phone: "",
        provider,
        providerId,
      });
      user.id = newMember.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
