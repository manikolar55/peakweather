import Link from 'next/link'
import type { Trek } from '@/types'

interface Props {
  treks: Trek[]
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  technical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function TreksNearCity({ treks }: Props) {
  if (treks.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Treks Near This City</h2>
      <div className="space-y-2">
        {treks.map((trek) => (
          <Link
            key={trek.id}
            href={`/trek/${trek.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">🥾</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{trek.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{trek.region} · {trek.summitElevation}m</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColors[trek.difficulty] ?? ''}`}>
              {trek.difficulty}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/treks" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3">
        Browse all treks →
      </Link>
    </div>
  )
}
