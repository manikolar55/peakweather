'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchResult } from '@/types'

interface Props {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search city or trek...', className = '' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data: SearchResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  function navigate(result: SearchResult) {
    const href = result.type === 'trek' ? `/trek/${result.slug}` : `/weather/${result.slug}`
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); setOpen(true) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, -1)) }
    if (e.key === 'Enter') {
      if (selected >= 0) navigate(results[selected])
      else if (results.length > 0) navigate(results[0])
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(-1) }}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden text-sm"
          role="listbox"
        >
          {results.map((r, i) => (
            <li
              key={`${r.type}-${r.slug}`}
              role="option"
              aria-selected={selected === i}
              onMouseDown={() => navigate(r)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                selected === i ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-base">{r.type === 'trek' ? '🥾' : '🏙️'}</span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {r.type === 'trek' ? `Trek · ${r.country}` : `City · ${r.region ? `${r.region}, ` : ''}${r.country}`}
                </p>
              </div>
              <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full ${
                r.type === 'trek'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {r.type === 'trek' ? 'Trek' : 'City'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
