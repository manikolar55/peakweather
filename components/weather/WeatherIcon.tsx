interface IconProps {
  icon: string
  className?: string
  size?: number
}

export function WeatherIcon({ icon, className = '', size = 48 }: IconProps) {
  const s = size
  const icons: Record<string, React.ReactNode> = {
    'clear-day': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <circle cx="24" cy="24" r="9" fill="#FBBF24" />
        {[0,45,90,135,180,225,270,315].map((deg) => (
          <line key={deg} x1="24" y1="5" x2="24" y2="11" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${deg} 24 24)`} />
        ))}
      </svg>
    ),
    'clear-night': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <path d="M20 10 C14 16 14 32 24 36 C16 38 8 32 8 22 C8 12 14 6 22 8 Z" fill="#94A3B8" />
        <circle cx="32" cy="12" r="2" fill="#E2E8F0" />
        <circle cx="38" cy="20" r="1.5" fill="#E2E8F0" />
        <circle cx="36" cy="8" r="1" fill="#E2E8F0" />
      </svg>
    ),
    'partly-cloudy-day': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <circle cx="18" cy="18" r="7" fill="#FBBF24" />
        {[0,60,120,180,240,300].map((deg) => (
          <line key={deg} x1="18" y1="4" x2="18" y2="8" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${deg} 18 18)`} />
        ))}
        <rect x="14" y="26" width="26" height="14" rx="7" fill="white" />
        <rect x="20" y="22" width="18" height="12" rx="6" fill="white" />
      </svg>
    ),
    'partly-cloudy-night': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <path d="M14 9 C10 13 10 23 17 26 C12 27 6 23 6 17 C6 11 10 7 15 9 Z" fill="#94A3B8" />
        <rect x="14" y="28" width="26" height="13" rx="6.5" fill="#CBD5E1" />
        <rect x="20" y="24" width="18" height="11" rx="5.5" fill="#CBD5E1" />
      </svg>
    ),
    'cloudy': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="22" width="32" height="16" rx="8" fill="#94A3B8" />
        <rect x="14" y="16" width="22" height="14" rx="7" fill="#94A3B8" />
        <rect x="20" y="12" width="16" height="12" rx="6" fill="#94A3B8" />
      </svg>
    ),
    'fog': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="16" width="32" height="16" rx="8" fill="#94A3B8" />
        {[24, 30, 36].map((y) => (
          <line key={y} x1="8" y1={y} x2="40" y2={y} stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </svg>
    ),
    'drizzle': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="10" width="32" height="16" rx="8" fill="#64748B" />
        <rect x="14" y="6" width="22" height="12" rx="6" fill="#64748B" />
        {[[16,32],[24,35],[32,32],[20,38],[28,38]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#93C5FD" />
        ))}
      </svg>
    ),
    'rain': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="8" width="32" height="16" rx="8" fill="#475569" />
        <rect x="14" y="4" width="22" height="12" rx="6" fill="#475569" />
        {[[14,30],[22,30],[30,30],[18,38],[26,38]].map(([x,y], i) => (
          <line key={i} x1={x} y1={y} x2={x-2} y2={y+6} stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
    'sleet': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="8" width="32" height="16" rx="8" fill="#475569" />
        <rect x="14" y="4" width="22" height="12" rx="6" fill="#475569" />
        {[[14,30],[30,30]].map(([x,y], i) => (
          <line key={i} x1={x} y1={y} x2={x-2} y2={y+6} stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
        ))}
        {[[22,30],[18,38],[26,38]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#E2E8F0" />
        ))}
      </svg>
    ),
    'snow': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="8" width="32" height="16" rx="8" fill="#64748B" />
        <rect x="14" y="4" width="22" height="12" rx="6" fill="#64748B" />
        {[[14,32],[22,35],[30,32],[18,40],[26,40]].map(([x,y], i) => (
          <text key={i} x={x} y={y} fontSize="8" fill="#BAE6FD" textAnchor="middle">❄</text>
        ))}
      </svg>
    ),
    'showers': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="8" y="8" width="32" height="16" rx="8" fill="#334155" />
        <rect x="14" y="4" width="22" height="12" rx="6" fill="#334155" />
        {[[14,29],[20,29],[26,29],[32,29],[17,36],[23,36],[29,36]].map(([x,y], i) => (
          <line key={i} x1={x} y1={y} x2={x+3} y2={y+6} stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
    'thunderstorm': (
      <svg viewBox="0 0 48 48" width={s} height={s} className={className} aria-hidden>
        <rect x="6" y="6" width="36" height="18" rx="9" fill="#1E293B" />
        <rect x="12" y="2" width="24" height="14" rx="7" fill="#1E293B" />
        <polygon points="26,24 20,34 24,34 18,44 30,30 26,30" fill="#FDE047" />
      </svg>
    ),
  }

  return (
    <>{icons[icon] ?? icons['cloudy']}</>
  )
}

export function getIconForCode(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'clear-day' : 'clear-night'
  if (code <= 2) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
  if (code === 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'showers'
  if (code <= 86) return 'snow'
  return 'thunderstorm'
}
