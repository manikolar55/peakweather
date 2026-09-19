import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TempUnit, WindUnit, PrecipUnit, WeatherCondition } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toC(f: number) {
  return (f - 32) * (5 / 9)
}

export function toF(c: number) {
  return c * (9 / 5) + 32
}

export function displayTemp(c: number, unit: TempUnit): string {
  if (unit === 'F') return `${Math.round(toF(c))}°F`
  return `${Math.round(c)}°C`
}

export function kmhToMph(kmh: number) {
  return kmh * 0.621371
}

export function kmhToMs(kmh: number) {
  return kmh * 0.277778
}

export function displayWind(kmh: number, unit: WindUnit): string {
  if (unit === 'mph') return `${Math.round(kmhToMph(kmh))} mph`
  if (unit === 'ms') return `${kmhToMs(kmh).toFixed(1)} m/s`
  return `${Math.round(kmh)} km/h`
}

export function mmToIn(mm: number) {
  return mm * 0.0393701
}

export function displayPrecip(mm: number, unit: PrecipUnit): string {
  if (unit === 'in') return `${mmToIn(mm).toFixed(2)} in`
  return `${mm.toFixed(1)} mm`
}

export function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// WMO Weather Interpretation Codes
const WMO_CODES: Record<number, WeatherCondition> = {
  0: { label: 'Clear sky', icon: 'clear-day', isStormy: false },
  1: { label: 'Mainly clear', icon: 'clear-day', isStormy: false },
  2: { label: 'Partly cloudy', icon: 'partly-cloudy-day', isStormy: false },
  3: { label: 'Overcast', icon: 'cloudy', isStormy: false },
  45: { label: 'Fog', icon: 'fog', isStormy: false },
  48: { label: 'Depositing rime fog', icon: 'fog', isStormy: false },
  51: { label: 'Light drizzle', icon: 'drizzle', isStormy: false },
  53: { label: 'Moderate drizzle', icon: 'drizzle', isStormy: false },
  55: { label: 'Dense drizzle', icon: 'drizzle', isStormy: false },
  56: { label: 'Light freezing drizzle', icon: 'sleet', isStormy: false },
  57: { label: 'Heavy freezing drizzle', icon: 'sleet', isStormy: false },
  61: { label: 'Slight rain', icon: 'rain', isStormy: false },
  63: { label: 'Moderate rain', icon: 'rain', isStormy: false },
  65: { label: 'Heavy rain', icon: 'rain', isStormy: false },
  66: { label: 'Light freezing rain', icon: 'sleet', isStormy: false },
  67: { label: 'Heavy freezing rain', icon: 'sleet', isStormy: false },
  71: { label: 'Slight snowfall', icon: 'snow', isStormy: false },
  73: { label: 'Moderate snowfall', icon: 'snow', isStormy: false },
  75: { label: 'Heavy snowfall', icon: 'snow', isStormy: false },
  77: { label: 'Snow grains', icon: 'snow', isStormy: false },
  80: { label: 'Slight showers', icon: 'showers', isStormy: false },
  81: { label: 'Moderate showers', icon: 'showers', isStormy: false },
  82: { label: 'Violent showers', icon: 'showers', isStormy: true },
  85: { label: 'Slight snow showers', icon: 'snow', isStormy: false },
  86: { label: 'Heavy snow showers', icon: 'snow', isStormy: true },
  95: { label: 'Thunderstorm', icon: 'thunderstorm', isStormy: true },
  96: { label: 'Thunderstorm with hail', icon: 'thunderstorm', isStormy: true },
  99: { label: 'Thunderstorm with heavy hail', icon: 'thunderstorm', isStormy: true },
}

export function getWeatherCondition(code: number): WeatherCondition {
  return WMO_CODES[code] ?? { label: 'Unknown', icon: 'cloudy', isStormy: false }
}

export function getAqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-600' }
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' }
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-600' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-700' }
  return { label: 'Hazardous', color: 'text-red-900' }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  })
}
