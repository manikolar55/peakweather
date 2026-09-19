import { db } from '@/lib/db'

const KEY = () => process.env.OPENWEATHER_API_KEY ?? ''
const BASE = 'https://api.openweathermap.org'
const MAX_CALLS = 950
const TIMEOUT_MS = 8_000

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

async function canCall(): Promise<boolean> {
  if (!KEY()) return false
  const date = todayUTC()
  const row = await db.oWMDailyCounter.findUnique({ where: { date } })
  return !row || row.count < MAX_CALLS
}

async function increment(): Promise<void> {
  const date = todayUTC()
  await db.oWMDailyCounter.upsert({
    where: { date },
    update: { count: { increment: 1 } },
    create: { date, count: 1 },
  })
}

export interface OWMAirData {
  pm2_5: number
  pm10: number
  o3: number
  aqi: number // OWM 1–5 scale
}

export async function fetchOWMAirPollution(lat: number, lon: number): Promise<OWMAirData | null> {
  if (!(await canCall())) return null

  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const url = `${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${KEY()}`
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
    clearTimeout(tid)
    if (!res.ok) return null

    type OWMEntry = { main: { aqi: number }; components: Record<string, number> }
    const data = await res.json() as { list: OWMEntry[] }
    await increment()

    const entry = data.list?.[0]
    if (!entry) return null

    return {
      pm2_5: entry.components.pm2_5 ?? 0,
      pm10: entry.components.pm10 ?? 0,
      o3: entry.components.o3 ?? 0,
      aqi: entry.main.aqi,
    }
  } catch {
    clearTimeout(tid)
    return null
  }
}
