import type { DailyWeather, HourlyWeather } from '@/types'

interface Alert {
  type: 'warning' | 'danger'
  title: string
  message: string
}

function generateAlerts(hourly: HourlyWeather, daily: DailyWeather): Alert[] {
  const alerts: Alert[] = []
  const next24Codes = hourly.weathercode.slice(0, 24)
  const next24Wind = hourly.windspeed_10m.slice(0, 24)
  const next24Temp = hourly.temperature_2m.slice(0, 24)
  const next24Precip = hourly.precipitation.slice(0, 24)

  // Thunderstorm
  if (next24Codes.some((c) => c >= 95)) {
    alerts.push({ type: 'danger', title: 'Thunderstorm Warning', message: 'Thunderstorms expected in the next 24 hours. Avoid outdoor activities.' })
  }

  // Strong wind
  const maxWind = Math.max(...next24Wind)
  if (maxWind > 70) {
    alerts.push({ type: 'danger', title: 'Strong Wind Warning', message: `Wind gusts up to ${Math.round(maxWind)} km/h expected. Secure loose objects.` })
  } else if (maxWind > 50) {
    alerts.push({ type: 'warning', title: 'Wind Advisory', message: `Sustained winds of ${Math.round(maxWind)} km/h expected today.` })
  }

  // Extreme heat
  const maxTemp = Math.max(...next24Temp)
  if (maxTemp >= 40) {
    alerts.push({ type: 'danger', title: 'Extreme Heat Warning', message: `Temperature reaching ${Math.round(maxTemp)}°C. Stay hydrated and avoid sun exposure.` })
  } else if (maxTemp >= 35) {
    alerts.push({ type: 'warning', title: 'Heat Advisory', message: `High temperature of ${Math.round(maxTemp)}°C forecast. Take precautions.` })
  }

  // Extreme cold
  const minTemp = Math.min(...next24Temp)
  if (minTemp <= -15) {
    alerts.push({ type: 'danger', title: 'Extreme Cold Warning', message: `Temperature dropping to ${Math.round(minTemp)}°C. Risk of frostbite.` })
  }

  // Heavy rain
  const totalPrecip = next24Precip.reduce((a, b) => a + b, 0)
  if (totalPrecip > 30) {
    alerts.push({ type: 'danger', title: 'Heavy Rain Warning', message: `${totalPrecip.toFixed(0)}mm of rain expected in 24 hours. Flooding risk.` })
  } else if (totalPrecip > 15) {
    alerts.push({ type: 'warning', title: 'Rain Advisory', message: `${totalPrecip.toFixed(0)}mm of rain forecast over the next 24 hours.` })
  }

  // Snow
  if (next24Codes.some((c) => c >= 71 && c <= 77)) {
    alerts.push({ type: 'warning', title: 'Snow Warning', message: 'Snowfall expected. Roads may be slippery.' })
  }

  return alerts
}

interface Props {
  hourly: HourlyWeather
  daily: DailyWeather
}

export function WeatherAlerts({ hourly, daily }: Props) {
  const alerts = generateAlerts(hourly, daily)
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex gap-3 rounded-xl p-3 text-sm ${
            alert.type === 'danger'
              ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          <span className="text-lg">{alert.type === 'danger' ? '🔴' : '🟡'}</span>
          <div>
            <p className="font-semibold">{alert.title}</p>
            <p className="mt-0.5 text-xs opacity-90">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
