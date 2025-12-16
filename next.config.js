/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cqghbwmzxpuwxqnjvzhh.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig

