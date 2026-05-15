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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "xsgames.co",
      },
    ],
  },
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5050').replace(/\/$/, '');
    
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withNextIntl(nextConfig);
