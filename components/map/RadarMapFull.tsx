'use client'

import dynamic from 'next/dynamic'

const RadarMapFullInner = dynamic(
  () => import('@/components/map/RadarMapFullInner').then((m) => m.RadarMapFullInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm animate-pulse"
        style={{ height: 560 }}
      >
        Loading radar…
      </div>
    ),
  },
)

export function RadarMapFull() {
  return <RadarMapFullInner />
}
