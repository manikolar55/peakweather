import type { CurrentWeather, HourlyWeather } from '@/types'

type Rating = 'Good' | 'Fair' | 'Poor'

interface ActivityRating {
  activity: string
  icon: string
  rating: Rating
  reason: string
}

function rateActivity(
  activity: 'running' | 'cycling' | 'hiking',
  current: CurrentWeather,
  hourly: HourlyWeather,
): ActivityRating {
  const icons = { running: '🏃', cycling: '🚴', hiking: '🥾' }
  const precipProb = hourly.precipitation_probability.slice(0, 12)
  const maxPrecipProb = Math.max(...precipProb)
  const codes = hourly.weathercode.slice(0, 12)
  const hasStorm = codes.some((c) => c >= 95)
  const hasRain = codes.some((c) => c >= 61 && c <= 82)
  const temp = current.temperature
  const wind = current.windspeed

  if (hasStorm) {
    return { activity, icon: icons[activity], rating: 'Poor', reason: 'Thunderstorms forecast' }
  }

  if (activity === 'running') {
    if (temp > 35 || temp < -5 || wind > 50 || maxPrecipProb > 70) return { activity, icon: icons[activity], rating: 'Poor', reason: temp > 35 ? 'Too hot' : temp < -5 ? 'Too cold' : wind > 50 ? 'Too windy' : 'High rain chance' }
    if (temp > 28 || temp < 2 || wind > 30 || hasRain) return { activity, icon: icons[activity], rating: 'Fair', reason: 'Suboptimal conditions' }
    return { activity, icon: icons[activity], rating: 'Good', reason: 'Good running conditions' }
  }

  if (activity === 'cycling') {
    if (temp > 38 || temp < -3 || wind > 40 || maxPrecipProb > 60 || hasRain) return { activity, icon: icons[activity], rating: 'Poor', reason: wind > 40 ? 'Too windy for cycling' : hasRain ? 'Wet roads' : temp > 38 ? 'Dangerous heat' : 'High rain chance' }
    if (temp > 30 || temp < 3 || wind > 25) return { activity, icon: icons[activity], rating: 'Fair', reason: 'Challenging conditions' }
    return { activity, icon: icons[activity], rating: 'Good', reason: 'Good cycling conditions' }
  }

  // hiking
  if (hasRain || maxPrecipProb > 70 || wind > 60) return { activity, icon: icons[activity], rating: 'Poor', reason: hasRain ? 'Rain expected' : 'Dangerous winds' }
  if (temp > 35 || temp < -8 || wind > 35 || maxPrecipProb > 40) return { activity, icon: icons[activity], rating: 'Fair', reason: 'Take precautions' }
  return { activity, icon: icons[activity], rating: 'Good', reason: 'Great hiking conditions' }
}

const ratingColors: Record<Rating, string> = {
  Good: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
  Fair: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700',
  Poor: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
}

interface Props {
  current: CurrentWeather
  hourly: HourlyWeather
}

export function OutdoorActivity({ current, hourly }: Props) {
  const activities = (['running', 'cycling', 'hiking'] as const).map((a) =>
    rateActivity(a, current, hourly)
  )

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Outdoor Activities Today</h2>
      <div className="grid grid-cols-3 gap-3">
        {activities.map(({ activity, icon, rating, reason }) => (
          <div key={activity} className={`rounded-xl border p-3 text-center text-sm ${ratingColors[rating]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="capitalize font-medium">{activity}</div>
            <div className="font-bold mt-0.5">{rating}</div>
            <div className="text-xs mt-1 opacity-80">{reason}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
