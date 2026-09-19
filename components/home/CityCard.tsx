import Link from 'next/link'
import { WeatherIcon, getIconForCode } from '@/components/weather/WeatherIcon'
import { getWeatherCondition } from '@/lib/utils'
import type { WeatherData } from '@/types'

interface Props {
  name: string
  slug: string
  country: string
  flag: string
  weather: WeatherData | null
}

export function CityCard({ name, slug, country, flag, weather }: Props) {
  const temp = weather ? Math.round(weather.current.temperature) : null
  const code = weather?.current.weathercode ?? 0
  const isDay = weather?.current.is_day === 1
  const condition = weather ? getWeatherCondition(code) : null
  const icon = getIconForCode(code, isDay)

  return (
    <Link
      href={`/weather/${slug}`}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
    >
      <span className="text-2xl">{flag}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {country}{condition ? ` · ${condition.label}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {weather && <WeatherIcon icon={icon} size={32} />}
        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {temp !== null ? `${temp}°` : '—'}
        </span>
      </div>
    </Link>
  )
}
