/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'pdf.js-extract', 'canvas'],
  },
  // Optimize images for production
  images: {
    remotePatterns: [
      // Add specific domains you need to load images from
      // Example: Allow images from your CDN or storage provider
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn-domain.com',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 's3.amazonaws.com',
      // },
    ],
    // Disable remote patterns for now until specific domains are needed
    unoptimized: process.env.NODE_ENV === 'development',
  },
};
export default nextConfig;
