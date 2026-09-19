/**
 * Air quality via Open-Meteo Air Quality API (Copernicus CAMS data).
 * Free, no API key, pre-calculates US AQI and European AQI correctly.
 * https://open-meteo.com/en/docs/air-quality-api
 */
import type { AirQualityData } from '@/types'

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const TIMEOUT_MS = 8_000

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide',
    domains: 'cams_global',
  })

  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE}?${params}`, {
      signal: ctrl.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    clearTimeout(tid)
    if (!res.ok) return null

    type OMResponse = {
      current?: {
        time: string
        us_aqi: number
        european_aqi: number
        pm2_5: number
        pm10: number
        ozone: number
        nitrogen_dioxide: number
        carbon_monoxide: number
      }
    }

    const data = await res.json() as OMResponse
    const c = data.current
    if (!c) return null

    return {
      hourly: {
        time: [c.time],
        us_aqi: [c.us_aqi ?? 0],
        european_aqi: [c.european_aqi ?? 0],
        pm2_5: [c.pm2_5 ?? 0],
        pm10: [c.pm10 ?? 0],
        ozone: [c.ozone ?? 0],
        nitrogen_dioxide: [c.nitrogen_dioxide ?? 0],
        carbon_monoxide: [c.carbon_monoxide ?? 0],
      },
    }
  } catch {
    clearTimeout(tid)
    return null
  }
}
