'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { UnitPreferences, TempUnit, WindUnit, PrecipUnit } from '@/types'

const defaults: UnitPreferences = { temp: 'C', wind: 'kmh', precip: 'mm' }

const UnitsContext = createContext<{
  units: UnitPreferences
  setTemp: (u: TempUnit) => void
  setWind: (u: WindUnit) => void
  setPrecip: (u: PrecipUnit) => void
}>({
  units: defaults,
  setTemp: () => {},
  setWind: () => {},
  setPrecip: () => {},
})

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<UnitPreferences>(defaults)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pw-units')
      if (stored) setUnits(JSON.parse(stored))
    } catch {}
  }, [])

  function update(next: UnitPreferences) {
    setUnits(next)
    try { localStorage.setItem('pw-units', JSON.stringify(next)) } catch {}
  }

  return (
    <UnitsContext.Provider value={{
      units,
      setTemp: (u) => update({ ...units, temp: u }),
      setWind: (u) => update({ ...units, wind: u }),
      setPrecip: (u) => update({ ...units, precip: u }),
    }}>
      {children}
    </UnitsContext.Provider>
  )
}

export function useUnits() {
  return useContext(UnitsContext)
}
