import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'

// Static pages + treks only. City pages are in /sitemaps/[id] (route handlers).
// Submit /sitemap-index.xml to Google Search Console for full coverage.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  let treks: { slug: string; updatedAt: Date }[] = []
  try {
    treks = await db.trek.findMany({ select: { slug: true, updatedAt: true } })
  } catch {
    // DB unavailable at build time (no Neon URL) — sitemap still renders static pages
  }

  return [
    { url: BASE,                     changeFrequency: 'hourly',  priority: 1.0, lastModified: now },
    { url: `${BASE}/treks`,          changeFrequency: 'daily',   priority: 0.9, lastModified: now },
    { url: `${BASE}/radar`,          changeFrequency: 'hourly',  priority: 0.8, lastModified: now },
    { url: `${BASE}/about`,          changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/contact`,        changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy-policy`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE}/terms`,          changeFrequency: 'monthly', priority: 0.2 },
    ...treks.map((t) => ({
      url: `${BASE}/trek/${t.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.7,
      lastModified: t.updatedAt,
    })),
  ]
}
