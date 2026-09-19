// ─── Weather ──────────────────────────────────────────────────────────────────

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation: number
  country: string
  country_code: string
  admin1?: string
  admin2?: string
  slug: string
  timezone?: string
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation_probability: number[]
  precipitation: number[]
  weathercode: number[]
  windspeed_10m: number[]
  windgusts_10m: number[]
  winddirection_10m: number[]
  relativehumidity_2m: number[]
  dewpoint_2m: number[]
  cloudcover: number[]
  visibility: number[]
  uv_index: number[]
  surface_pressure: number[]
  snowfall: number[]
}

export interface DailyWeather {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  apparent_temperature_max: number[]
  apparent_temperature_min: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  weathercode: number[]
  windspeed_10m_max: number[]
  windgusts_10m_max: number[]
  winddirection_10m_dominant: number[]
  uv_index_max: number[]
  sunrise: string[]
  sunset: string[]
  precipitation_hours: number[]
}

export interface CurrentWeather {
  temperature: number
  apparent_temperature: number
  weathercode: number
  windspeed: number
  windgusts: number
  winddirection: number
  relativehumidity: number
  dewpoint: number
  cloudcover: number
  visibility: number
  surface_pressure: number
  precipitation: number
  is_day: number
  time: string
}

export interface WeatherData {
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  current: CurrentWeather
  hourly: HourlyWeather
  daily: DailyWeather
}

export interface AirQualityData {
  hourly: {
    time: string[]
    pm2_5: number[]
    pm10: number[]
    ozone: number[]
    european_aqi: number[]
    us_aqi: number[]
  }
}

// ─── Trek ─────────────────────────────────────────────────────────────────────

export type TrekDifficulty = 'easy' | 'moderate' | 'hard' | 'technical'

export interface Trek {
  id: string
  slug: string
  name: string
  country: string
  region: string
  lat: number
  lon: number
  trailheadElevation: number
  summitElevation: number
  difficulty: TrekDifficulty
  durationDays: number
  description: string
  popular: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TrekWithVerdict extends Trek {
  verdict?: TrekVerdict | null
}

// ─── Trek Verdict ──────────────────────────────────────────────────────────────

export type TrekStatus = 'GO' | 'CAUTION' | 'NO-GO'

export type RiskFactor =
  | 'lightning'
  | 'wind_chill'
  | 'snow'
  | 'heat'
  | 'low_visibility'
  | 'high_uv'
  | 'rain'
  | 'ice'
  | 'storm'
  | 'altitude_sickness'

export interface TrekVerdictData {
  status: TrekStatus
  score: number // 0–10
  reasoning: string
  safestWindow: string
  bestDay: string
  risks: RiskFactor[]
  packingList: string[]
  generatedAt: string
}

export interface TrekVerdict {
  id: string
  trekId: string
  verdict: string // JSON string of TrekVerdictData
  createdAt: Date
  expiresAt: Date
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  type: 'city' | 'trek'
  slug: string
  name: string
  country: string
  region?: string
  lat: number
  lon: number
}

// ─── Units ────────────────────────────────────────────────────────────────────

export type TempUnit = 'C' | 'F'
export type WindUnit = 'kmh' | 'mph' | 'ms'
export type PrecipUnit = 'mm' | 'in'

export interface UnitPreferences {
  temp: TempUnit
  wind: WindUnit
  precip: PrecipUnit
}

// ─── Weather condition codes (WMO) ────────────────────────────────────────────

export interface WeatherCondition {
  label: string
  icon: string
  isStormy: boolean
}
