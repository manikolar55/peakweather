'use client'

import { useMemo, useState } from 'react'
import { TrekCard } from '@/components/home/TrekCard'
import type { TrekVerdictData, TrekStatus } from '@/types'

interface TrekRow {
  id: string
  slug: string
  name: string
  country: string
  region: string
  summitElevation: number
  difficulty: string
  popular: boolean
  verdictData: TrekVerdictData | null
}

interface Props {
  treks: TrekRow[]
}

const DIFFICULTIES = ['easy', 'moderate', 'hard', 'technical'] as const
const STATUSES: TrekStatus[] = ['GO', 'CAUTION', 'NO-GO']

export function TreksGrid({ treks }: Props) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [country, setCountry] = useState<string>('all')

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(treks.map((t) => t.country))).sort()],
    [treks],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return treks.filter((t) => {
      if (difficulty !== 'all' && t.difficulty !== difficulty) return false
      if (country !== 'all' && t.country !== country) return false
      if (status !== 'all') {
        if (status === 'PENDING') {
          if (t.verdictData) return false
        } else if (t.verdictData?.status !== status) return false
      }
      if (q && !t.name.toLowerCase().includes(q) && !t.country.toLowerCase().includes(q) && !t.region.toLowerCase().includes(q)) return false
      return true
    })
  }, [treks, search, difficulty, country, status])

  const popular = filtered.filter((t) => t.popular)
  const rest    = filtered.filter((t) => !t.popular)

  return (
    <div>
      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        <input
          type="search"
          placeholder="Search treks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:flex-1 sm:min-w-[200px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Any verdict</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="PENDING">No verdict yet</option>
        </select>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All countries' : c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No treks match your filters.</p>
          <button
            onClick={() => { setSearch(''); setDifficulty('all'); setStatus('all'); setCountry('all') }}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Popular ─────────────────────────────────────────────────────── */}
      {popular.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Featured treks ({popular.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popular.map((t) => (
              <TrekCard
                key={t.id}
                name={t.name}
                slug={t.slug}
                country={t.country}
                region={t.region}
                summitElevation={t.summitElevation}
                difficulty={t.difficulty}
                verdict={t.verdictData}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Rest ────────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section>
          {popular.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              All treks ({rest.length})
            </h2>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((t) => (
              <TrekCard
                key={t.id}
                name={t.name}
                slug={t.slug}
                country={t.country}
                region={t.region}
                summitElevation={t.summitElevation}
                difficulty={t.difficulty}
                verdict={t.verdictData}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
