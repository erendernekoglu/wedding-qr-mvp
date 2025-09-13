/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { 
    serverActions: { bodySizeLimit: '50mb' },
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
module.exports = nextConfig
