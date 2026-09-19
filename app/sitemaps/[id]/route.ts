import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'
const CHUNK = 5_000

function urlTag(loc: string) {
  return `  <url>\n    <loc>${loc}</loc>\n  </url>`
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params
  const id = Number(rawId)

  if (isNaN(id) || id < 1) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const cities = await db.city.findMany({
    select: { slug: true },
    orderBy: { population: 'desc' },
    skip: (id - 1) * CHUNK,
    take: CHUNK,
  })

  if (cities.length === 0) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const entries = cities.map((c) => urlTag(`${BASE}/weather/${c.slug}`))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
