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
};

export default nextConfig;
