import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    // /sitemap-index lists all child sitemaps (static+treks + 34 city batches)
    sitemap: `${BASE}/sitemap-index`,
  }
}
