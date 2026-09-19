'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Consent = 'accepted' | 'declined' | 'pending'
const STORAGE_KEY = 'pw-cookie-consent'

function injectAdSense() {
  const id = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!id || typeof document === 'undefined') return
  if (document.querySelector('[data-pw-ads]')) return
  const s = document.createElement('script')
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${id}`
  s.async = true
  s.crossOrigin = 'anonymous'
  s.setAttribute('data-pw-ads', '1')
  document.head.appendChild(s)
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null
    if (stored === 'accepted') { setConsent('accepted'); injectAdSense() }
    else if (stored === 'declined') setConsent('declined')
    else setConsent('pending')
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
    injectAdSense()
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
  }

  if (consent !== 'pending') return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
          We use cookies for advertising (Google AdSense) and to remember your preferences.{' '}
          <Link href="/privacy-policy" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
