'use client'
import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏', color: '#000', border: '1px solid #333' },
  { id: 'instagram', label: 'Instagram', icon: 'ig', color: '#E1306C', border: 'none' },
  { id: 'twitch', label: 'Twitch', icon: '🎮', color: '#6441a5', border: 'none' },
]

export default function ChallengeBox() {
  const [user] = useAuthState(auth)
  const [target, setTarget] = useState('')
  const [selected, setSelected] = useState('twitter')
  const [sent, setSent] = useState(false)
  const [selfError, setSelfError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flexdrop.io'

  const sendChallenge = async () => {
    if (!target.trim()) return

    // Check self-challenge
    if (user && (
      target.toLowerCase().includes(user.displayName?.toLowerCase() ?? 'xxxxxx') ||
      target.toLowerCase().includes(user.email?.split('@')[0].toLowerCase() ?? 'xxxxxx')
    )) {
      setSelfError(true)
      setTimeout(() => setSelfError(false), 3000)
      return
    }
    setSelfError(false)

    const challengerName = user?.displayName ?? 'Someone'
    const text = `Hey ${target} — I just dropped on FlexDrop and I'm calling you out. Think you can outflex me? Prove it. 💸🔥 ${appUrl}`

    if (selected === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } else if (selected === 'twitch') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } else if (selected === 'instagram') {
      // Download challenge card + copy text
      const ogUrl = `${appUrl}/api/og?name=${encodeURIComponent(challengerName)}&challenger=${encodeURIComponent(target)}&type=challenge&amount=&currency=`
      setDownloading(true)
      try {
        await navigator.clipboard.writeText(text)
        const res = await fetch(ogUrl)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flexdrop-challenge.png`
        a.click()
        URL.revokeObjectURL(url)
        setSent(true)
        setTimeout(() => setSent(false), 4000)
      } catch(e) {
        console.error(e)
      } finally {
        setDownloading(false)
      }
    }
  }

  return (
    <div style={{margin:'0 1rem',background:'#111',border:'1px solid #CCFF00',borderRadius:16,padding:'1.25rem'}}>
      <div style={{fontSize:13,fontWeight:500,color:'#CCFF00',marginBottom:3}}>Send a public callout</div>
      <div style={{fontSize:11,color:'#aaa',marginBottom:12}}>Type their handle or name. We send the challenge publicly.</div>

      <input
        value={target}
        onChange={e=>setTarget(e.target.value)}
        placeholder="@elonmusk, @yourfriend, anyone..."
        style={{width:'100%',background:'#0a0a0a',border:'1px solid #333',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#fff',outline:'none',marginBottom:10,fontFamily:'inherit'}}
      />

      <div style={{fontSize:10,color:'#aaa',marginBottom:7}}>Send via:</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
        {PLATFORMS.map(p=>(
          <div
            key={p.id}
            onClick={()=>setSelected(p.id)}
            style={{
              background: selected===p.id ? '#0f1a00' : '#0a0a0a',
              border: `1px solid ${selected===p.id ? '#CCFF00' : '#2a2a2a'}`,
              borderRadius:8,padding:'8px 6px',textAlign:'center',cursor:'pointer',
            }}
          >
            <div style={{fontSize:15,marginBottom:2}}>{p.icon}</div>
            <div style={{fontSize:9,color:'#aaa'}}>{p.label}</div>
          </div>
        ))}
      </div>

      {selected === 'instagram' && (
        <div style={{background:'#1a0010',border:'1px solid #E1306C33',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#E1306C',marginBottom:10,lineHeight:1.5}}>
          A challenge card will be downloaded + text copied to clipboard. Post the card as an Instagram Story!
        </div>
      )}

      {selfError && (
        <div style={{background:'#1a0000',border:'1px solid #ff6b6b33',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#ff6b6b',marginBottom:10}}>
          You can't challenge yourself 💀 Find someone else to outflex.
        </div>
      )}

      {sent && selected === 'instagram' && (
        <div style={{background:'#0f1a00',border:'1px solid #CCFF0033',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#CCFF00',marginBottom:10}}>
          ✓ Card downloaded + text copied! Post it as your Instagram Story.
        </div>
      )}

      <button
        onClick={sendChallenge}
        disabled={downloading}
        style={{width:'100%',background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:8,padding:11,fontSize:13,fontWeight:600,cursor:'pointer',opacity:downloading?0.7:1}}
      >
        {downloading ? 'Preparing card...' : sent && selected !== 'instagram' ? '✓ Callout sent!' : 'Send the callout 🔥'}
      </button>
    </div>
  )
}
