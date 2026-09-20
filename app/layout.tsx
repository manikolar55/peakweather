import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/ui/Providers'
import { CookieConsent } from '@/components/ui/CookieConsent'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.peakweather.workers.dev'

export const metadata: Metadata = {
  title: { default: 'PeakWeather — Global Weather & Trek Forecasts', template: '%s | PeakWeather' },
  description: 'Accurate weather for every city in the world, with AI-powered safety verdicts for treks, trails, and summits.',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  openGraph: {
    siteName: 'PeakWeather',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PeakWeather' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@peakweather',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'lgY7UsyA-0ES08xDt3kFpKT8wW5njRkdW934PdTJLwU',
  },
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  )
}
