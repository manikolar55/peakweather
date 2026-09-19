import { NextRequest, NextResponse } from 'next/server'
import { findNearestCity } from '@/lib/geocoding'

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '')
  const lon = parseFloat(req.nextUrl.searchParams.get('lon') ?? '')

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const city = await findNearestCity(lat, lon)
  if (!city) return NextResponse.json({ error: 'No city found' }, { status: 404 })

  return NextResponse.json(city)
}
