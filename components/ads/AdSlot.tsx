'use client'

import { useEffect, useRef } from 'react'

interface Props {
  slot?: string
  format?: 'auto' | 'rectangle' | 'leaderboard'
  className?: string
  label?: string
}

export function AdSlot({ slot, format = 'auto', className = '', label = 'Advertisement' }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const ref = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (!publisherId || !ref.current) return
    try {
      // @ts-expect-error adsbygoogle is defined globally by AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [publisherId])

  if (!publisherId) {
    return (
      <div className={`flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400 ${className}`}
        style={{ minHeight: 90 }}>
        {label} (AdSense placeholder)
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-${publisherId}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
