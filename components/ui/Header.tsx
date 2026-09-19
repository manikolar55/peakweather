import Link from 'next/link'
import { SearchBar } from '@/components/ui/SearchBar'
import { UnitToggle } from '@/components/ui/UnitToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg text-blue-600 dark:text-blue-400 shrink-0">
          ⛰ PeakWeather
        </Link>
        <SearchBar className="flex-1 max-w-lg" />
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/treks" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Treks</Link>
          <Link href="/radar" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Radar</Link>
        </nav>
        <div className="flex items-center gap-1 ml-auto">
          <UnitToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
