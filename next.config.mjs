/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static optimization works properly
  // output: 'standalone',
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Ensure proper static generation
  trailingSlash: false,
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Optimize images and assets
  images: {
    domains: ['api.mapbox.com'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  
  // Ensure proper transpilation
  transpilePackages: ['mapbox-gl'],
  
  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Changed to false to catch issues
  },
  
  // Add redirects if needed
  async redirects() {
    return []
  },
}

export default nextConfig
