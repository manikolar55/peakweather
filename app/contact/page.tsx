import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/ui/Header'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Have a question about PeakWeather, our AI trek verdicts, or weather data? Reach out to hello@peakweather.app — we typically respond within 2 business days.',
  alternates: { canonical: '/contact' },
  robots: { index: false, follow: true },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Contact</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">
          Questions, feedback, or data corrections — we&apos;d love to hear from you.
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Email
            </h2>
            <a
              href="mailto:hello@peakweather.app"
              className="text-blue-600 dark:text-blue-400 underline text-lg font-medium"
            >
              hello@peakweather.app
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              What to include
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Bug reports — include the URL, browser, and what happened vs. what you expected</li>
              <li>Trek data corrections — include the trek name, incorrect field, and correct value with a source</li>
              <li>Feature requests — a short description of the problem you&apos;d like solved</li>
              <li>Privacy requests — see our{' '}
                <Link href="/privacy-policy" className="underline text-blue-600 dark:text-blue-400">
                  Privacy Policy
                </Link>
                {' '}for your rights under GDPR
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Response time
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              We aim to respond within 2 business days.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
