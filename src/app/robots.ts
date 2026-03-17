import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*', '/brand', '/twitch'],
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
    sitemap: 'https://roguearmy.xyz/sitemap.xml',
  }
}
