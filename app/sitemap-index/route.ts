import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BASE = process.env.SITE_URL ?? 'https://peakweather.peakweather.workers.dev'
const CHUNK = 5_000

export async function GET() {
  const cityCount = await db.city.count()
  const cityChunks = Math.ceil(cityCount / CHUNK)
  const ids = [0, ...Array.from({ length: cityChunks }, (_, i) => i + 1)]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${BASE}/sitemap.xml</loc></sitemap>`,
    ...ids.slice(1).map((id) => `  <sitemap><loc>${BASE}/sitemaps/${id}</loc></sitemap>`),
    '</sitemapindex>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
