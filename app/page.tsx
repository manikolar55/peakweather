import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/ui/Header'
import { AdSlot } from '@/components/ads/AdSlot'
import { LocalWeatherWidget } from '@/components/home/LocalWeatherWidget'
import { CityCard } from '@/components/home/CityCard'
import { TrekCard } from '@/components/home/TrekCard'
import { fetchWeather } from '@/lib/weather'
import { db } from '@/lib/db'
import { UNIQUE_POPULAR_CITIES } from '@/lib/popular-cities'
import type { TrekVerdictData } from '@/types'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thepeakweather.com'

export const metadata: Metadata = {
  title: 'PeakWeather — Global Weather & AI Trek Forecasts',
  description: 'Accurate weather for every city in the world, with AI-powered safety verdicts for 100+ treks, trails, and summits.',
  alternates: { canonical: '/' },
}

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: BASE,
      name: 'PeakWeather',
      description: 'Global weather forecasts and AI-powered trek safety verdicts.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/weather/{search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE}/#organization`,
      name: 'PeakWeather',
      url: BASE,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE}/opengraph-image`,
        width: 1200,
        height: 630,
      },
    },
  ],
}

export const revalidate = 1800 // 30 minutes

async function getCitiesWithWeather() {
  const results = await Promise.allSettled(
    UNIQUE_POPULAR_CITIES.map(async (city) => {
      const weather = await fetchWeather(city.lat, city.lon)
      return { ...city, weather }
    }),
  )
  return results.map((r, i) => ({
    ...UNIQUE_POPULAR_CITIES[i],
    weather: r.status === 'fulfilled' ? r.value.weather : null,
  }))
}

type TrekWithVerdict = Awaited<ReturnType<typeof db.trek.findMany<{ include: { verdict: true } }>>>[number]

async function getPopularTreks() {
  let treks: TrekWithVerdict[] = []
  try {
    treks = await db.trek.findMany({
      where: { popular: true },
      include: { verdict: true },
      orderBy: { name: 'asc' },
      take: 8,
    })
  } catch {
    return []
  }

  return treks.map((t) => {
    let verdictData: TrekVerdictData | null = null
    if (t.verdict) {
      try {
        verdictData = JSON.parse(t.verdict.verdict) as TrekVerdictData
        if (t.verdict.expiresAt < new Date()) verdictData = null
      } catch {}
    }
    return { ...t, verdictData }
  })
}

export default async function HomePage() {
  const [cities, treks] = await Promise.all([getCitiesWithWeather(), getPopularTreks()])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <Header />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 via-blue-500 to-sky-400 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-900 py-10 sm:py-20 px-4">
          {/* decorative clouds */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-10 left-[5%] w-40 h-16 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute top-20 right-[10%] w-64 h-20 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Weather for Every City.<br />
              <span className="text-blue-200">AI Safety for Every Summit.</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Accurate global forecasts and Claude-powered GO / NO-GO verdicts for 100+ world treks.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 -mt-6 pb-16 space-y-12">
          {/* ── Local weather + ad ───────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LocalWeatherWidget />
            </div>
            <div className="lg:col-span-1">
              <AdSlot format="rectangle" className="h-full min-h-[180px] rounded-2xl" label="Advertisement" />
            </div>
          </div>

          {/* ── Popular cities ───────────────────────────────── */}
          <section>
            <SectionHeader title="Popular Cities" href={null} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <CityCard
                  key={city.slug}
                  name={city.name}
                  slug={city.slug}
                  country={city.country}
                  flag={city.flag}
                  weather={city.weather}
                />
              ))}
            </div>
          </section>

          {/* ── Ad between sections ──────────────────────────── */}
          <AdSlot format="leaderboard" className="min-h-[90px]" />

          {/* ── Popular treks ────────────────────────────────── */}
          <section>
            <SectionHeader title="Popular Treks Today" href="/treks" linkLabel="Browse all treks →" />


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {treks.map((trek) => (
                <TrekCard
                  key={trek.id}
                  name={trek.name}
                  slug={trek.slug}
                  country={trek.country}
                  region={trek.region}
                  summitElevation={trek.summitElevation}
                  difficulty={trek.difficulty}
                  verdict={trek.verdictData}
                />
              ))}
            </div>
          </section>

          {/* ── Features strip ───────────────────────────────── */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            {[
              { icon: '🌍', title: 'Global Coverage', body: 'Weather for any city worldwide via Open-Meteo.' },
              { icon: '🤖', title: 'AI Trek Verdicts', body: 'Claude evaluates summit conditions: GO, CAUTION, or NO-GO.' },
              { icon: '📡', title: 'Live Radar', body: 'Animated precipitation radar with RainViewer tiles.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center text-sm text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4 mb-4">
          <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-200">About</Link>
          <Link href="/treks" className="hover:text-gray-600 dark:hover:text-gray-200">Treks</Link>
          <Link href="/radar" className="hover:text-gray-600 dark:hover:text-gray-200">Radar</Link>
          <Link href="/privacy-policy" className="hover:text-gray-600 dark:hover:text-gray-200">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-200">Terms</Link>
          <Link href="/contact" className="hover:text-gray-600 dark:hover:text-gray-200">Contact</Link>
        </div>
        <p>Weather data: <a href="https://api.met.no/" className="underline">MET Norway</a> (CC BY 4.0) · Radar: RainViewer · AI: Anthropic Claude</p>
        <p className="mt-1 text-xs">AI verdicts are for guidance only — not a substitute for local guides or official warnings.</p>
      </footer>
    </>
  )
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string | null; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          {linkLabel ?? 'See all →'}
        </Link>
      )}
    </div>
  )
}
