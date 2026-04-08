import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') ?? 'Anonymous'
  const amount = searchParams.get('amount') ?? '0'
  const currency = searchParams.get('currency') ?? 'EUR'
  const wish = searchParams.get('wish') ?? ''
  const flag = searchParams.get('flag') ?? '🌍'
  const country = searchParams.get('country') ?? ''
  const challenger = searchParams.get('challenger') ?? ''
  const type = searchParams.get('type') ?? 'drop' // drop | challenge

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
        }}
      >
        {/* Background grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: '#CCFF00',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 60,
          fontSize: 32,
          fontWeight: 700,
          color: '#fff',
          display: 'flex',
          gap: 0,
        }}>
          <span style={{color: '#fff'}}>Flex</span>
          <span style={{color: '#CCFF00'}}>Drop</span>
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          top: 48,
          right: 60,
          fontSize: 18,
          color: '#555',
          display: 'flex',
        }}>
          flexdrop.io
        </div>

        {/* Main content */}
        {type === 'challenge' ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20}}>
            <div style={{fontSize:28,color:'#CCFF00',fontWeight:700,letterSpacing:2,textTransform:'uppercase',display:'flex'}}>
              ⚔️ Challenge
            </div>
            <div style={{fontSize:72,fontWeight:700,color:'#fff',textAlign:'center',lineHeight:1.1,display:'flex'}}>
              {name}
            </div>
            <div style={{fontSize:32,color:'#888',display:'flex',gap:12,alignItems:'center'}}>
              <span>vs</span>
              <span style={{color:'#ff6b6b',fontWeight:600}}>{challenger}</span>
            </div>
            <div style={{
              background:'#1a1a1a',
              border:'2px solid #CCFF00',
              borderRadius:20,
              padding:'16px 40px',
              fontSize:40,
              fontWeight:700,
              color:'#CCFF00',
              display:'flex',
            }}>
              {currency} {amount}
            </div>
            <div style={{fontSize:24,color:'#888',display:'flex'}}>
              Who's gonna fold? 💀
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
            <div style={{fontSize:24,color:'#CCFF00',fontWeight:700,letterSpacing:2,textTransform:'uppercase',display:'flex'}}>
              🔥 Just flexed
            </div>
            <div style={{
              background:'#111',
              border:'2px solid #CCFF00',
              borderRadius:24,
              padding:'20px 60px',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              gap:8,
            }}>
              <div style={{fontSize:80,fontWeight:700,color:'#CCFF00',lineHeight:1,display:'flex'}}>
                {currency} {amount}
              </div>
              <div style={{fontSize:28,color:'#fff',fontWeight:600,display:'flex'}}>
                {name}
              </div>
              <div style={{fontSize:20,color:'#888',display:'flex'}}>
                {flag} {country}
              </div>
            </div>
            {wish && (
              <div style={{
                fontSize:22,
                color:'#aaa',
                fontStyle:'italic',
                maxWidth:800,
                textAlign:'center',
                display:'flex',
              }}>
                "{wish.length > 80 ? wish.slice(0,80)+'...' : wish}"
              </div>
            )}
            <div style={{fontSize:26,color:'#fff',display:'flex',gap:8,alignItems:'center'}}>
              <span>Think you can outflex me?</span>
              <span style={{color:'#CCFF00',fontWeight:700}}>Prove it.</span>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{
          position:'absolute',
          bottom:0,
          left:0,
          right:0,
          height:60,
          background:'#111',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:40,
        }}>
          <span style={{fontSize:18,color:'#555',display:'flex'}}>No Forbes estimates.</span>
          <span style={{fontSize:18,color:'#333',display:'flex'}}>•</span>
          <span style={{fontSize:18,color:'#555',display:'flex'}}>No PR spin.</span>
          <span style={{fontSize:18,color:'#333',display:'flex'}}>•</span>
          <span style={{fontSize:18,color:'#555',display:'flex'}}>Just receipts.</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
