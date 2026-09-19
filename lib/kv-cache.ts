/**
 * Weather cache abstraction.
 * - Cloudflare Workers: reads/writes the WEATHER_CACHE KV binding.
 * - Local dev (Next.js): falls back to the DB WeatherCache model.
 */
import { db } from '@/lib/db'

const TTL_MS = 30 * 60 * 1000       // 30 minutes
const TTL_S  = TTL_MS / 1000

interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

interface CacheEntry {
  data: string
  lastModified: string | null
}

function getKV(): KVNamespace | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getCloudflareContext().env as any).WEATHER_CACHE ?? null
  } catch {
    return null
  }
}

export async function cacheGet(key: string): Promise<CacheEntry | null> {
  const kv = getKV()
  if (kv) {
    try {
      const raw = await kv.get(key)
      if (!raw) return null
      return JSON.parse(raw) as CacheEntry
    } catch { return null }
  }

  try {
    const row = await db.weatherCache.findUnique({ where: { key } })
    if (!row || row.expiresAt < new Date()) return null
    return { data: row.data, lastModified: row.lastModified ?? null }
  } catch {
    return null // DB not available (e.g., build without Neon URL) — cache miss
  }
}

export async function cacheSet(key: string, entry: CacheEntry): Promise<void> {
  const kv = getKV()
  if (kv) {
    try { await kv.put(key, JSON.stringify(entry), { expirationTtl: TTL_S }) } catch { /* non-fatal */ }
    return
  }

  try {
    const expiresAt = new Date(Date.now() + TTL_MS)
    await db.weatherCache.upsert({
      where: { key },
      update: { data: entry.data, expiresAt, lastModified: entry.lastModified, fetchedAt: new Date() },
      create: { key, data: entry.data, expiresAt, lastModified: entry.lastModified },
    })
  } catch { /* non-fatal — next request will re-fetch */ }
}

export async function cacheExtend(key: string, entry: CacheEntry): Promise<void> {
  const kv = getKV()
  if (kv) {
    try { await kv.put(key, JSON.stringify(entry), { expirationTtl: TTL_S }) } catch { /* non-fatal */ }
    return
  }

  try {
    await db.weatherCache.update({
      where: { key },
      data: { expiresAt: new Date(Date.now() + TTL_MS) },
    })
  } catch { /* non-fatal */ }
}
