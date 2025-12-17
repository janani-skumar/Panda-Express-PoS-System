import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Allow serving static files from public/docs folder
  async rewrites() {
    return [
      // Rewrite /docs/api/* to serve static TypeDoc files
      {
        source: '/docs/api/:path*',
        destination: '/docs/api/:path*',
      },
      // Rewrite /docs/manual/* to serve static docsify files
      {
        source: '/docs/manual/:path*',
        destination: '/docs/manual/:path*',
      },
    ];
  },
  
  // Headers for documentation files
  async headers() {
    return [
      {
        source: '/docs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
