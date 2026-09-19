import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/ui/Header'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PeakWeather privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: false, follow: false },
}

const UPDATED = '18 September 2026'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {UPDATED}</p>

        <Section title="1. Who we are">
          <p>
            PeakWeather (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates
            the website at <strong>peakweather.app</strong>. We are the data controller for
            personal data processed on this site.
          </p>
          <p>
            Questions about this policy:{' '}
            <Link href="/contact" className="underline text-blue-600 dark:text-blue-400">
              contact us
            </Link>
            .
          </p>
        </Section>

        <Section title="2. Data we collect">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">2.1 Automatically collected</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>IP address and browser user-agent (server access logs, retained ≤ 7 days)</li>
            <li>Pages visited, referrer URL, and approximate country (via server logs)</li>
          </ul>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">2.2 With your consent — advertising cookies</h3>
          <p className="text-gray-700 dark:text-gray-300">
            If you click <strong>Accept all</strong> in the cookie banner, we load{' '}
            <strong>Google AdSense</strong>. Google may set cookies and collect data including
            your IP address, device identifiers, and browsing behaviour to serve personalised
            ads. See{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400"
            >
              Google&apos;s Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400"
            >
              Ad Settings
            </a>
            . If you click <strong>Decline</strong>, no advertising scripts are loaded.
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">2.3 Geolocation</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Some features (homepage local weather, radar &ldquo;Locate me&rdquo;) request your
            browser&apos;s geolocation permission. This data is used only in the moment to fetch
            weather for your location and is never stored on our servers.
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">2.4 Contact form</h3>
          <p className="text-gray-700 dark:text-gray-300">
            If you contact us by email we will retain your name and email address only as long as
            needed to respond.
          </p>
        </Section>

        <Section title="3. Third-party services">
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>MET Norway</strong> — weather data fetched server-side; no user data is
              sent to MET Norway.
            </li>
            <li>
              <strong>OpenWeatherMap</strong> — air quality data fetched server-side with your
              location coordinates (lat/lon only); OWM&apos;s{' '}
              <a
                href="https://openweathermap.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400"
              >
                privacy policy
              </a>
              .
            </li>
            <li>
              <strong>RainViewer</strong> — radar tile images loaded client-side; RainViewer may
              log your IP to serve tile requests.
            </li>
            <li>
              <strong>Anthropic Claude</strong> — trek weather conditions are sent to Claude to
              generate safety verdicts. No personal user data is included in these prompts.
            </li>
            <li>
              <strong>Google AdSense</strong> — loaded only with consent (see §2.2 above).
            </li>
            <li>
              <strong>OpenStreetMap</strong> — map tiles loaded client-side; OSM may log your IP.
            </li>
          </ul>
        </Section>

        <Section title="4. Legal basis (GDPR)">
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li><strong>Legitimate interest</strong> — server access logs for security and abuse prevention.</li>
            <li><strong>Consent</strong> — advertising cookies (Art. 6(1)(a) GDPR). You may withdraw consent at any time by clearing localStorage key <code>pw-cookie-consent</code> and refreshing.</li>
            <li><strong>Contract</strong> — processing data necessary to deliver the service you requested.</li>
          </ul>
        </Section>

        <Section title="5. Your rights">
          <p className="text-gray-700 dark:text-gray-300">
            Under GDPR you have the right to: access your data, rectify inaccuracies, request
            erasure, restrict or object to processing, and data portability. To exercise any right,{' '}
            <Link href="/contact" className="underline text-blue-600 dark:text-blue-400">contact us</Link>.
            You also have the right to lodge a complaint with your national data protection authority.
          </p>
        </Section>

        <Section title="6. Cookies and local storage">
          <p className="text-gray-700 dark:text-gray-300">
            We store a single preference key (<code>pw-cookie-consent</code>) in
            localStorage to remember your cookie choice. No session cookies are set by PeakWeather
            itself. If you accept advertising, Google AdSense may set its own cookies governed by
            Google&apos;s policy.
          </p>
        </Section>

        <Section title="7. Data retention">
          <p className="text-gray-700 dark:text-gray-300">
            Server access logs are deleted after 7 days. Weather cache data (no personal data) is
            purged after 15 minutes. Trek verdict cache is purged after 4 hours. We do not store
            any identifying user data beyond what is described above.
          </p>
        </Section>

        <Section title="8. Children">
          <p className="text-gray-700 dark:text-gray-300">
            PeakWeather is not directed at children under 13. We do not knowingly collect personal
            data from children.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p className="text-gray-700 dark:text-gray-300">
            We may update this policy occasionally. The &ldquo;Last updated&rdquo; date at the top
            reflects the most recent revision. Continued use of the site after changes constitutes
            acceptance of the revised policy.
          </p>
        </Section>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
