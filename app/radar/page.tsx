import type { Metadata } from 'next'
import { Header } from '@/components/ui/Header'
import { RadarMapFull } from '@/components/map/RadarMapFull'

export const metadata: Metadata = {
  title: 'Live Weather Radar',
  description: 'Animated precipitation radar and satellite imagery updated every 10 minutes. Covers the entire globe with 10-frame history and 30-minute nowcast.',
  alternates: { canonical: '/radar' },
}

export default function RadarPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 pb-12 pt-6">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Live Weather Radar
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            Animated global precipitation radar + 30-min nowcast · updated every 10 minutes
          </p>
        </div>

        {/* ── Full radar map ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <RadarMapFull />
        </div>

        {/* ── How to use ───────────────────────────────────────────── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: '▶',
              title: 'Animate',
              body: 'Press Play to loop through the last 10 observed frames plus a 30-minute nowcast.',
            },
            {
              icon: '📍',
              title: 'Locate',
              body: 'Click "Locate me" to centre the map on your current location (requires browser permission).',
            },
            {
              icon: '🛰',
              title: 'Satellite',
              body: 'Switch to Satellite IR to view infrared cloud-top temperatures for long-range storm tracking.',
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{body}</p>
            </div>
          ))}
        </div>

        {/* ── Colour key explainer ─────────────────────────────────── */}
        <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Reading the radar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The colour scale goes from <span className="font-medium text-cyan-600">light blue</span> (drizzle) through{' '}
            <span className="font-medium text-green-600">green</span> and{' '}
            <span className="font-medium text-yellow-600">yellow</span> (moderate) to{' '}
            <span className="font-medium text-red-600">red</span> (heavy/extreme). Dark blue dots on the timeline
            are <span className="font-medium">nowcast</span> — model-predicted, not yet observed.
          </p>
        </div>

      </main>
    </>
  )
}
