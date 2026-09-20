import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { hostname } = new URL(req.url)
  if (hostname === 'peakweather.peakweather.workers.dev') {
    const dest = req.url.replace('peakweather.peakweather.workers.dev', 'thepeakweather.com')
    return NextResponse.redirect(dest, { status: 301 })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
