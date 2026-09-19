import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/ui/Providers'
import { CookieConsent } from '@/components/ui/CookieConsent'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakweather.vercel.app'

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  )
}
