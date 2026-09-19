import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/ui/Header'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { HourlyChart } from '@/components/weather/HourlyChart'
import { DailyForecast } from '@/components/weather/DailyForecast'
import { AirQualityCard } from '@/components/weather/AirQualityCard'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { OutdoorActivity } from '@/components/weather/OutdoorActivity'
import { SunMoonCard } from '@/components/weather/SunMoonCard'
import { UvIndexCard } from '@/components/weather/UvIndexCard'
import { TreksNearCity } from '@/components/weather/TreksNearCity'
import { RadarMap } from '@/components/map/RadarMap'
import { AdSlot } from '@/components/ads/AdSlot'
import { fetchWeather } from '@/lib/weather'
import { fetchAirQuality } from '@/lib/air-quality'
import { resolveCitySlug, findTreksNearCity } from '@/lib/geocoding'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const geo = await resolveCitySlug(slug)
  if (!geo) return { title: 'City Not Found' }
  return {
    title: `${geo.name} Weather Today & 14-Day Forecast`,
    description: `Current conditions, hourly and 14-day weather forecast for ${geo.name}, ${geo.country}. Air quality, UV index, radar, and more.`,
    alternates: { canonical: `/weather/${slug}` },
    openGraph: {
      title: `${geo.name} Weather | PeakWeather`,
      description: `Live weather for ${geo.name}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${geo.name} Weather — PeakWeather` }],
    },
  }
}

export const revalidate = 900

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'

export default async function CityPage({ params }: Props) {
  const { slug } = await params
  const geo = await resolveCitySlug(slug)
  if (!geo) notFound()

  const [weather, aq, nearbyTreks] = await Promise.all([
    fetchWeather(geo.latitude, geo.longitude, undefined, geo.timezone),
    fetchAirQuality(geo.latitude, geo.longitude).catch(() => null),
    findTreksNearCity(geo.latitude, geo.longitude).catch(() => []),
  ])

  const todayIndex = 0
  const sunrise = weather.daily.sunrise?.[todayIndex] ?? ''
  const sunset  = weather.daily.sunset?.[todayIndex] ?? ''

  const locationLabel = [geo.admin1, geo.country].filter(Boolean).join(', ')
  const pageUrl = `${BASE}/weather/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: `${geo.name} Weather`, item: pageUrl },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: `${geo.name} Weather Today & 14-Day Forecast`,
        description: `Current conditions, hourly and 14-day weather forecast for ${geo.name}, ${geo.country}.`,
        isPartOf: { '@type': 'WebSite', name: 'PeakWeather', url: BASE },
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

        <WeatherAlerts hourly={weather.hourly} daily={weather.daily} />

        <CurrentWeatherCard
          current={weather.current}
          cityName={geo.name}
          country={locationLabel}
          elevation={Math.round(geo.elevation)}
          timezone={weather.timezone}
        />

        <AdSlot format="leaderboard" className="min-h-[90px]" />

        <HourlyChart hourly={weather.hourly} />

        <DailyForecast daily={weather.daily} />

        <div className="grid gap-4 md:grid-cols-3">
          {aq ? <AirQualityCard aq={aq} /> : null}
          <UvIndexCard uvIndex={weather.daily.uv_index_max?.[0] ?? 0} />
          <SunMoonCard
            sunrise={sunrise}
            sunset={sunset}
            timezone={weather.timezone}
            date={weather.daily.time?.[0] ?? new Date().toISOString()}
          />
        </div>

        <OutdoorActivity current={weather.current} hourly={weather.hourly} />

        <AdSlot format="rectangle" className="min-h-[250px]" />

        <RadarMap lat={geo.latitude} lon={geo.longitude} />

        <TreksNearCity treks={nearbyTreks} />

        {/* MET Norway attribution (CC BY 4.0 licence) */}
        <p className="text-xs text-center text-gray-400 pt-2">
          Weather data:{' '}
          <a href="https://api.met.no/" className="underline" target="_blank" rel="noopener noreferrer">
            MET Norway Locationforecast 2.0
          </a>{' '}
          (CC BY 4.0)
        </p>
      </main>
    </>
  )
}
