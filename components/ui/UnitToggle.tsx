'use client'

import { useUnits } from '@/lib/units'

export function UnitToggle() {
  const { units, setTemp, setWind } = useUnits()

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <button
        onClick={() => setTemp(units.temp === 'C' ? 'F' : 'C')}
        className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        title="Toggle temperature unit"
      >
        °{units.temp}
      </button>
      <span className="text-gray-300 dark:text-gray-600">|</span>
      <button
        onClick={() => setWind(units.wind === 'kmh' ? 'mph' : 'kmh')}
        className="px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        title="Toggle wind unit"
      >
        {units.wind}
      </button>
    </div>
  )
}
