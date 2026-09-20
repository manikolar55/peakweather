import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { WeatherData, AirQualityData, GeocodingResult } from '@/types'
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

function weatherDesc(code: number): string {
  if (code === 0) return 'clear skies'
  if (code === 1) return 'mainly clear'
  if (code === 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code <= 48) return 'foggy conditions'
  if (code <= 55) return 'drizzle'
  if (code <= 65) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain showers'
  if (code <= 86) return 'snow showers'
  if (code >= 95) return 'thunderstorms'
  return 'mixed conditions'
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

function CityFAQ({ geo, weather, aq }: { geo: GeocodingResult; weather: WeatherData; aq: AirQualityData | null }) {
  const temp = Math.round(weather.current.temperature)
  const feelsLike = Math.round(weather.current.apparent_temperature)
  const todayHigh = Math.round(weather.daily.temperature_2m_max[0])
  const todayLow = Math.round(weather.daily.temperature_2m_min[0])
  const precipChance = weather.daily.precipitation_probability_max[0] ?? 0
  const uv = weather.daily.uv_index_max[0] ?? 0
  const windspeed = Math.round(weather.current.windspeed)
  const humidity = weather.current.relativehumidity
  const condition = weatherDesc(weather.current.weathercode)
  const currentAqi = aq?.hourly.us_aqi?.[0] ?? null

  const goodDaysThisWeek = weather.daily.precipitation_probability_max
    .slice(0, 7)
    .filter((p, i) => p < 40 && (weather.daily.weathercode[i] ?? 0) < 61).length

  const locationLabel = [geo.admin1, geo.country].filter(Boolean).join(', ')

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        What is the weather in {geo.name} today?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        Currently {geo.name}, {locationLabel} has {condition} with a temperature of {temp}°C (feels like {feelsLike}°C).
        Today&apos;s high will reach {todayHigh}°C and the overnight low will drop to {todayLow}°C.
        Wind speed is {windspeed} km/h with relative humidity at {humidity}%.
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Is it going to rain in {geo.name} today?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {precipChance >= 70
          ? `High likelihood of rain today in ${geo.name} — there is a ${precipChance}% chance of precipitation. Carry an umbrella and expect wet conditions.`
          : precipChance >= 40
          ? `There is a ${precipChance}% chance of rain in ${geo.name} today. Conditions could turn wet — a light jacket or umbrella is advisable.`
          : `Low rain risk in ${geo.name} today with only a ${precipChance}% chance of precipitation. Conditions are expected to remain mostly dry.`}
      </p>

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        What is the UV index in {geo.name} today?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        The UV index in {geo.name} today is {uv} ({uvLabel(uv)}).{' '}
        {uv >= 8
          ? 'UV levels are very high — apply SPF 30+ sunscreen, wear protective clothing, and avoid direct sun between 10am and 4pm.'
          : uv >= 6
          ? 'UV levels are high — sunscreen and a hat are recommended if spending time outdoors.'
          : uv >= 3
          ? 'UV levels are moderate — sunscreen is advisable for extended outdoor activities.'
          : 'UV levels are low — minimal sun protection required for most people.'}
      </p>

      {currentAqi !== null && (
        <>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            What is the air quality in {geo.name} right now?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The current US AQI in {geo.name} is {currentAqi} — rated <strong>{aqiLabel(currentAqi)}</strong>.{' '}
            {currentAqi <= 50
              ? 'Air quality is good and poses little to no risk. Perfect conditions for outdoor activities.'
              : currentAqi <= 100
              ? 'Air quality is acceptable. Unusually sensitive individuals may experience minor respiratory symptoms.'
              : currentAqi <= 150
              ? 'Members of sensitive groups (children, elderly, those with respiratory conditions) may experience health effects. General public is unlikely to be affected.'
              : 'Air quality is unhealthy. Everyone may begin to experience adverse health effects. Limit prolonged outdoor exertion.'}
          </p>
        </>
      )}

      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Is {geo.name} good to visit this week?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {goodDaysThisWeek >= 5
          ? `This week looks excellent for visiting ${geo.name} — ${goodDaysThisWeek} out of the next 7 days are forecast to be dry and clear. Great conditions for sightseeing and outdoor activities.`
          : goodDaysThisWeek >= 3
          ? `${geo.name} has a mixed week ahead with ${goodDaysThisWeek} good days out of 7. Plan outdoor activities around the clearer days shown in the 14-day forecast above.`
          : `${geo.name} is heading into a predominantly wet or unsettled week with only ${goodDaysThisWeek} good days forecast. Pack rain gear and plan indoor alternatives.`}
        {' '}Check the hourly chart and 14-day forecast above for the best windows.
      </p>
    </section>
  )
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
      url: `/weather/${slug}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${geo.name} Weather — PeakWeather` }],
    },
  }
}

export const revalidate = 900

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thepeakweather.com'

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
        isPartOf: { '@id': `${BASE}/#website` },
      },
      {
        '@type': 'City',
        name: geo.name,
        containedInPlace: { '@type': 'Country', name: geo.country },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: geo.latitude,
          longitude: geo.longitude,
          elevation: Math.round(geo.elevation),
        },
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

        {/* ── City FAQ ─────────────────────────────────────────────────── */}
        <CityFAQ geo={geo} weather={weather} aq={aq} />

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
