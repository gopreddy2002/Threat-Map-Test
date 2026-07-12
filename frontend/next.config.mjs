/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['cytoscape'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize images for Vercel
  images: {
    unoptimized: false,
  },
  // Enable SWR for API caching on the frontend
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      ],
    },
  ],
  // Vercel environment detection
  env: {
    NEXT_PUBLIC_API_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
};

export default nextConfig;
