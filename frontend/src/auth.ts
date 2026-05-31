import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "fallback-secret-for-development-only-12345678",
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "temp",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "temp",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            // Thay vì throw, mình log lỗi và trả về null để tránh redirect
            const errorData = await res.json().catch(() => ({}));
            console.warn("[NextAuth] Backend returned error:", res.status, errorData);
            return null;
          }

          const responseData = await res.json();
          const actualData = responseData.data?.[0];

          if (actualData?.user) {
            return {
              id: actualData.user.id,
              name: actualData.user.name,
              email: actualData.user.email,
              role: actualData.user.role,
              accessToken: actualData.access_token,
              refreshToken: actualData.refresh_token,
            };
          }
          return null;
        } catch (error) {
          console.error("[NextAuth] Network or Server Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Lần đầu đăng nhập
      if (user && account) {
        if (account.provider === "google") {
          try {
            const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/google/token`, {
              method: "POST",
              body: JSON.stringify({ token: account.id_token }),
              headers: { "Content-Type": "application/json" },
            });
            const responseData = await res.json();
            const actualData = responseData.data?.[0];

            if (actualData) {
              return {
                ...token,
                id: actualData.user.id,
                role: actualData.user.role,
                accessToken: actualData.access_token,
                refreshToken: actualData.refresh_token,
                accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 phút
              };
            }
          } catch (error) {
            console.error("Google Token Exchange Error:", error);
          }
        }

        return {
          ...token,
          id: user.id,
          role: (user as any).role,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + 14 * 60 * 1000, // 14 phút
        };
      }

      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // Kiểm tra hết hạn
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

/**
 * Hàm xử lý refresh token ngầm
 */
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${token.refreshToken}`,
      },
    });

    const responseData = await res.json();

    // Lấy data từ response (hỗ trợ cả dạng mảng và object)
    const actualData = responseData.data?.[0] || responseData;

    if (!res.ok || !actualData) {
      throw new Error(JSON.stringify(responseData));
    }

    return {
      ...token,
      accessToken: actualData.access_token,
      refreshToken: actualData.refresh_token,
      accessTokenExpires: Date.now() + 14 * 60 * 1000,
    };
  } catch (error) {
    console.error("[NextAuth] Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
