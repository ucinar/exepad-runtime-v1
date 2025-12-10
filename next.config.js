// Set up Cloudflare Pages development platform (optional)
if (process.env.NODE_ENV === 'development' && process.env.USE_CLOUDFLARE_DEV) {
  try {
    const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
    setupDevPlatform();
  } catch (e) {
    console.warn('Cloudflare dev platform not available:', e.message);
  }
}

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
