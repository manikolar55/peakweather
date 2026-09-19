import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
          borderRadius: 108,
        }}
      >
        <span style={{ fontSize: 256, fontWeight: 900, color: '#ffffff', letterSpacing: '-10px' }}>
          PW
        </span>
      </div>
    ),
    { width: 512, height: 512 },
  )
}
