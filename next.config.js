/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ PERF: Tree-shake heavy icon/animation packages at build time
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',           // CloudFront CDN
      },
      {
        protocol: 'https',
        hostname: 'images.fragview.com',         // Your custom CloudFront domain (if you set one)
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',   // Google profile pics — keep as is
      },
    ],
  },

  // ✅ ADD SECURITY HEADERS
  async headers() {
    return [
      // ✅ PERF: Long-lived cache for immutable static assets (Next.js hashes filenames)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ✅ PERF: Cache public images/fonts for 1 week
      {
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://accounts.google.com https://*.cloudfront.net; frame-src 'self' https://accounts.google.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;