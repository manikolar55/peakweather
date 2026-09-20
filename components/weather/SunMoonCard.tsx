interface Props {
  sunrise: string
  sunset: string
  timezone: string
  date: string
}

function getMoonPhase(date: Date): { phase: string; emoji: string } {
  // Known new moon reference: 2024-01-11
  const ref = new Date('2024-01-11T00:00:00Z')
  const daysSince = (date.getTime() - ref.getTime()) / 86400000
  const cycle = 29.53059
  const phase = ((daysSince % cycle) + cycle) % cycle

  if (phase < 1.85) return { phase: 'New Moon', emoji: '🌑' }
  if (phase < 7.38) return { phase: 'Waxing Crescent', emoji: '🌒' }
  if (phase < 9.22) return { phase: 'First Quarter', emoji: '🌓' }
  if (phase < 14.77) return { phase: 'Waxing Gibbous', emoji: '🌔' }
  if (phase < 16.61) return { phase: 'Full Moon', emoji: '🌕' }
  if (phase < 22.15) return { phase: 'Waning Gibbous', emoji: '🌖' }
  if (phase < 23.99) return { phase: 'Last Quarter', emoji: '🌗' }
  return { phase: 'Waning Crescent', emoji: '🌘' }
}

function formatTime(isoStr: string, tz: string): string {
  try {
    return new Date(isoStr).toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return isoStr
  }
}

function getDaylightMinutes(sunriseStr: string, sunsetStr: string): string {
  const rise = new Date(sunriseStr).getTime()
  const set = new Date(sunsetStr).getTime()
  const mins = Math.round((set - rise) / 60000)
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function SunMoonCard({ sunrise, sunset, timezone, date }: Props) {
  const moon = getMoonPhase(new Date(date))
  const daylight = getDaylightMinutes(sunrise, sunset)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Sun &amp; Moon</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌅</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sunrise</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{formatTime(sunrise, timezone)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌇</span>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sunset</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{formatTime(sunset, timezone)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Daylight: {daylight}</p>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-gray-100 dark:border-gray-800 pl-3 sm:pl-4">
          <span className="text-4xl sm:text-5xl">{moon.emoji}</span>
          <p className="mt-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-center">{moon.phase}</p>
        </div>
      </div>
    </div>
  )
}
