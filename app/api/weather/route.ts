import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather } from '@/lib/weather'

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '')
  const lon = parseFloat(req.nextUrl.searchParams.get('lon') ?? '')
  const elevation = req.nextUrl.searchParams.get('elevation')

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }

  const tz = req.nextUrl.searchParams.get('tz') ?? undefined

  try {
    const data = await fetchWeather(lat, lon, elevation ? parseFloat(elevation) : undefined, tz)
    return NextResponse.json(data)
  } catch (err) {
    console.error('Weather API error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 502 })
  }
}
