import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/ui/Header'

export const metadata: Metadata = {
  title: 'About PeakWeather',
  description: 'Learn about PeakWeather — global weather forecasts, AI-powered trek safety verdicts, and the data sources powering the platform.',
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          About PeakWeather
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">
          Global weather intelligence, built for explorers.
        </p>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">What we do</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            PeakWeather delivers accurate current conditions, hourly charts, and 14-day forecasts for
            cities worldwide — alongside AI-powered safety verdicts (GO / CAUTION / NO-GO) for over
            90 famous treks, trails, and mountain summits. Our goal is to give hikers, climbers, and
            outdoor enthusiasts the weather intelligence they need before they set foot on a trail.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Data sources</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">Weather</span>
              <span>
                <a
                  href="https://api.met.no/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  MET Norway Locationforecast 2.0
                </a>{' '}
                — numerical weather prediction from the Norwegian Meteorological Institute, provided
                free under a{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  CC BY 4.0
                </a>{' '}
                licence.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">Air quality</span>
              <span>
                OpenWeatherMap Air Pollution API — real-time PM2.5, PM10, ozone, and US AQI
                (computed using EPA breakpoints).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">Radar</span>
              <span>
                <a
                  href="https://www.rainviewer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  RainViewer
                </a>{' '}
                — animated global precipitation radar (past 10 frames + 30-minute nowcast) and
                satellite infrared imagery.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">City data</span>
              <span>
                <a
                  href="https://www.geonames.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  GeoNames
                </a>{' '}
                cities15000 dataset — open geographic database (CC BY 4.0).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">AI verdicts</span>
              <span>
                Powered by{' '}
                <a
                  href="https://www.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400"
                >
                  Anthropic Claude
                </a>
                . AI-generated verdicts are for informational guidance only — always verify
                conditions and exercise independent judgement before any mountain activity.
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Maps</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Base map tiles are provided by{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400"
            >
              OpenStreetMap
            </a>{' '}
            contributors (ODbL), rendered via Leaflet.
          </p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Questions, feedback, or data corrections?{' '}
            <Link href="/contact" className="underline text-blue-600 dark:text-blue-400">
              Get in touch
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Legal</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            <Link href="/privacy-policy" className="underline text-blue-600 dark:text-blue-400 mr-4">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline text-blue-600 dark:text-blue-400">
              Terms of Service
            </Link>
          </p>
        </section>
      </main>
    </>
  )
}
