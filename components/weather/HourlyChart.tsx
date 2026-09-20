'use client'

import { useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Area,
} from 'recharts'
import { useUnits } from '@/lib/units'
import { displayTemp, displayWind, toF, kmhToMph } from '@/lib/utils'
import type { HourlyWeather } from '@/types'

interface Props {
  hourly: HourlyWeather
}

type Mode = 'temperature' | 'precipitation' | 'wind'

export function HourlyChart({ hourly }: Props) {
  const { units } = useUnits()
  const [mode, setMode] = useState<Mode>('temperature')

  const data = hourly.time.slice(0, 48).map((t, i) => {
    const hour = new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    return {
      hour,
      temp: units.temp === 'F' ? Math.round(toF(hourly.temperature_2m[i])) : Math.round(hourly.temperature_2m[i]),
      feelsLike: units.temp === 'F' ? Math.round(toF(hourly.apparent_temperature[i])) : Math.round(hourly.apparent_temperature[i]),
      precipProb: hourly.precipitation_probability[i] ?? 0,
      precip: hourly.precipitation[i] ?? 0,
      wind: units.wind === 'mph' ? Math.round(kmhToMph(hourly.windspeed_10m[i])) : Math.round(hourly.windspeed_10m[i]),
      gusts: units.wind === 'mph' ? Math.round(kmhToMph(hourly.windgusts_10m[i])) : Math.round(hourly.windgusts_10m[i]),
    }
  })

  const tempUnit = units.temp === 'F' ? '°F' : '°C'
  const windUnit = units.wind === 'mph' ? 'mph' : 'km/h'

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">48-Hour Forecast</h2>
        <div className="flex gap-1 text-xs shrink-0">
          {(['temperature', 'precipitation', 'wind'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 sm:px-2.5 py-1 rounded-full capitalize transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="hidden sm:inline">{m}</span>
              <span className="sm:hidden">{m === 'temperature' ? 'Temp' : m === 'precipitation' ? 'Rain' : 'Wind'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[180px] sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        {mode === 'temperature' ? (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={5} />
            <YAxis unit={tempUnit} tick={{ fontSize: 11 }} width={45} />
            <Tooltip formatter={(v, n) => [`${v}${tempUnit}`, n === 'temp' ? 'Temperature' : 'Feels Like']} />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temp" />
            <Line type="monotone" dataKey="feelsLike" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Feels Like" />
          </ComposedChart>
        ) : mode === 'precipitation' ? (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={5} />
            <YAxis yAxisId="prob" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} width={40} />
            <YAxis yAxisId="mm" orientation="right" unit="mm" tick={{ fontSize: 11 }} width={40} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="mm" dataKey="precip" fill="#60a5fa" opacity={0.6} name="Precip (mm)" />
            <Area yAxisId="prob" type="monotone" dataKey="precipProb" fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1.5} name="Probability (%)" />
          </ComposedChart>
        ) : (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={5} />
            <YAxis unit={` ${windUnit}`} tick={{ fontSize: 11 }} width={55} />
            <Tooltip formatter={(v, n) => [`${v} ${windUnit}`, n]} />
            <Legend />
            <Area type="monotone" dataKey="gusts" fill="#fde68a" stroke="#f59e0b" strokeWidth={1.5} name="Gusts" />
            <Line type="monotone" dataKey="wind" stroke="#f59e0b" strokeWidth={2} dot={false} name="Wind" />
          </ComposedChart>
        )}
      </ResponsiveContainer>
      </div>
    </div>
  )
}
