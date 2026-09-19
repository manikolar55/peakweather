import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { fetchWeather } from '@/lib/weather'
import { generateTrekVerdict } from '@/lib/claude'

const VERDICT_TTL_MS = 4 * 60 * 60 * 1000 // 4 hours
const RATE_LIMIT_MAP = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const times = (RATE_LIMIT_MAP.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (times.length >= RATE_LIMIT_MAX) return true
  times.push(now)
  RATE_LIMIT_MAP.set(ip, times)
  return false
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const trek = await db.trek.findUnique({
    where: { slug },
    include: { verdict: true },
  })

  if (!trek) {
    return NextResponse.json({ error: 'Trek not found' }, { status: 404 })
  }

  // Return cached verdict if still valid
  if (trek.verdict && trek.verdict.expiresAt > new Date()) {
    return NextResponse.json({
      cached: true,
      verdict: JSON.parse(trek.verdict.verdict),
    })
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const [trailheadWeather, summitWeather] = await Promise.all([
      fetchWeather(trek.lat, trek.lon, trek.trailheadElevation),
      fetchWeather(trek.lat, trek.lon, trek.summitElevation),
    ])

    const verdictData = await generateTrekVerdict(
      {
        ...trek,
        difficulty: trek.difficulty as 'easy' | 'moderate' | 'hard' | 'technical',
      },
      trailheadWeather,
      summitWeather,
    )

    // Upsert verdict in DB
    await db.trekVerdict.upsert({
      where: { trekId: trek.id },
      update: {
        verdict: JSON.stringify(verdictData),
        expiresAt: new Date(Date.now() + VERDICT_TTL_MS),
      },
      create: {
        trekId: trek.id,
        verdict: JSON.stringify(verdictData),
        expiresAt: new Date(Date.now() + VERDICT_TTL_MS),
      },
    })

    return NextResponse.json({ cached: false, verdict: verdictData })
  } catch (err) {
    console.error('Trek verdict error:', err)
    return NextResponse.json({ error: 'Failed to generate verdict' }, { status: 502 })
  }
}
