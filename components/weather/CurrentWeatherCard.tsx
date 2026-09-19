'use client'

import { WeatherIcon, getIconForCode } from '@/components/weather/WeatherIcon'
import { useUnits } from '@/lib/units'
import { displayTemp, displayWind, degreesToCardinal, getWeatherCondition } from '@/lib/utils'
import type { CurrentWeather } from '@/types'

interface Props {
  current: CurrentWeather
  cityName: string
  country: string
  elevation: number
  timezone: string
}

export function CurrentWeatherCard({ current, cityName, country, elevation, timezone }: Props) {
  const { units } = useUnits()
  const condition = getWeatherCondition(current.weathercode)
  const icon = getIconForCode(current.weathercode, current.is_day === 1)

  const now = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-950 text-white p-6 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{cityName}</h1>
          <p className="text-blue-200 text-sm">{country} · {elevation}m</p>
          <p className="text-blue-200 text-sm mt-1">{now}</p>
        </div>
        <WeatherIcon icon={icon} size={64} />
      </div>

      <div className="mt-4 flex items-end gap-4">
        <span className="text-7xl font-thin">{displayTemp(current.temperature, units.temp)}</span>
        <div className="mb-2">
          <p className="text-blue-100 text-sm">Feels like {displayTemp(current.apparent_temperature, units.temp)}</p>
          <p className="text-blue-100 font-medium">{condition.label}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-6 sm:grid-cols-4 text-sm">
        <Stat label="Humidity" value={`${current.relativehumidity}%`} />
        <Stat label="Wind" value={`${displayWind(current.windspeed, units.wind)} ${degreesToCardinal(current.winddirection)}`} />
        <Stat label="Gusts" value={displayWind(current.windgusts, units.wind)} />
        <Stat label="Pressure" value={`${Math.round(current.surface_pressure)} hPa`} />
        <Stat label="Dew Point" value={displayTemp(current.dewpoint, units.temp)} />
        <Stat label="Cloud Cover" value={`${current.cloudcover}%`} />
        <Stat label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
        <Stat label="Precip" value={`${current.precipitation} mm`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-blue-300 text-xs uppercase tracking-wide">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
