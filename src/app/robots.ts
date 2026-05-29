import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl'

export default function robots(): MetadataRoute.Robots {
  // Gated and per-user routes are listed explicitly so crawl budget isn't
  // wasted on URLs that always redirect to login or render personalized
  // shells — Search Console reports those as "soft 404" and downranks the
  // domain. Disallowing them here is a hint, not a security boundary
  // (auth still enforces access).
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/brand',
          '/twitch',
          '/me',
          '/me/*',
          '/blog',
          '/blog/*',
          '/division-2/content',
          '/division-2/escalation',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Bytespider',
          'cohere-ai',
        ],
        disallow: '/',
      },
    ],
    host: getSiteUrl(),
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
