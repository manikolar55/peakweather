'use client'

import dynamic from 'next/dynamic'

const RadarMapInner = dynamic(
  () => import('@/components/map/RadarMapInner').then((m) => m.RadarMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm animate-pulse">
        Loading radar map…
      </div>
    ),
  },
)

interface Props {
  lat: number
  lon: number
  zoom?: number
}

export function RadarMap(props: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Radar</h2>
      <RadarMapInner {...props} />
      <p className="text-xs text-gray-400 mt-2 text-right">Powered by RainViewer</p>
    </div>
  )
}
