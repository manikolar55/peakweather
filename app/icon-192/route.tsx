import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
          borderRadius: 40,
        }}
      >
        <span style={{ fontSize: 96, fontWeight: 900, color: '#ffffff', letterSpacing: '-4px' }}>
          PW
        </span>
      </div>
    ),
    { width: 192, height: 192 },
  )
}
