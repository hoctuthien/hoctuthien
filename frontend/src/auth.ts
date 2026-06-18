import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

type BackendAuthPayload = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  access_token?: string;
  refresh_token?: string;
};

function extractAuthPayload(responseData: any): BackendAuthPayload | null {
  const payload = Array.isArray(responseData?.data)
    ? responseData.data[0]
    : responseData?.data ?? responseData;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return payload as BackendAuthPayload;
}

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
          let deviceId: string | undefined;
          try {
            const { cookies } = require("next/headers");
            const cookieStore = await cookies();
            deviceId = cookieStore.get("device_id")?.value;
          } catch (e) {
            // Ignored
          }

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (deviceId) {
            headers["x-device-id"] = deviceId;
          }

          const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers,
          });

          if (!res.ok) {
            // Thay vì throw, mình log lỗi và trả về null để tránh redirect
            const errorData = await res.json().catch(() => ({}));
            console.warn("[NextAuth] Backend returned error:", res.status, errorData);
            return null;
          }

          const responseData = await res.json();
          const actualData = extractAuthPayload(responseData);

          if (actualData?.user) {
            return {
              id: actualData.user.id,
              name: actualData.user.name,
              email: actualData.user.email,
              role: actualData.user.role,
              accessToken: actualData.access_token,
              refreshToken: actualData.refresh_token,
              deviceId: deviceId || "unknown",
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
            let deviceId: string | undefined;
            try {
              const { cookies } = require("next/headers");
              const cookieStore = await cookies();
              deviceId = cookieStore.get("device_id")?.value;
            } catch (e) {
              // Ignored
            }

            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (deviceId) {
              headers["x-device-id"] = deviceId;
            }

            const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/google/token`, {
              method: "POST",
              body: JSON.stringify({ token: account.id_token }),
              headers,
            });
            const responseData = await res.json();
            const actualData = extractAuthPayload(responseData);

            if (actualData?.user) {
              return {
                ...token,
                id: actualData.user.id,
                role: actualData.user.role,
                accessToken: actualData.access_token,
                refreshToken: actualData.refresh_token,
                deviceId: deviceId || "unknown",
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
          deviceId: (user as any).deviceId || "unknown",
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
    if (!token.refreshToken) {
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    let deviceId = token.deviceId;
    if (!deviceId) {
      try {
        const { cookies } = require("next/headers");
        const cookieStore = await cookies();
        deviceId = cookieStore.get("device_id")?.value;
      } catch (e) {
        // Ignored
      }
    }

    const cookieParts = [`refresh_token=${token.refreshToken}`];
    if (deviceId) {
      cookieParts.push(`device_id=${deviceId}`);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: cookieParts.join("; "),
    };

    if (deviceId) {
      headers["x-device-id"] = deviceId;
    }

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/auths/refresh`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    const responseData = await res.json().catch(() => null);
    const actualData = extractAuthPayload(responseData);

    if (!res.ok || !actualData?.access_token || !actualData?.refresh_token) {
      console.error("[NextAuth] Refresh token response error:", {
        status: res.status,
        responseData,
      });
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    return {
      ...token,
      accessToken: actualData.access_token,
      refreshToken: actualData.refresh_token,
      deviceId: deviceId || token.deviceId || "unknown",
      accessTokenExpires: Date.now() + 14 * 60 * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("[NextAuth] Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
