'use client'

import { ThemeProvider } from 'next-themes'
import { UnitsProvider } from '@/lib/units'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UnitsProvider>{children}</UnitsProvider>
    </ThemeProvider>
  )
}
