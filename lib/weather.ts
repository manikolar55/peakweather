/**
 * Weather data via MET Norway Locationforecast 2.0
 * https://api.met.no/weatherapi/locationforecast/2.0/complete
 * Licence: CC BY 4.0 — attribution required in UI
 */
import { cacheGet, cacheSet } from '@/lib/kv-cache'
import type { WeatherData, CurrentWeather, HourlyWeather, DailyWeather } from '@/types'

const BASE = 'https://api.met.no/weatherapi/locationforecast/2.0/complete'
const TIMEOUT_MS = 10_000

function ua(): string {
  return process.env.METNO_USER_AGENT ?? 'PeakWeather/1.0 contact@example.com'
}

/** Round to 4 decimal places as required by MET Norway */
function r4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

function cacheKey(lat: number, lon: number, alt?: number): string {
  return `metno:${lat}:${lon}:${alt ?? 'auto'}`
}

// ─── MET Norway symbol code → WMO code ──────────────────────────────────────
const SYMBOL_WMO: Record<string, number> = {
  clearsky: 0, fair: 1, partlycloudy: 2, cloudy: 3,
  fog: 45, lightdrizzle: 51, drizzle: 53, heavydrizzle: 55,
  lightrain: 61, rain: 63, heavyrain: 65,
  lightsleet: 66, sleet: 67, heavysleet: 67,
  lightsnow: 71, snow: 73, heavysnow: 75,
  lightrainshowers: 80, rainshowers: 81, heavyrainshowers: 82,
  lightsleetshowers: 85, sleetshowers: 85, heavysleetshowers: 86,
  lightsnowshowers: 85, snowshowers: 86, heavysnowshowers: 86,
  thunder: 95,
  lightrainandthunder: 96, rainandthunder: 95, heavyrainandthunder: 99,
  lightsleetandthunder: 96, sleetandthunder: 95, heavysleetandthunder: 99,
  lightsnowandthunder: 96, snowandthunder: 95, heavysnowandthunder: 99,
  lightrainshowersandthunder: 96, rainshowersandthunder: 95, heavyrainshowersandthunder: 99,
  lightsleetshowersandthunder: 96, sleetshowersandthunder: 95, heavysleetshowersandthunder: 99,
  lightsnowshowersandthunder: 96, snowshowersandthunder: 95, heavysnowshowersandthunder: 99,
}

function symbolToWMO(symbol: string): number {
  const base = symbol.replace(/_day$|_night$|_polartwilight$/, '')
  return SYMBOL_WMO[base] ?? 3
}

// ─── Apparent temperature (wind chill / heat index) ─────────────────────────
function calcApparent(tC: number, windKmh: number, rh: number): number {
  if (tC <= 10 && windKmh >= 4.8) {
    const v = Math.pow(windKmh, 0.16)
    return Math.round((13.12 + 0.6215 * tC - 11.37 * v + 0.3965 * tC * v) * 10) / 10
  }
  if (tC >= 27 && rh >= 40) {
    const T = tC, R = rh
    const hi =
      -8.78469475556 + 1.61139411 * T + 2.33854883889 * R
      - 0.14611605 * T * R - 0.01230809 * T * T - 0.01642482 * R * R
      + 0.00221173 * T * T * R + 0.00072546 * T * R * R - 3.582e-6 * T * T * R * R
    return Math.round(hi * 10) / 10
  }
  return tC
}

// ─── Sunrise / sunset (NOAA simplified algorithm) ───────────────────────────
function getSunriseSunset(
  lat: number,
  lon: number,
  dayUTC: Date,
): { sunrise: string; sunset: string } | null {
  const Y = dayUTC.getUTCFullYear()
  const M = dayUTC.getUTCMonth() + 1
  const D = dayUTC.getUTCDate()
  const doy = Math.floor((M - 1) * 30.44 + D)
  const decl = (-23.45 * Math.cos(((360 / 365) * (doy + 10)) * (Math.PI / 180))) * (Math.PI / 180)
  const latR = lat * (Math.PI / 180)
  const cosHA =
    (Math.cos(96.833 * Math.PI / 180) - Math.sin(latR) * Math.sin(decl)) /
    (Math.cos(latR) * Math.cos(decl))
  if (cosHA > 1) return null // polar night
  if (cosHA < -1) {
    return {
      sunrise: new Date(Date.UTC(Y, M - 1, D, 0, 1)).toISOString(),
      sunset: new Date(Date.UTC(Y, M - 1, D, 23, 59)).toISOString(),
    }
  }
  const ha = Math.acos(cosHA) * (180 / Math.PI)
  const B = ((360 / 365) * (doy - 81)) * (Math.PI / 180)
  const eqTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
  const solarNoon = 720 - 4 * lon - eqTime
  const toISO = (mUTC: number): string => {
    const total = ((mUTC % 1440) + 1440) % 1440
    const h = Math.floor(total / 60) % 24
    const m = Math.min(Math.round(total % 60), 59)
    return new Date(Date.UTC(Y, M - 1, D, h, m)).toISOString()
  }
  return { sunrise: toISO(solarNoon - ha * 4), sunset: toISO(solarNoon + ha * 4) }
}

// ─── MET Norway response parser ──────────────────────────────────────────────
interface METDetails { [k: string]: number | undefined }
interface METSummary { symbol_code: string }
interface METStep { summary?: METSummary; details?: Record<string, number> }
interface METEntry {
  time: string
  data: { instant: { details: METDetails }; next_1_hours?: METStep; next_6_hours?: METStep; next_12_hours?: METStep }
}

function parseResponse(raw: { properties: { timeseries: METEntry[] } }, lat: number, lon: number, tz: string): WeatherData {
  const ts = raw.properties.timeseries
  if (!ts?.length) throw new Error('Empty MET Norway response')

  const MAX = Math.min(ts.length, 91) // ~90 h

  const hourly: HourlyWeather = {
    time: [], temperature_2m: [], apparent_temperature: [], precipitation_probability: [],
    precipitation: [], weathercode: [], windspeed_10m: [], windgusts_10m: [],
    winddirection_10m: [], relativehumidity_2m: [], dewpoint_2m: [], cloudcover: [],
    visibility: [], uv_index: [], surface_pressure: [], snowfall: [],
  }

  for (let i = 0; i < MAX; i++) {
    const e = ts[i]
    const d = e.data.instant.details
    const n1 = e.data.next_1_hours
    const n6 = e.data.next_6_hours

    const t    = d.air_temperature ?? 0
    const wMs  = d.wind_speed ?? 0
    const gMs  = d.wind_speed_of_gust ?? wMs
    const wKmh = wMs * 3.6
    const gKmh = gMs * 3.6
    const rh   = d.relative_humidity ?? 50
    const sym  = n1?.summary?.symbol_code ?? n6?.summary?.symbol_code ?? 'cloudy'
    const prec = n1?.details?.precipitation_amount ?? 0
    const pProb = n1?.details?.precipitation_probability ?? n6?.details?.precipitation_probability ?? 0
    const fog  = d.fog_area_fraction ?? 0

    hourly.time.push(e.time)
    hourly.temperature_2m.push(t)
    hourly.apparent_temperature.push(calcApparent(t, wKmh, rh))
    hourly.precipitation_probability.push(Math.round(pProb))
    hourly.precipitation.push(prec)
    hourly.weathercode.push(symbolToWMO(sym))
    hourly.windspeed_10m.push(Math.round(wKmh * 10) / 10)
    hourly.windgusts_10m.push(Math.round(gKmh * 10) / 10)
    hourly.winddirection_10m.push(d.wind_from_direction ?? 0)
    hourly.relativehumidity_2m.push(Math.round(rh))
    hourly.dewpoint_2m.push(d.dew_point_temperature ?? t - 5)
    hourly.cloudcover.push(d.cloud_area_fraction ?? 0)
    hourly.visibility.push(fog > 40 ? 200 : fog > 5 ? 2000 : 10_000)
    hourly.uv_index.push(d.ultraviolet_index_clear_sky ?? 0)
    hourly.surface_pressure.push(d.air_pressure_at_sea_level ?? 1013)
    hourly.snowfall.push(sym.includes('snow') && t <= 2 ? prec : 0)
  }

  // Build daily aggregates
  const dayBuckets = new Map<string, METEntry[]>()
  for (let i = 0; i < MAX; i++) {
    const dk = ts[i].time.slice(0, 10)
    if (!dayBuckets.has(dk)) dayBuckets.set(dk, [])
    dayBuckets.get(dk)!.push(ts[i])
  }

  const daily: DailyWeather = {
    time: [], temperature_2m_max: [], temperature_2m_min: [],
    apparent_temperature_max: [], apparent_temperature_min: [],
    precipitation_sum: [], precipitation_probability_max: [],
    weathercode: [], windspeed_10m_max: [], windgusts_10m_max: [],
    winddirection_10m_dominant: [], uv_index_max: [],
    sunrise: [], sunset: [], precipitation_hours: [],
  }

  let dayCount = 0
  for (const [dk, entries] of dayBuckets) {
    if (dayCount >= 14) break
    const ds     = entries.map((e) => e.data.instant.details)
    const temps  = ds.map((d) => d.air_temperature ?? 0)
    const winds  = ds.map((d) => (d.wind_speed ?? 0) * 3.6)
    const gusts  = ds.map((d) => (d.wind_speed_of_gust ?? d.wind_speed ?? 0) * 3.6)
    const precs  = entries.map((e) => e.data.next_1_hours?.details?.precipitation_amount ?? 0)
    const pProbs = entries.map((e) => e.data.next_1_hours?.details?.precipitation_probability ?? e.data.next_6_hours?.details?.precipitation_probability ?? 0)
    const uvs    = ds.map((d) => d.ultraviolet_index_clear_sky ?? 0)
    const noon   = entries.find((e) => e.time.includes('T12:')) ?? entries[Math.floor(entries.length / 2)]
    const noonSym = noon?.data.next_1_hours?.summary?.symbol_code ?? noon?.data.next_6_hours?.summary?.symbol_code ?? 'cloudy'
    const appTemps = entries.map((e) => {
      const d = e.data.instant.details
      return calcApparent(d.air_temperature ?? 0, (d.wind_speed ?? 0) * 3.6, d.relative_humidity ?? 50)
    })

    const sun = getSunriseSunset(lat, lon, new Date(dk + 'T00:00:00Z'))

    daily.time.push(dk)
    daily.temperature_2m_max.push(Math.max(...temps))
    daily.temperature_2m_min.push(Math.min(...temps))
    daily.apparent_temperature_max.push(Math.max(...appTemps))
    daily.apparent_temperature_min.push(Math.min(...appTemps))
    daily.precipitation_sum.push(Math.round(precs.reduce((a, b) => a + b, 0) * 10) / 10)
    daily.precipitation_probability_max.push(Math.max(...pProbs))
    daily.weathercode.push(symbolToWMO(noonSym))
    daily.windspeed_10m_max.push(Math.round(Math.max(...winds) * 10) / 10)
    daily.windgusts_10m_max.push(Math.round(Math.max(...gusts) * 10) / 10)
    daily.winddirection_10m_dominant.push(noon?.data.instant.details.wind_from_direction ?? 0)
    daily.uv_index_max.push(Math.max(...uvs))
    daily.sunrise.push(sun?.sunrise ?? '')
    daily.sunset.push(sun?.sunset ?? '')
    daily.precipitation_hours.push(precs.filter((p) => p > 0.1).length)
    dayCount++
  }

  // Current conditions
  const f = ts[0]
  const fd = f.data.instant.details
  const fn1 = f.data.next_1_hours
  const fn6 = f.data.next_6_hours
  const fsym = fn1?.summary?.symbol_code ?? fn6?.summary?.symbol_code ?? 'cloudy'
  const ft = fd.air_temperature ?? 0
  const fw = (fd.wind_speed ?? 0) * 3.6
  const frh = fd.relative_humidity ?? 50
  const now = new Date(f.time)
  const sunNow = getSunriseSunset(lat, lon, now)
  let isDay = 1
  if (sunNow) {
    const rise = new Date(sunNow.sunrise).getTime()
    const set  = new Date(sunNow.sunset).getTime()
    isDay = now.getTime() >= rise && now.getTime() <= set ? 1 : 0
  }

  const current: CurrentWeather = {
    temperature: ft,
    apparent_temperature: calcApparent(ft, fw, frh),
    weathercode: symbolToWMO(fsym),
    windspeed: fw,
    windgusts: (fd.wind_speed_of_gust ?? fd.wind_speed ?? 0) * 3.6,
    winddirection: fd.wind_from_direction ?? 0,
    relativehumidity: Math.round(frh),
    dewpoint: fd.dew_point_temperature ?? ft - 5,
    cloudcover: fd.cloud_area_fraction ?? 0,
    visibility: (fd.fog_area_fraction ?? 0) > 40 ? 200 : 10_000,
    surface_pressure: fd.air_pressure_at_sea_level ?? 1013,
    precipitation: fn1?.details?.precipitation_amount ?? 0,
    is_day: isDay,
    time: f.time,
  }

  return { latitude: lat, longitude: lon, elevation: 0, timezone: tz, current, hourly, daily }
}

// Derive an IANA-compatible Etc/GMT timezone from longitude when no city timezone is available.
// Etc/GMT uses inverted sign convention: Etc/GMT-5 = UTC+5.
function lonToTimezone(lon: number): string {
  const offset = Math.round(lon / 15)
  if (offset === 0) return 'UTC'
  if (offset > 0) return `Etc/GMT-${offset}`
  return `Etc/GMT+${Math.abs(offset)}`
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function fetchWeather(lat: number, lon: number, altitude?: number, timezone?: string): Promise<WeatherData> {
  const latR = r4(lat)
  const lonR = r4(lon)
  const tz   = timezone ?? lonToTimezone(lon)
  const key  = cacheKey(latR, lonR, altitude)

  const cached = await cacheGet(key)
  if (cached) {
    const data = JSON.parse(cached.data) as WeatherData
    return { ...data, timezone: tz }
  }

  const params = new URLSearchParams({ lat: String(latR), lon: String(lonR) })
  if (altitude !== undefined) params.set('altitude', String(Math.round(altitude)))

  const headers: Record<string, string> = { 'User-Agent': ua(), Accept: 'application/json' }

  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE}?${params}`, { signal: ctrl.signal, headers, cache: 'no-store' })
    clearTimeout(tid)

    if (!res.ok) throw new Error(`MET Norway ${res.status}`)

    const raw = await res.json() as { properties: { timeseries: METEntry[] } }
    const data = parseResponse(raw, latR, lonR, tz)
    const lm   = res.headers.get('Last-Modified') ?? null

    await cacheSet(key, { data: JSON.stringify(data), lastModified: lm })

    return data
  } catch (err) {
    clearTimeout(tid)
    throw err
  }
}
