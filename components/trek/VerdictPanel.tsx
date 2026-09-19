'use client'

import { useEffect, useState } from 'react'
import type { TrekVerdictData, TrekStatus, RiskFactor } from '@/types'

interface Props {
  slug: string
  initialVerdict?: TrekVerdictData | null
}

const statusConfig: Record<TrekStatus, { label: string; ring: string; bg: string; text: string; bar: string }> = {
  GO:       { label: 'GO',      ring: 'ring-green-400 dark:ring-green-600', bg: 'bg-green-50 dark:bg-green-950',   text: 'text-green-700 dark:text-green-300', bar: 'bg-green-500' },
  CAUTION:  { label: 'CAUTION', ring: 'ring-amber-400 dark:ring-amber-600', bg: 'bg-amber-50 dark:bg-amber-950',   text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' },
  'NO-GO':  { label: 'NO-GO',   ring: 'ring-red-400 dark:ring-red-600',     bg: 'bg-red-50 dark:bg-red-950',       text: 'text-red-700 dark:text-red-300',     bar: 'bg-red-500' },
}

const riskMeta: Record<RiskFactor, { icon: string; label: string }> = {
  lightning:        { icon: '⚡', label: 'Lightning' },
  wind_chill:       { icon: '🌬️', label: 'Wind Chill' },
  snow:             { icon: '🌨️', label: 'Snow' },
  heat:             { icon: '🌡️', label: 'Extreme Heat' },
  low_visibility:   { icon: '🌫️', label: 'Low Visibility' },
  high_uv:          { icon: '☀️', label: 'High UV' },
  rain:             { icon: '🌧️', label: 'Heavy Rain' },
  ice:              { icon: '🧊', label: 'Ice' },
  storm:            { icon: '⛈️', label: 'Storm' },
  altitude_sickness:{ icon: '🏔️', label: 'Altitude Sickness' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

export function VerdictPanel({ slug, initialVerdict }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(
    initialVerdict ? 'done' : 'idle'
  )
  const [verdict, setVerdict] = useState<TrekVerdictData | null>(initialVerdict ?? null)
  const [errMsg, setErrMsg] = useState('')

  async function fetchVerdict() {
    setState('loading')
    try {
      const res = await fetch(`/api/trek-verdict/${slug}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json() as { verdict: TrekVerdictData }
      setVerdict(json.verdict)
      setState('done')
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Unknown error')
      setState('error')
    }
  }

  useEffect(() => {
    if (!initialVerdict) fetchVerdict()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'idle' || state === 'loading') {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-3/5 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">Generating AI safety verdict…</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-center">
        <p className="text-red-700 dark:text-red-300 font-semibold mb-2">Could not load AI verdict</p>
        <p className="text-xs text-red-500 mb-4">{errMsg}</p>
        <button
          onClick={fetchVerdict}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!verdict) return null

  const cfg = statusConfig[verdict.status]
  const scoreWidth = `${(verdict.score / 10) * 100}%`

  return (
    <div className={`rounded-2xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden ring-2 ${cfg.ring}`}>
      {/* Header */}
      <div className={`${cfg.bg} px-6 py-4 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-black px-4 py-1.5 rounded-xl ring-2 ${cfg.ring} ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100">AI Safety Verdict</p>
            <p className={`text-sm font-medium ${cfg.text}`}>Score: {verdict.score}/10</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500 dark:text-gray-400">Updated {timeAgo(verdict.generatedAt)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Powered by Claude</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Score bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Unsafe</span><span>Perfect</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-3 rounded-full transition-all ${cfg.bar}`}
              style={{ width: scoreWidth }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{verdict.reasoning}</p>

        {/* Best day + safest window */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Best Day</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{verdict.bestDay}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Safest Window</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{verdict.safestWindow}</p>
          </div>
        </div>

        {/* Risk factors */}
        {verdict.risks.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Risk Factors</p>
            <div className="flex flex-wrap gap-2">
              {verdict.risks.map((r) => {
                const m = riskMeta[r]
                return (
                  <span key={r} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {m.icon} {m.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Packing list */}
        {verdict.packingList.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Packing List</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {verdict.packingList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-0.5 text-green-500 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
          AI verdicts are for guidance only — always consult local guides, check official warnings, and make your own judgment.
        </p>
      </div>
    </div>
  )
}
