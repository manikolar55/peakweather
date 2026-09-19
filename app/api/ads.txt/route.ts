import { NextResponse } from 'next/server'

export async function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID

  if (!publisherId) {
    return new NextResponse('# No AdSense publisher ID configured', {
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const content = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
