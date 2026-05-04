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
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
