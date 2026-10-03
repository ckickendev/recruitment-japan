import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/jobs',
        destination: '/tin-tuyen-dung',
      },
      {
        source: '/jobs/:slug',
        destination: '/tin-tuyen-dung/:slug',
      },
    ];
  },
};

export default nextConfig;
