'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WeatherIcon, getIconForCode } from '@/components/weather/WeatherIcon'
import { HourlyStrip } from '@/components/home/HourlyStrip'
import { useUnits } from '@/lib/units'
import { displayTemp, displayWind, degreesToCardinal, getWeatherCondition } from '@/lib/utils'
import type { WeatherData } from '@/types'
import type { GeocodingResult } from '@/types'

const DEFAULT = { lat: 51.5074, lon: -0.1278, name: 'London', country: 'United Kingdom', slug: 'london-gb' }

type Status = 'prompt' | 'locating' | 'loading' | 'done' | 'error' | 'denied'

interface LocationState {
  lat: number
  lon: number
  name: string
  country: string
  slug: string | null
  timezone?: string
}

export function LocalWeatherWidget() {
  const { units } = useUnits()
  const [loc, setLoc] = useState<LocationState | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [status, setStatus] = useState<Status>('prompt')
  const [permissionChecked, setPermissionChecked] = useState(false)

  async function loadWeather(lat: number, lon: number, name: string, country: string, slug: string | null, tz?: string) {
    setStatus('loading')
    try {
      const tzParam = tz ? `&tz=${encodeURIComponent(tz)}` : ''
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}${tzParam}`)
      if (!res.ok) throw new Error('failed')
      const data: WeatherData = await res.json()
      setWeather(data)
      setLoc({ lat, lon, name, country, slug })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  async function loadDefault() {
    const res = await fetch(`/api/weather?lat=${DEFAULT.lat}&lon=${DEFAULT.lon}`)
    if (res.ok) {
      setWeather(await res.json())
      setLoc(DEFAULT)
      setStatus('done')
    }
  }

  async function resolveCity(lat: number, lon: number): Promise<LocationState> {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`)
      if (res.ok) {
        const city: GeocodingResult = await res.json()
        return { lat, lon, name: city.name, country: city.country, slug: city.slug, timezone: city.timezone }
      }
    } catch {}
    return { lat, lon, name: 'Your Location', country: '', slug: null }
  }

  function requestLocation() {
    if (!navigator.geolocation) { loadDefault(); return }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        const resolved = await resolveCity(lat, lon)
        loadWeather(resolved.lat, resolved.lon, resolved.name, resolved.country, resolved.slug, resolved.timezone)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus('denied')
        else loadDefault()
      },
      { timeout: 10000 },
    )
  }

  // On mount: check if permission already granted — if so auto-load location silently
  useEffect(() => {
    if (!navigator.permissions) { setPermissionChecked(true); return }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermissionChecked(true)
      if (result.state === 'granted') requestLocation()
    }).catch(() => setPermissionChecked(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Prompt screen ────────────────────────────────────────────────────────────
  if (status === 'prompt' && permissionChecked) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 dark:from-blue-800 dark:to-indigo-950 text-white shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-5" style={{ minHeight: 220 }}>
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl">
            📍
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Get Your Local Weather</h2>
            <p className="text-blue-200 text-sm max-w-xs">
              Allow location access to see real-time weather for where you are right now.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <button
              onClick={requestLocation}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              📍 Allow Location
            </button>
            <button
              onClick={loadDefault}
              className="flex-1 bg-white/15 hover:bg-white/25 transition-colors px-5 py-2.5 rounded-xl text-sm font-medium"
            >
              Use London
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading / locating skeleton ──────────────────────────────────────────────
  if (status === 'prompt' || status === 'locating' || status === 'loading') {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 p-6 text-white" style={{ minHeight: 220 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <p className="text-sm font-medium">
            {status === 'locating' ? 'Getting your location…' : 'Loading weather…'}
          </p>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-40 bg-white/20 rounded" />
          <div className="h-14 w-28 bg-white/20 rounded" />
          <div className="h-4 w-56 bg-white/20 rounded" />
        </div>
      </div>
    )
  }

  // ── Denied screen ────────────────────────────────────────────────────────────
  if (status === 'denied') {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 dark:from-blue-800 dark:to-indigo-950 text-white shadow-xl overflow-hidden">
        <div className="p-6 flex flex-col items-center justify-center text-center gap-4" style={{ minHeight: 220 }}>
          <div className="text-3xl">🔒</div>
          <div>
            <h2 className="text-lg font-bold mb-1">Location Access Blocked</h2>
            <p className="text-blue-200 text-sm">
              Enable location in your browser settings, or browse a city directly.
            </p>
          </div>
          <button
            onClick={loadDefault}
            className="bg-white/15 hover:bg-white/25 transition-colors px-5 py-2 rounded-xl text-sm font-medium"
          >
            Show London instead
          </button>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (status === 'error' || !weather || !loc) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-xl p-6 flex items-center justify-center" style={{ minHeight: 220 }}>
        <div className="text-center">
          <p className="text-blue-200 mb-3 text-sm">Couldn&apos;t load weather.</p>
          <button onClick={loadDefault} className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm">
            Try London
          </button>
        </div>
      </div>
    )
  }

  // ── Weather display ──────────────────────────────────────────────────────────
  const { current, hourly, timezone } = weather
  const condition = getWeatherCondition(current.weathercode)
  const icon = getIconForCode(current.weathercode, current.is_day === 1)
  const localTime = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 dark:from-blue-800 dark:to-indigo-950 text-white shadow-xl overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold truncate">{loc.name}</h2>
              <button
                onClick={requestLocation}
                title="Detect my location"
                className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-sm"
              >
                📍
              </button>
            </div>
            {loc.country && <p className="text-blue-200 text-sm">{loc.country}</p>}
            <p className="text-blue-200 text-xs mt-0.5">{localTime}</p>
          </div>
          <WeatherIcon icon={icon} size={48} />
        </div>

        <div className="flex items-end gap-3 mb-4 w-full">
          <span className="text-4xl sm:text-6xl font-thin shrink-0">{displayTemp(current.temperature, units.temp)}</span>
          <div className="mb-1 min-w-0">
            <p className="text-blue-100 text-sm">Feels {displayTemp(current.apparent_temperature, units.temp)}</p>
            <p className="font-medium text-sm truncate">{condition.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-5 w-full">
          <div>
            <p className="text-blue-300">Humidity</p>
            <p className="font-semibold">{current.relativehumidity}%</p>
          </div>
          <div>
            <p className="text-blue-300">Wind</p>
            <p className="font-semibold truncate">{displayWind(current.windspeed, units.wind)} {degreesToCardinal(current.winddirection)}</p>
          </div>
          <div>
            <p className="text-blue-300">Visibility</p>
            <p className="font-semibold">{(current.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-2 sm:p-3 w-full overflow-x-auto">
          <HourlyStrip hourly={hourly} hours={12} />
        </div>
      </div>

      {loc.slug ? (
        <Link
          href={`/weather/${loc.slug}`}
          className="block bg-white/10 hover:bg-white/20 transition-colors text-center py-2.5 text-sm font-medium"
        >
          Full forecast for {loc.name} →
        </Link>
      ) : (
        <div className="bg-white/10 text-center py-2.5 text-sm text-blue-200">
          Showing weather for your current location
        </div>
      )}
    </div>
  )
}
