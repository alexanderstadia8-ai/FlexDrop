'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export default function SuccessPage() {
  const params = useSearchParams()
  const amount = params.get('amount')
  const currency = params.get('currency')
  const uid = params.get('uid')
  const [user] = useAuthState(auth)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flexdrop.io'
  const shareUrl = appUrl

  const wish = '' // will be fetched if needed
  const name = user?.displayName ?? 'Someone'

  const ogUrl = `${appUrl}/api/og?name=${encodeURIComponent(name)}&amount=${amount}&currency=${currency}&type=drop`
  
  const tweetText = `I just flexed ${currency} ${amount} on FlexDrop 🔥 Think you can outflex me? Prove it. ${shareUrl}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCard = async () => {
    setDownloading(true)
    try {
      const res = await fetch(ogUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flexdrop-${amount}${currency}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  const shareInstagram = async () => {
    // Copy text to clipboard then download image
    await navigator.clipboard.writeText(`I just flexed ${currency} ${amount} on FlexDrop 🔥 Think you can outflex me? Prove it. flexdrop.io`)
    await downloadCard()
  }

  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff',fontFamily:'Inter,-apple-system,BlinkMacSystemFont,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{maxWidth:480,width:'100%',padding:'2rem 1.5rem',textAlign:'center'}}>

        <div style={{fontSize:56,marginBottom:'1rem'}}>🏆</div>

        <h1 style={{fontSize:32,fontWeight:600,color:'#fff',marginBottom:10}}>
          You're on the wall!
        </h1>
        <p style={{fontSize:15,color:'#aaa',marginBottom:6}}>
          Your <span style={{color:'#CCFF00',fontWeight:600}}>{currency} {amount}</span> drop is live.
        </p>
        <p style={{fontSize:13,color:'#666',marginBottom:'2rem'}}>
          Share your flex — dare someone to beat you.
        </p>

        {/* Preview card */}
        <div style={{background:'#111',border:'1px solid #222',borderRadius:16,overflow:'hidden',marginBottom:'1.5rem'}}>
          <img 
            src={ogUrl} 
            alt="Your flex card"
            style={{width:'100%',display:'block'}}
          />
        </div>

        {/* Share buttons */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1.5rem'}}>
          
          {/* Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
            target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#000',border:'1px solid #333',color:'#fff',borderRadius:12,padding:'13px',fontSize:14,fontWeight:500,textDecoration:'none'}}
          >
            <span style={{fontSize:16}}>𝕏</span> Tweet this flex
          </a>

          {/* Instagram */}
          <button
            onClick={shareInstagram}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',color:'#fff',border:'none',borderRadius:12,padding:'13px',fontSize:14,fontWeight:500,cursor:'pointer',width:'100%'}}
          >
            <span style={{fontSize:16}}>ig</span>
            {downloading ? 'Downloading...' : 'Download card for Instagram Story'}
          </button>

          {/* Download card */}
          <button
            onClick={downloadCard}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#1a1a1a',border:'1px solid #333',color:'#aaa',borderRadius:12,padding:'13px',fontSize:14,fontWeight:500,cursor:'pointer',width:'100%'}}
          >
            ⬇ Download share card
          </button>

          {/* Copy link */}
          <button
            onClick={copyLink}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#1a1a1a',border:'1px solid #333',color:copied?'#CCFF00':'#aaa',borderRadius:12,padding:'13px',fontSize:14,fontWeight:500,cursor:'pointer',width:'100%'}}
          >
            {copied ? '✓ Link copied!' : '🔗 Copy link'}
          </button>
        </div>

        <div style={{display:'flex',gap:8}}>
          <Link href="/" style={{flex:1,background:'#CCFF00',color:'#0a0a0a',borderRadius:12,padding:'13px',fontSize:14,fontWeight:600,textDecoration:'none',display:'block'}}>
            See leaderboard
          </Link>
          <Link href="/donate" style={{flex:1,background:'#1a1a1a',border:'1px solid #333',color:'#fff',borderRadius:12,padding:'13px',fontSize:14,fontWeight:500,textDecoration:'none',display:'block'}}>
            Drop again
          </Link>
        </div>

        <p style={{fontSize:11,color:'#333',marginTop:'1rem'}}>
          For Instagram: download the card, then post it as a Story with the text already copied 📋
        </p>

      </div>
    </main>
  )
}
