import Link from 'next/link'
import type { TrekStatus, TrekVerdictData } from '@/types'

interface Props {
  name: string
  slug: string
  country: string
  region: string
  summitElevation: number
  difficulty: string
  verdict?: TrekVerdictData | null
}

const statusConfig: Record<TrekStatus, { label: string; bg: string; dot: string }> = {
  GO: { label: 'GO', bg: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700', dot: 'bg-green-500' },
  CAUTION: { label: 'CAUTION', bg: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700', dot: 'bg-amber-500' },
  'NO-GO': { label: 'NO-GO', bg: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700', dot: 'bg-red-500' },
}

const difficultyColors: Record<string, string> = {
  easy: 'text-green-600 dark:text-green-400',
  moderate: 'text-yellow-600 dark:text-yellow-400',
  hard: 'text-orange-600 dark:text-orange-400',
  technical: 'text-red-600 dark:text-red-400',
}

export function TrekCard({ name, slug, country, region, summitElevation, difficulty, verdict }: Props) {
  const status = verdict?.status
  const score = verdict?.score
  const cfg = status ? statusConfig[status] : null

  return (
    <Link
      href={`/trek/${slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {name}
        </h3>
        {cfg && (
          <span className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {country} · {region}
      </p>

      <div className="mt-auto flex items-center gap-3 text-xs">
        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
          ⛰ {summitElevation.toLocaleString()}m
        </span>
        <span className={`capitalize font-medium ${difficultyColors[difficulty] ?? 'text-gray-500'}`}>
          {difficulty}
        </span>
        {score !== undefined && (
          <span className="ml-auto text-gray-400">Score: <strong className="text-gray-700 dark:text-gray-300">{score}/10</strong></span>
        )}
      </div>

      {verdict?.reasoning && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {verdict.reasoning}
        </p>
      )}
    </Link>
  )
}
