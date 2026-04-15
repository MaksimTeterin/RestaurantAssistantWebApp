import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    role?: string;
    user: {
      id?: string;
    } & DefaultSession["user"]
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    backendAccessToken?: string;
    role?: string
  }
}