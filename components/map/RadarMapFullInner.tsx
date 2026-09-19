'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Frame {
  time: number
  path: string
  isNowcast?: boolean
}

type Layer = 'radar' | 'satellite'
type Speed = 0.5 | 1 | 2

// Lives inside MapContainer — triggers geolocation when `tick` increments
function LocateTrigger({ tick, setLocating }: { tick: number; setLocating: (v: boolean) => void }) {
  const map = useMap()
  const setLocatingRef = useRef(setLocating)
  setLocatingRef.current = setLocating

  useEffect(() => {
    if (tick === 0) return
    setLocatingRef.current(true)
    map.locate({ setView: true, maxZoom: 8 })
    const done = () => setLocatingRef.current(false)
    map.once('locationfound', done)
    map.once('locationerror', done)
    return () => { map.off('locationfound', done); map.off('locationerror', done) }
  }, [tick, map])

  return null
}

function formatFrameTime(frame: Frame): string {
  const d = new Date(frame.time * 1000)
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return frame.isNowcast ? `${t} ▸ nowcast` : t
}

const LEGEND = [
  { color: '#b3f0ff', label: 'Drizzle' },
  { color: '#00c8ff', label: 'Light' },
  { color: '#0064ff', label: 'Moderate' },
  { color: '#00dc00', label: 'Heavy' },
  { color: '#ffd700', label: 'Intense' },
  { color: '#ff3200', label: 'Extreme' },
]

export function RadarMapFullInner() {
  const [radarFrames, setRadarFrames] = useState<Frame[]>([])
  const [satFrames, setSatFrames]     = useState<Frame[]>([])
  const [frameIdx, setFrameIdx]       = useState(0)
  const [playing, setPlaying]         = useState(false)
  const [speed, setSpeed]             = useState<Speed>(1)
  const [layer, setLayer]             = useState<Layer>('radar')
  const [locateTick, setLocateTick]   = useState(0)
  const [locating, setLocating]       = useState(false)

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((d) => {
        const past: Frame[]    = (d.radar?.past    ?? []).slice(-10)
        const nowcast: Frame[] = (d.radar?.nowcast ?? []).slice(0, 3).map((f: Frame) => ({ ...f, isNowcast: true }))
        const sat: Frame[]     = (d.satellite?.infrared ?? []).slice(-8)
        setRadarFrames([...past, ...nowcast])
        setFrameIdx(past.length - 1)
        setSatFrames(sat)
      })
      .catch(() => {})
  }, [])

  const activeFrames = layer === 'radar' ? radarFrames : satFrames
  const currentFrame = activeFrames[frameIdx]

  useEffect(() => {
    if (!playing || activeFrames.length === 0) return
    const ms = Math.round(650 / speed)
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % activeFrames.length), ms)
    return () => clearInterval(id)
  }, [playing, speed, activeFrames.length])

  function switchLayer(l: Layer) {
    setLayer(l)
    setFrameIdx(0)
    setPlaying(false)
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Top toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {/* Layer toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-sm font-medium">
          {(['radar', 'satellite'] as Layer[]).map((l) => (
            <button
              key={l}
              onClick={() => switchLayer(l)}
              className={`px-4 py-1.5 transition-colors ${
                layer === l
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {l === 'satellite' ? 'Satellite IR' : 'Precipitation'}
            </button>
          ))}
        </div>

        {/* Locate me */}
        <button
          onClick={() => setLocateTick((n) => n + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {locating
            ? <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            : <span>📍</span>
          }
          Locate me
        </button>

        {/* Current frame label */}
        {currentFrame && (
          <span className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${
            currentFrame.isNowcast
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {formatFrameTime(currentFrame)}
          </span>
        )}
      </div>

      {/* ── Map ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 560 }}>
        <MapContainer
          center={[20, 0]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          zoomControl
          scrollWheelZoom
        >
          <LocateTrigger tick={locateTick} setLocating={setLocating} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {currentFrame && layer === 'radar' && (
            <TileLayer
              key={currentFrame.path}
              url={`https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={0.7}
              zIndex={10}
            />
          )}

          {currentFrame && layer === 'satellite' && (
            <TileLayer
              key={currentFrame.path}
              url={`https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}.png`}
              opacity={0.75}
              zIndex={10}
            />
          )}
        </MapContainer>

        {/* Precipitation legend */}
        {layer === 'radar' && (
          <div className="absolute bottom-10 left-3 z-[1000] bg-white/90 dark:bg-gray-900/90 rounded-xl p-2.5 text-xs shadow pointer-events-none">
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Intensity</p>
            {LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <span className="w-4 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Playback controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-3">
        <input
          type="range"
          min={0}
          max={Math.max(activeFrames.length - 1, 0)}
          value={frameIdx}
          onChange={(e) => { setFrameIdx(Number(e.target.value)); setPlaying(false) }}
          className="flex-1 accent-blue-600"
        />

        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={activeFrames.length === 0}
          className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value) as Speed)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus:outline-none"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
        </select>
      </div>

      {/* Frame timeline dots */}
      {activeFrames.length > 0 && (
        <div className="flex items-center gap-1 pt-2 overflow-x-auto">
          {activeFrames.map((f, i) => (
            <button
              key={f.path}
              onClick={() => { setFrameIdx(i); setPlaying(false) }}
              title={formatFrameTime(f)}
              className={`shrink-0 rounded-full transition-all ${i === frameIdx ? 'w-3 h-3' : 'w-2 h-2'} ${
                f.isNowcast
                  ? i === frameIdx ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700'
                  : i === frameIdx ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
          {radarFrames.some((f) => f.isNowcast) && (
            <span className="text-xs text-blue-500 ml-2 shrink-0">nowcast →</span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right pt-2">
        Radar: <a href="https://www.rainviewer.com" className="underline" target="_blank" rel="noopener noreferrer">RainViewer</a>
        {' · '}past 10 frames + 30-min nowcast
      </p>
    </div>
  )
}
