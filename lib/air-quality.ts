import type { AirQualityData } from '@/types'
import { fetchOWMAirPollution } from '@/lib/openweather'

// EPA PM2.5 breakpoints → US AQI
function pm25ToUsAqi(pm: number): number {
  const bp = [
    [0,     12.0,  0,   50],
    [12.1,  35.4,  51,  100],
    [35.5,  55.4,  101, 150],
    [55.5,  150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 500.4, 301, 500],
  ] as const
  for (const [cLo, cHi, iLo, iHi] of bp) {
    if (pm >= cLo && pm <= cHi) {
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo)
    }
  }
  return pm > 500 ? 500 : 0
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  const owm = await fetchOWMAirPollution(lat, lon)
  if (!owm) return null

  const now = new Date().toISOString()
  return {
    hourly: {
      time: [now],
      pm2_5: [owm.pm2_5],
      pm10: [owm.pm10],
      ozone: [owm.o3],
      european_aqi: [owm.aqi * 20], // OWM 1–5 → 20–100
      us_aqi: [pm25ToUsAqi(owm.pm2_5)],
    },
  }
}
