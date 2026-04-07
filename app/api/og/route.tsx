import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name') ?? 'Anonymous'
    const amount = searchParams.get('amount') ?? '0'
    const currency = searchParams.get('currency') ?? 'EUR'
    const wishRaw = searchParams.get('wish') ?? ''
    const flag = searchParams.get('flag') ?? '🌍'
    const country = searchParams.get('country') ?? ''
    const challenger = searchParams.get('challenger') ?? ''
    const type = searchParams.get('type') ?? 'drop'

    // Pre-processa la stringa wish per evitare errori JSX nel render
    const wish = wishRaw.length > 80 ? wishRaw.slice(0, 80) + '...' : wishRaw

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            position: 'relative',
            color: '#fff',
          }}
        >
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />

          {/* Top accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#CCFF00',
          }} />

          {/* Header */}
          <div style={{
            position: 'absolute',
            top: 40,
            left: 60,
            fontSize: 32,
            fontWeight: 700,
            display: 'flex',
            gap: 0,
          }}>
            <span>Flex</span>
            <span style={{ color: '#CCFF00' }}>Drop</span>
          </div>

          <div style={{
            position: 'absolute',
            top: 48,
            right: 60,
            fontSize: 18,
            color: '#555',
          }}>
            flexdrop.io
          </div>

          {/* Content */}
          {type === 'challenge' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 1 }}>
              <div style={{ fontSize: 28, color: '#CCFF00', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                ⚔️ Challenge
              </div>
              <div style={{ fontSize: 72, fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>
                {name}
              </div>
              <div style={{ fontSize: 32, color: '#888', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span>vs</span>
                <span style={{ color: '#ff6b6b', fontWeight: 600 }}>{challenger}</span>
              </div>
              <div style={{
                background: '#1a1a1a',
                border: '2px solid #CCFF00',
                borderRadius: 20,
                padding: '16px 40px',
                fontSize: 40,
                fontWeight: 700,
                color: '#CCFF00',
              }}>
                {currency} {amount}
              </div>
              <div style={{ fontSize: 24, color: '#888' }}>
                Who's gonna fold? 💀
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, zIndex: 1 }}>
              <div style={{ fontSize: 24, color: '#CCFF00', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                🔥 Just flexed
              </div>
              
              <div style={{
                background: '#111',
                border: '2px solid #CCFF00',
                borderRadius: 24,
                padding: '20px 60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{ fontSize: 80, fontWeight: 700, color: '#CCFF00', lineHeight: 1 }}>
                  {currency} {amount}
                </div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {name}
                </div>
                <div style={{ fontSize: 20, color: '#888' }}>
                  {flag} {country}
                </div>
              </div>

              {wish && (
                <div style={{
                  fontSize: 22,
                  color: '#aaa',
                  fontStyle: 'italic',
                  maxWidth: 800,
                  textAlign: 'center',
                  paddingHorizontal: 20,
                }}>
                  "{wish}"
                </div>
              )}

              <div style={{ fontSize: 26, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>Think you can outflex me?</span>
                <span style={{ color: '#CCFF00', fontWeight: 700 }}>Prove it.</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            fontSize: 18,
            color: '#555',
          }}>
            <span>No Forbes estimates.</span>
            <span>•</span>
            <span>No PR spin.</span>
            <span>•</span>
            <span>Just receipts.</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log('OG Error:', e.message)
    return new Response('Failed to generate image', { status: 500 })
  }
}