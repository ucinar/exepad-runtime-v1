/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to avoid 404 errors
  productionBrowserSourceMaps: false,
  experimental: {
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['storage.googleapis.com','via.placeholder.com', 'images.unsplash.com','flowbite.s3.amazonaws.com','images.pexels.com','placehold.co','picsum.photos'],
  },
}

module.exports = nextConfig

// Initialize OpenNext Cloudflare for development
const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
