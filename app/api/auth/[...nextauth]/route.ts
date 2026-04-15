import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AuthToRestaurantAPI from "@/app/actions/AuthToRestaurantAPI";

const useSecureCookies =
  process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";


export const authOptions: NextAuthOptions = {
  secret: process.env.NEXT_PUBLIC_RESTAURANTAPIAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: "",
      clientSecret: "",
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 1. Initial Sign In
      if(user){
        try{
          const authData = await (await AuthToRestaurantAPI(user.email!, user.name!))
          token.backendAccessToken = authData.token;
          token.role = authData.role
          console.log("Token saved successfully")
        } catch(err){
          console.error("JWT callback error " + err);
          delete token.backendAccessToken;
          delete token.role;
        }
      }

      // In this app, a user is considered authenticated only if backend JWT exists.
      if (!token.backendAccessToken) {
        return {};
      }

      return token
      },
      async session({ session, token }) {
        session.backendAccessToken = token.backendAccessToken as string
        session.role = token.role as string;
        return session
      },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
