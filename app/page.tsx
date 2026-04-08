'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Leaderboard from '@/components/Leaderboard'
import LiveTicker from '@/components/LiveTicker'
import ChallengeBox from '@/components/ChallengeBox'
import LiveBattles from '@/components/LiveBattles'
import { collection, query, onSnapshot, where, Timestamp, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function Home() {
  const [tab, setTab] = useState<'today' | 'alltime'>('today')
  const [totalDropped, setTotalDropped] = useState<number>(0)
  const [totalBallers, setTotalBallers] = useState<number>(0)
  const [liveBattles, setLiveBattles] = useState<number>(14)

  useEffect(() => {
    // Fetch total dropped and ballers count from leaderboard_alltime
    const q = query(collection(db, 'leaderboard_alltime'), orderBy('amountEUR', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      let total = 0
      snap.docs.forEach(doc => {
        const data = doc.data()
        total += data.amountEUR || 0
      })
      setTotalDropped(total)
      setTotalBallers(snap.size)
    })
    return () => unsub()
  }, [])

  const formatTotal = (val: number) => {
    if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}k`
    return `€${val}`
  }

  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff'}}>
      <Navbar />

      {/* HERO */}
      <section style={{textAlign:'center',padding:'clamp(1rem,4vw,3rem) 1rem 1.5rem',maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#1a1a1a',border:'1px solid #333',borderRadius:20,padding:'5px 12px',fontSize:11,color:'#ccc',marginBottom:16}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'pulse 1s infinite'}} />
          38 drops in the last hour
        </div>
        <h1 style={{fontSize:'clamp(32px,6vw,56px)',fontWeight:500,lineHeight:1.1,marginBottom:10,color:'#fff'}}>
          Put up.<br />Or <span style={{color:'#CCFF00'}}>shut up.</span>
        </h1>
        <p style={{fontSize:'clamp(13px,2vw,16px)',color:'#ddd',marginBottom:5}}>No Forbes estimates. No PR spin. Just receipts.</p>
        <p style={{fontSize:'clamp(11px,1.5vw,13px)',color:'#999',marginBottom:24,lineHeight:1.6}}>
          Drop cash. Get famous. Challenge anyone.<br />Dare someone to outflex you — publicly.
        </p>
        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
          <Link href="/donate" style={{background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:12,padding:'13px 32px',fontSize:15,fontWeight:600,cursor:'pointer',textDecoration:'none'}}>
            Flex now
          </Link>
          <a href="#leaderboard" style={{background:'transparent',color:'#ddd',border:'1px solid #333',borderRadius:12,padding:'13px 24px',fontSize:15,fontWeight:500,cursor:'pointer',textDecoration:'none'}}>
            See who's winning
          </a>
        </div>
      </section>

      <LiveTicker />

      {/* STATS */}
      <section style={{maxWidth:1100,margin:'0 auto 1.5rem',padding:'0 1.5rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[
            {val:formatTotal(totalDropped),label:'Total dropped'},
            {val:totalBallers.toLocaleString(),label:'Ballers'},
            {val:liveBattles.toLocaleString(),label:'Live battles'},
          ].map(s=>(
            <div key={s.label} style={{background:'#111',border:'1px solid #222',borderRadius:12,padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:'clamp(18px,3vw,24px)',fontWeight:500,color:'#FFD700'}}>{s.val}</div>
              <div style={{fontSize:10,color:'#aaa',marginTop:2,textTransform:'uppercase',letterSpacing:'.05em'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT — 2 col on desktop, 1 col on mobile */}
      <section id="leaderboard" style={{maxWidth:1100,margin:'0 auto',padding:'0 1.5rem 3rem',display:'grid',gridTemplateColumns:'minmax(0,1.4fr) minmax(0,1fr)',gap:24}}>

        {/* LEFT — Leaderboard */}
        <div>
          <div style={{fontSize:11,color:'#aaa',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>
            🏆 Leaderboard
          </div>
          <div style={{display:'flex',gap:1,background:'#111',border:'1px solid #222',borderRadius:12,overflow:'hidden',padding:3,marginBottom:12}}>
            {(['today','alltime'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'9px',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',background:tab===t?'#222':'transparent',color:tab===t?'#fff':'#aaa',border:'none',borderRadius:8,transition:'all .15s'}}>
                {t==='today'?'Today':'All time'}
              </button>
            ))}
          </div>
          <Leaderboard tab={tab} />
        </div>

        {/* RIGHT — Challenge + Battles */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <div style={{fontSize:11,color:'#aaa',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>
              🔥 Challenge someone
            </div>
            <ChallengeBox />
          </div>
          <div>
            <div style={{fontSize:11,color:'#aaa',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>
              ⚔️ Live battles
            </div>
            <LiveBattles />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{maxWidth:1100,margin:'0 auto',padding:'0 1.5rem 3rem'}}>
        <div style={{background:'#111',border:'1px solid #222',borderRadius:16,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#aaa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>No cap</div>
          <h2 style={{fontSize:'clamp(18px,3vw,24px)',fontWeight:500,color:'#fff',marginBottom:6}}>Receipts or it didn't happen.</h2>
          <p style={{fontSize:13,color:'#999',marginBottom:18,lineHeight:1.6}}>
            Anyone can claim they're rich.<br />Here you prove it. Publicly. Permanently.
          </p>
          <Link href="/donate" style={{background:'#CCFF00',color:'#0a0a0a',borderRadius:12,padding:'13px 40px',fontSize:14,fontWeight:600,textDecoration:'none',display:'inline-block'}}>
            Flex now
          </Link>
        </div>
      </section>

      <div style={{textAlign:'center',paddingBottom:'2rem'}}>
        <Link href="/why" style={{fontSize:11,color:'#555',textDecoration:'underline'}}>Why does this exist? →</Link>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @media(max-width:768px){
          #leaderboard{grid-template-columns:1fr !important;}
        }
      `}</style>
    </main>
  )
}
