import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PeakWeather — Global Weather & AI Trek Forecasts'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 45%, #0284c7 100%)',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '72px' }}>🏔</div>
          <div
            style={{
              color: 'white',
              fontSize: '64px',
              fontWeight: 800,
              letterSpacing: '-2px',
            }}
          >
            PeakWeather
          </div>
        </div>
        <div
          style={{
            color: '#bfdbfe',
            fontSize: '28px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '800px',
          }}
        >
          Global Weather Forecasts & AI Trek Safety Verdicts
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {[
            { icon: '🌍', label: 'Any City Worldwide' },
            { icon: '🤖', label: '90+ Trek Verdicts' },
            { icon: '📡', label: 'Live Radar' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '14px 22px',
                color: 'white',
                fontSize: '20px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
