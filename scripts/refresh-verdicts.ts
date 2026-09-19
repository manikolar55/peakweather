/**
 * Pre-generate AI verdicts for all popular treks.
 * Run with: npm run refresh-verdicts
 */
import { db } from '@/lib/db'
import { fetchWeather } from '@/lib/weather'
import { generateTrekVerdict } from '@/lib/claude'

const VERDICT_TTL_MS = 4 * 60 * 60 * 1000

async function main() {
  const treks = await db.trek.findMany({ where: { popular: true } })
  console.log(`Refreshing verdicts for ${treks.length} popular treks...`)

  for (const trek of treks) {
    try {
      const [trailheadWeather, summitWeather] = await Promise.all([
        fetchWeather(trek.lat, trek.lon, trek.trailheadElevation),
        fetchWeather(trek.lat, trek.lon, trek.summitElevation),
      ])

      const verdictData = await generateTrekVerdict(
        { ...trek, difficulty: trek.difficulty as 'easy' | 'moderate' | 'hard' | 'technical' },
        trailheadWeather,
        summitWeather,
      )

      await db.trekVerdict.upsert({
        where: { trekId: trek.id },
        update: { verdict: JSON.stringify(verdictData), expiresAt: new Date(Date.now() + VERDICT_TTL_MS) },
        create: { trekId: trek.id, verdict: JSON.stringify(verdictData), expiresAt: new Date(Date.now() + VERDICT_TTL_MS) },
      })

      console.log(`✓ ${trek.name}`)
    } catch (err) {
      console.error(`✗ ${trek.name}:`, err)
    }
  }

  console.log('Done.')
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
