import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * next-intl Plugin Setup
 *
 * createNextIntlPlugin() tự động tìm file `src/i18n/request.ts`
 * và link nó vào Next.js build pipeline.
 *
 * Nếu file ở vị trí khác, truyền path:
 *   createNextIntlPlugin('./custom/path/request.ts')
 */
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5050').replace(/\/$/, '');
    
    return [
      {
        // Chuyển hướng các request API sang backend, TRỪ các endpoint của NextAuth (/api/auth/*)
        source: '/api/((?!auth).*)',
        destination: `${backendUrl}/api/:1*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
