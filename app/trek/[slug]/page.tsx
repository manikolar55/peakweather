import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { HourlyChart } from '@/components/weather/HourlyChart'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { AdSlot } from '@/components/ads/AdSlot'
import { VerdictPanel } from '@/components/trek/VerdictPanel'
import { fetchWeather } from '@/lib/weather'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
  moderate:  'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950',
  hard:      'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950',
  technical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const trek = await db.trek.findUnique({ where: { slug } })
  if (!trek) return { title: 'Trek Not Found' }
  return {
    title: `${trek.name} Weather & AI Safety Verdict`,
    description: `AI-powered GO/CAUTION/NO-GO safety verdict, summit weather, and 14-day forecast for ${trek.name} in ${trek.country}.`,
    alternates: { canonical: `/trek/${slug}` },
    openGraph: {
      title: `${trek.name} | PeakWeather`,
      description: `Summit weather and AI safety verdict for ${trek.name}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${trek.name} — PeakWeather` }],
    },
  }
}

export const revalidate = 900

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'

export default async function TrekPage({ params }: Props) {
  const { slug } = await params

  const trek = await db.trek.findUnique({ where: { slug }, include: { verdict: true } })
  if (!trek) notFound()

  // Fetch trailhead weather for display (summit weather is fetched inside the verdict API)
  const weather = await fetchWeather(trek.lat, trek.lon, trek.trailheadElevation)

  const diffCls = DIFFICULTY_COLORS[trek.difficulty] ?? 'text-gray-600 bg-gray-100'

  const pageUrl = `${BASE}/trek/${slug}`
  const treksUrl = `${BASE}/treks`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Treks', item: treksUrl },
          { '@type': 'ListItem', position: 3, name: trek.name, item: pageUrl },
        ],
      },
      {
        '@type': 'TouristAttraction',
        '@id': pageUrl,
        url: pageUrl,
        name: trek.name,
        description: trek.description,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: trek.lat,
          longitude: trek.lon,
          elevation: trek.summitElevation,
        },
        containedInPlace: { '@type': 'Country', name: trek.country },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'difficulty', value: trek.difficulty },
          { '@type': 'PropertyValue', name: 'durationDays', value: trek.durationDays },
          { '@type': 'PropertyValue', name: 'summitElevationMeters', value: trek.summitElevation },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="max-w-5xl mx-auto px-4 pb-12 pt-6 space-y-4">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/treks" className="hover:text-blue-600 dark:hover:text-blue-400">Treks</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 dark:text-gray-100">{trek.name}</span>
        </nav>

        {/* ── Trek hero ───────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                {trek.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {trek.country} · {trek.region}
              </p>
            </div>
            <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold capitalize ${diffCls}`}>
              {trek.difficulty}
            </span>
          </div>

          <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">{trek.description}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Stat icon="⛰" label="Trailhead" value={`${trek.trailheadElevation.toLocaleString()}m`} />
            <Stat icon="🏔" label="Summit"    value={`${trek.summitElevation.toLocaleString()}m`} />
            <Stat icon="📅" label="Duration"  value={`${trek.durationDays} day${trek.durationDays > 1 ? 's' : ''}`} />
            <Stat icon="🌍" label="Country"   value={trek.country} />
          </div>
        </section>

        {/* ── AI Verdict (client component, auto-fetches) ──────────────── */}
        <VerdictPanel slug={slug} />

        {/* ── Alerts ──────────────────────────────────────────────────── */}
        <WeatherAlerts hourly={weather.hourly} daily={weather.daily} />

        {/* ── Ad ──────────────────────────────────────────────────────── */}
        <AdSlot format="leaderboard" className="min-h-[90px]" />

        {/* ── Trailhead current conditions ─────────────────────────────── */}
        <CurrentWeatherCard
          current={weather.current}
          cityName="Trailhead Conditions"
          country={`${trek.region}, ${trek.country}`}
          elevation={trek.trailheadElevation}
          timezone="UTC"
        />

        {/* ── Hourly chart ─────────────────────────────────────────────── */}
        <HourlyChart hourly={weather.hourly} />

        {/* ── 14-day forecast ──────────────────────────────────────────── */}
        <DailyForecast daily={weather.daily} />

        {/* ── Ad ──────────────────────────────────────────────────────── */}
        <AdSlot format="rectangle" className="min-h-[250px]" />

        {/* ── Attribution ─────────────────────────────────────────────── */}
        <p className="text-xs text-center text-gray-400 pt-2">
          Weather data:{' '}
          <a href="https://api.met.no/" className="underline" target="_blank" rel="noopener noreferrer">
            MET Norway Locationforecast 2.0
          </a>{' '}
          (CC BY 4.0) · AI verdicts by Anthropic Claude
        </p>
      </main>
    </>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm">
      <span>{icon}</span>
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}
