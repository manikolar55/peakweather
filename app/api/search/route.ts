import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/geocoding'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const results = await search(q)
    return NextResponse.json(results)
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
