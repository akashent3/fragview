import { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt
 * ─────────────────
 * • Allows Google, Bing, and all major AI crawlers (GPTBot, Claude, Perplexity, etc.)
 * • Blocks private/auth/admin routes from all crawlers
 * • Points all crawlers to the sitemap for efficient indexing
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

  return {
    rules: [
      // ── Default rule: allow public content, block private routes ──
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/wardrobe/',
          '/profile/',
          '/settings/',
          '/notifications/',
          '/alerts/',
          '/signin',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/email-preview/',
          '/u/', // user profile pages (private)
        ],
      },

      // ── Explicitly welcome AI crawlers ──
      // These rules tell AI models they can index your public content
      {
        userAgent: [
          'GPTBot',           // OpenAI / ChatGPT
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',    // Perplexity AI
          'anthropic-ai',     // Anthropic / Claude
          'Claude-Web',
          'ClaudeBot',
          'CCBot',            // Common Crawl (used by many AI training sets)
          'Googlebot',        // Google Search + Bard
          'Bingbot',          // Bing + Copilot
          'DuckDuckBot',
          'ia_archiver',      // Internet Archive / Wayback Machine
        ],
        allow: [
          '/',
          '/perfumes/',
          '/brands/',
          '/drydown/',
          '/discover/',
          '/search/',
          '/contact/',
          '/submit/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/wardrobe/',
          '/profile/',
          '/settings/',
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
