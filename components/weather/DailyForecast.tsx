'use client'

import { WeatherIcon, getIconForCode } from '@/components/weather/WeatherIcon'
import { useUnits } from '@/lib/units'
import { displayTemp, displayWind, formatDate, getWeatherCondition, kmhToMph, toF } from '@/lib/utils'
import type { DailyWeather } from '@/types'

interface Props {
  daily: DailyWeather
}

export function DailyForecast({ daily }: Props) {
  const { units } = useUnits()

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">14-Day Forecast</h2>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {daily.time.map((date, i) => {
          const condition = getWeatherCondition(daily.weathercode[i])
          const icon = getIconForCode(daily.weathercode[i], true)
          const high = units.temp === 'F' ? Math.round(toF(daily.temperature_2m_max[i])) : Math.round(daily.temperature_2m_max[i])
          const low = units.temp === 'F' ? Math.round(toF(daily.temperature_2m_min[i])) : Math.round(daily.temperature_2m_min[i])
          const wind = units.wind === 'mph'
            ? Math.round(kmhToMph(daily.windspeed_10m_max[i]))
            : Math.round(daily.windspeed_10m_max[i])
          const windUnit = units.wind === 'mph' ? 'mph' : 'km/h'
          const isToday = i === 0

          return (
            <div key={date} className={`flex items-center gap-3 py-2.5 text-sm ${isToday ? 'font-semibold' : ''}`}>
              <span className="w-10 sm:w-16 md:w-24 text-xs sm:text-sm text-gray-600 dark:text-gray-400 shrink-0">
                {isToday ? 'Today' : formatDate(date)}
              </span>
              <WeatherIcon icon={icon} size={28} />
              <span className="hidden sm:block text-gray-500 dark:text-gray-400 flex-1 truncate">{condition.label}</span>
              {daily.precipitation_probability_max[i] > 10 && (
                <span className="text-blue-500 text-xs w-10 text-right">
                  {daily.precipitation_probability_max[i]}%
                </span>
              )}
              <span className="text-gray-400 text-xs w-16 text-right hidden md:block">
                {wind} {windUnit}
              </span>
              <div className="flex gap-1 sm:gap-2 ml-auto items-center text-xs sm:text-sm">
                <span className="text-gray-900 dark:text-gray-100">{high}°</span>
                <span className="text-gray-400">/ {low}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
