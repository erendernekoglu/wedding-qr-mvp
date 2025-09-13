/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '50mb' } },
  srcDir: 'src'
}
module.exports = nextConfig
