/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['nextjs.org'],
  },
  output: 'standalone',
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true
  }
};

export default nextConfig;
