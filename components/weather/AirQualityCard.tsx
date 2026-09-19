import { getAqiLabel } from '@/lib/utils'
import type { AirQualityData } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  aq: AirQualityData
}

export function AirQualityCard({ aq }: Props) {
  const aqi = aq.hourly.us_aqi?.[0] ?? aq.hourly.european_aqi?.[0] ?? 0
  const pm25 = aq.hourly.pm2_5?.[0] ?? 0
  const pm10 = aq.hourly.pm10?.[0] ?? 0
  const ozone = aq.hourly.ozone?.[0] ?? 0
  const { label, color } = getAqiLabel(aqi)

  const barWidth = Math.min((aqi / 300) * 100, 100)
  const barColor =
    aqi <= 50 ? 'bg-green-500' :
    aqi <= 100 ? 'bg-yellow-500' :
    aqi <= 150 ? 'bg-orange-500' :
    aqi <= 200 ? 'bg-red-500' :
    aqi <= 300 ? 'bg-purple-700' : 'bg-red-900'

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Air Quality</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{Math.round(aqi)}</div>
        <div>
          <p className={cn('font-semibold', color)}>{label}</p>
          <p className="text-xs text-gray-500">US AQI</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
        <div className={cn('h-2 rounded-full transition-all', barColor)} style={{ width: `${barWidth}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <AqStat label="PM2.5" value={`${pm25.toFixed(1)} µg/m³`} />
        <AqStat label="PM10" value={`${pm10.toFixed(1)} µg/m³`} />
        <AqStat label="Ozone" value={`${ozone.toFixed(1)} µg/m³`} />
      </div>
    </div>
  )
}

function AqStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
    </div>
  )
}
