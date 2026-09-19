interface Props {
  uvIndex: number
}

function uvLabel(uv: number): { label: string; advice: string; color: string; bg: string } {
  if (uv <= 2) return { label: 'Low', advice: 'No protection needed', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500' }
  if (uv <= 5) return { label: 'Moderate', advice: 'Seek shade during midday', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-500' }
  if (uv <= 7) return { label: 'High', advice: 'SPF 30+, hat and sunglasses', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500' }
  if (uv <= 10) return { label: 'Very High', advice: 'Extra protection required', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-600' }
  return { label: 'Extreme', advice: 'Avoid sun exposure 10am–4pm', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-700' }
}

export function UvIndexCard({ uvIndex }: Props) {
  const uv = Math.round(uvIndex)
  const { label, advice, color, bg } = uvLabel(uv)
  const barWidth = Math.min((uv / 12) * 100, 100)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">UV Index</h2>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{uv}</span>
        <div>
          <p className={`font-semibold ${color}`}>{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{advice}</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-500 to-purple-700">
        <div className="relative">
          <div
            className="absolute top-[-3px] w-3.5 h-3.5 rounded-full border-2 border-white shadow"
            style={{ left: `calc(${barWidth}% - 7px)`, backgroundColor: bg.replace('bg-', '') }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-3">
        <span>0</span><span>3</span><span>6</span><span>9</span><span>12+</span>
      </div>
    </div>
  )
}
