import type { GeocodingResult, SearchResult, Trek } from '@/types'
import { db } from '@/lib/db'
import type { City } from '@prisma/client'

export function buildCitySlug(name: string, countryCode: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  return `${base}-${countryCode}`
}

function cityToGeo(c: City): GeocodingResult {
  return {
    id: c.id,
    name: c.name,
    latitude: c.lat,
    longitude: c.lon,
    elevation: 0,
    country: c.countryName,
    country_code: c.country.toLowerCase(),
    admin1: c.admin1 ?? undefined,
    slug: c.slug,
    timezone: c.timezone,
  }
}

export async function resolveCitySlug(slug: string): Promise<GeocodingResult | null> {
  const city = await db.city.findUnique({ where: { slug } })
  return city ? cityToGeo(city) : null
}

export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q || q.length < 2) return []

  const [treks, cities] = await Promise.all([
    db.trek.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { region: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
    db.city.findMany({
      where: {
        OR: [
          { asciiName: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { countryName: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { population: 'desc' },
      take: 5,
    }),
  ])

  const trekResults: SearchResult[] = treks.map((t) => ({
    type: 'trek',
    slug: t.slug,
    name: t.name,
    country: t.country,
    region: t.region,
    lat: t.lat,
    lon: t.lon,
  }))

  const cityResults: SearchResult[] = cities.map((c) => ({
    type: 'city',
    slug: c.slug,
    name: c.name,
    country: c.countryName,
    region: c.admin1 ?? undefined,
    lat: c.lat,
    lon: c.lon,
  }))

  return [...trekResults, ...cityResults]
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function findNearestCity(lat: number, lon: number): Promise<GeocodingResult | null> {
  // Fetch candidates within a ~1.5-degree bounding box then pick closest by Haversine
  const candidates = await db.city.findMany({
    where: {
      lat: { gte: lat - 1.5, lte: lat + 1.5 },
      lon: { gte: lon - 1.5, lte: lon + 1.5 },
    },
  })
  if (!candidates.length) return null
  const nearest = candidates
    .map((c) => ({ c, d: haversineKm(lat, lon, c.lat, c.lon) }))
    .sort((a, b) => a.d - b.d)[0]
  return cityToGeo(nearest.c)
}

export async function findTreksNearCity(lat: number, lon: number, maxKm = 250, limit = 5): Promise<Trek[]> {
  const allTreks = await db.trek.findMany()
  return allTreks
    .map((t) => ({ trek: t, dist: haversineKm(lat, lon, t.lat, t.lon) }))
    .filter(({ dist }) => dist <= maxKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(({ trek }) => ({ ...trek, difficulty: trek.difficulty as Trek['difficulty'] }))
}
