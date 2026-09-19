'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface RadarFrame {
  time: number
  path: string
}

function RadarLayer({ frames, frameIdx }: { frames: RadarFrame[]; frameIdx: number }) {
  const map = useMap()
  useEffect(() => {
    // Leaflet tile layers are handled via TileLayer component; this hook is a noop placeholder
    void map
  }, [map, frameIdx])
  return frames[frameIdx] ? (
    <TileLayer
      key={frames[frameIdx].path}
      url={`https://tilecache.rainviewer.com${frames[frameIdx].path}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={0.6}
      attribution='<a href="https://www.rainviewer.com">RainViewer</a>'
    />
  ) : null
}

interface Props {
  lat: number
  lon: number
  zoom?: number
}

export function RadarMapInner({ lat, lon, zoom = 7 }: Props) {
  const [frames, setFrames] = useState<RadarFrame[]>([])
  const [frameIdx, setFrameIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((d) => {
        const past: RadarFrame[] = (d.radar?.past ?? []).slice(-6)
        setFrames(past)
        setFrameIdx(past.length - 1)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!playing || frames.length === 0) return
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % frames.length), 600)
    return () => clearInterval(id)
  }, [playing, frames.length])

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 340 }}>
      <MapContainer
        center={[lat, lon]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <RadarLayer frames={frames} frameIdx={frameIdx} />
      </MapContainer>

      {/* Playback controls */}
      {frames.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[1000] bg-white/90 dark:bg-gray-900/90 rounded-full px-3 py-1.5 shadow text-xs">
          <button
            onClick={() => setFrameIdx((i) => Math.max(i - 1, 0))}
            className="px-1.5 hover:text-blue-600"
          >◀</button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-2 font-medium hover:text-blue-600"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => setFrameIdx((i) => Math.min(i + 1, frames.length - 1))}
            className="px-1.5 hover:text-blue-600"
          >▶</button>
          <span className="text-gray-400">
            {frames[frameIdx] ? new Date(frames[frameIdx].time * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
          </span>
        </div>
      )}
    </div>
  )
}
