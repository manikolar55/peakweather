'use client'

import { WeatherIcon, getIconForCode } from '@/components/weather/WeatherIcon'
import { useUnits } from '@/lib/units'
import { toF } from '@/lib/utils'
import type { HourlyWeather } from '@/types'

interface Props {
  hourly: HourlyWeather
  hours?: number
}

export function HourlyStrip({ hourly, hours = 24 }: Props) {
  const { units } = useUnits()

  const items = hourly.time.slice(0, hours).map((t, i) => {
    const d = new Date(t)
    const hour = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    const temp = units.temp === 'F'
      ? Math.round(toF(hourly.temperature_2m[i]))
      : Math.round(hourly.temperature_2m[i])
    const icon = getIconForCode(hourly.weathercode[i], d.getHours() >= 6 && d.getHours() < 20)
    const precipProb = hourly.precipitation_probability[i] ?? 0
    return { hour, temp, icon, precipProb }
  })

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
      {items.map(({ hour, temp, icon, precipProb }, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 min-w-[56px] px-1 py-2 rounded-xl text-center text-xs hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        >
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {i === 0 ? 'Now' : hour}
          </span>
          <WeatherIcon icon={icon} size={28} />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{temp}°</span>
          {precipProb > 10 && (
            <span className="text-blue-500 text-[10px]">{precipProb}%</span>
          )}
        </div>
      ))}
    </div>
  )
}
