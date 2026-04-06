'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatAmount } from '@/lib/currencies'

type Donor = {
  id: string
  displayName: string
  photoURL: string
  amount: number
  amountEUR: number
  currency: string
  wish: string
  country: string
  flag: string
  instagram?: string
  twitter?: string
  twitch?: string
}

function Avatar({ donor, size, onClick }: { donor: Donor; size: number; onClick?: () => void }) {
  const style: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%', objectFit: 'cover',
    flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
    border: '2px solid #333',
  }
  if (donor.photoURL) {
    return <Image src={donor.photoURL} alt={donor.displayName} width={size} height={size} style={style} onClick={onClick} />
  }
  const colors = ['#D85A30','#534AB7','#0F6E56','#185FA5','#993C1D','#3B6D11']
  const bg = colors[donor.displayName?.charCodeAt(0) % colors.length ?? 0]
  const initials = donor.displayName?.split(' ').map((w:string)=>w[0]).join('').slice(0,2) ?? '??'
  return (
    <div onClick={onClick} style={{...style,background:bg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:500,fontSize:size*0.33}}>
      {initials}
    </div>
  )
}

function PodiumBlock({ donor, rank, tab }: { donor: Donor; rank: 1|2|3; tab: string }) {
  const router = useRouter()
  const heights = {1:135,2:90,3:70}
  const blockBg = {1:'#CCFF00',2:'#1a1a1a',3:'#1a1a1a'}
  const blockColor = {1:'#0a0a0a',2:'#fff',3:'#FFD700'}
  const blockBorder = {1:'none',2:'1px solid #333',3:'1px solid #854F0B'}
  const borderColor = {1:'#CCFF00',2:'#666',3:'#854F0B'}
  const isToday = tab === 'today'
  const labels: Record<number,string> = {1: isToday ? "Today's #1" : 'All time #1', 2: '2nd', 3: '3rd'}
  const badgeBg: Record<number,string> = {1:'#CCFF00',2:'#333',3:'#1a0a00'}
  const badgeColor: Record<number,string> = {1:'#0a0a0a',2:'#ddd',3:'#FFD700'}

  const goToProfile = () => router.push(`/profile/${donor.id}`)

  const primarySocial = donor.twitter
    ? `https://twitter.com/${donor.twitter}`
    : donor.instagram
    ? `https://instagram.com/${donor.instagram}`
    : donor.twitch
    ? `https://twitch.tv/${donor.twitch}`
    : null

  const handleAvatarClick = () => {
    if (primarySocial) window.open(primarySocial, '_blank')
    else goToProfile()
  }

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,maxWidth:190}}>
      <span style={{fontSize:9,padding:'2px 7px',borderRadius:20,marginBottom:4,fontWeight:500,background:badgeBg[rank],color:badgeColor[rank],border:rank===3?'1px solid #854F0B':'none'}}>
        {labels[rank]}
      </span>
      <div style={{border:`3px solid ${borderColor[rank]}`,borderRadius:'50%',marginBottom:5,cursor:'pointer'}} onClick={handleAvatarClick}>
        <Avatar donor={donor} size={56} />
      </div>
      <div style={{display:'flex',gap:3,marginBottom:4}}>
        {donor.twitter && <a href={`https://twitter.com/${donor.twitter}`} target="_blank" rel="noopener noreferrer" style={{width:15,height:15,borderRadius:3,background:'#000',border:'1px solid #333',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:'#fff',textDecoration:'none'}}>𝕏</a>}
        {donor.twitch && <a href={`https://twitch.tv/${donor.twitch}`} target="_blank" rel="noopener noreferrer" style={{width:15,height:15,borderRadius:3,background:'#6441a5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:'#fff',textDecoration:'none'}}>tw</a>}
        {donor.instagram && <a href={`https://instagram.com/${donor.instagram}`} target="_blank" rel="noopener noreferrer" style={{width:15,height:15,borderRadius:3,background:'#E1306C',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:'#fff',textDecoration:'none'}}>ig</a>}
      </div>
      <div style={{fontSize:11,fontWeight:500,color:'#fff',marginBottom:1,textAlign:'center',cursor:'pointer'}} onClick={goToProfile}>{donor.displayName}</div>
      <div style={{fontSize:10,color:'#aaa',marginBottom:3}}>{donor.flag} {donor.country}</div>
      <div style={{fontSize:12,fontWeight:500,color:'#FFD700',marginBottom:5}}>{formatAmount(donor.amount,donor.currency)}</div>
      <div style={{width:'100%',borderRadius:'4px 4px 0 0',height:heights[rank],background:blockBg[rank],border:blockBorder[rank],display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:500,color:blockColor[rank]}}>
        {rank}
      </div>
    </div>
  )
}

function DonorRow({ donor, rank, gapEUR }: { donor: Donor; rank: number; gapEUR?: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const primarySocial = donor.twitter
    ? `https://twitter.com/${donor.twitter}`
    : donor.instagram
    ? `https://instagram.com/${donor.instagram}`
    : donor.twitch
    ? `https://twitch.tv/${donor.twitch}`
    : null

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (primarySocial) window.open(primarySocial, '_blank')
    else router.push(`/profile/${donor.id}`)
  }

  return (
    <div>
      <div onClick={()=>setOpen(!open)} style={{background:'#111',border:`1px solid ${open?'#333':'#222'}`,borderRadius:open?'12px 12px 0 0':12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
        <div style={{fontSize:12,color:'#aaa',width:18,textAlign:'center',flexShrink:0}}>{rank}</div>
        <div onClick={handleAvatarClick}>
          <Avatar donor={donor} size={40} />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:500,color:'#fff'}} onClick={(e)=>{e.stopPropagation();router.push(`/profile/${donor.id}`)}}>{donor.displayName}</div>
          <div style={{fontSize:11,color:'#aaa',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontStyle:'italic'}}>"{donor.wish}"</div>
          <div style={{fontSize:10,color:'#666'}}>{donor.flag} {donor.country}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:500,color:'#FFD700'}}>{formatAmount(donor.amount,donor.currency)}</div>
          {gapEUR && gapEUR > 0 && <div style={{fontSize:10,color:'#ff6b6b'}}>€{Math.round(gapEUR)} to #{rank-1}</div>}
        </div>
      </div>
      {open && (
        <div style={{background:'#0f0f0f',border:'1px solid #333',borderTop:'none',borderRadius:'0 0 12px 12px',padding:'10px 14px'}}>
          <p style={{fontSize:12,color:'#ddd',fontStyle:'italic',marginBottom:10,lineHeight:1.6,borderLeft:'2px solid #333',paddingLeft:10}}>"{donor.wish}"</p>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {donor.twitter && <a href={`https://twitter.com/${donor.twitter}`} target="_blank" rel="noopener noreferrer" style={{padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:500,color:'#fff',background:'#000',border:'1px solid #333',textDecoration:'none'}}>𝕏 Twitter</a>}
            {donor.twitch && <a href={`https://twitch.tv/${donor.twitch}`} target="_blank" rel="noopener noreferrer" style={{padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:500,color:'#fff',background:'#6441a5',textDecoration:'none'}}>🎮 Twitch</a>}
            {donor.instagram && <a href={`https://instagram.com/${donor.instagram}`} target="_blank" rel="noopener noreferrer" style={{padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:500,color:'#fff',background:'#E1306C',textDecoration:'none'}}>ig Instagram</a>}
            <button onClick={()=>router.push(`/profile/${donor.id}`)} style={{padding:'5px 12px',borderRadius:20,fontSize:11,fontWeight:500,color:'#fff',background:'#222',border:'none',cursor:'pointer'}}>View profile</button>
          </div>
        </div>
      )}
    </div>
  )
}

function FullRanking({ donors }: { donors: Donor[] }) {
  const router = useRouter()
  return (
    <div style={{marginTop:'1rem'}}>
      <div style={{fontSize:11,color:'#555',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,padding:'0 1rem'}}>Full ranking</div>
      <div style={{display:'flex',flexDirection:'column',gap:4,padding:'0 1rem'}}>
        {donors.map((donor, i) => (
          <div key={donor.id} onClick={()=>router.push(`/profile/${donor.id}`)} style={{background:'#0f0f0f',border:'1px solid #1a1a1a',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
            <div style={{fontSize:11,color:'#555',width:24,textAlign:'center',flexShrink:0}}>#{i+1}</div>
            <Avatar donor={donor} size={28} />
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:'#ddd',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{donor.displayName}</div>
              <div style={{fontSize:10,color:'#555'}}>{donor.flag} {donor.country}</div>
            </div>
            <div style={{fontSize:12,fontWeight:500,color:'#FFD700',flexShrink:0}}>{formatAmount(donor.amount,donor.currency)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Leaderboard({ tab }: { tab: 'today' | 'alltime' }) {
  const [donors, setDonors] = useState<Donor[]>([])
  const [allDonors, setAllDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    setLoading(true)
    setShowFull(false)
    let q
    if (tab === 'today') {
      // Use local timezone midnight
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      q = query(collection(db,'donations'),where('createdAt','>=',Timestamp.fromDate(start)),orderBy('amountEUR','desc'),limit(20))
    } else {
      q = query(collection(db,'leaderboard_alltime'),orderBy('amountEUR','desc'),limit(20))
    }
    const unsub = onSnapshot(q,(snap)=>{
      setDonors(snap.docs.map(d=>({id:d.id,...d.data()} as Donor)))
      setLoading(false)
    })
    return ()=>unsub()
  },[tab])

  useEffect(() => {
    if (!showFull || tab !== 'alltime') return
    const q = query(collection(db,'leaderboard_alltime'),orderBy('amountEUR','desc'),limit(200))
    const unsub = onSnapshot(q,(snap)=>{
      setAllDonors(snap.docs.map(d=>({id:d.id,...d.data()} as Donor)))
    })
    return ()=>unsub()
  },[showFull, tab])

  if (loading) return (
    <div style={{textAlign:'center',padding:'3rem 1rem',color:'#555',fontSize:13}}>
      Awaiting first donation...
    </div>
  )

  if (donors.length===0) return (
    <div style={{textAlign:'center',padding:'3rem 1rem'}}>
      <div style={{fontSize:13,color:'#555'}}>Awaiting first donation...</div>
    </div>
  )

  const [first, second, third, ...rest] = donors

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:8,padding:'0 1rem',marginBottom:'.75rem'}}>
        {second && <PodiumBlock donor={second} rank={2} tab={tab} />}
        {first && <PodiumBlock donor={first} rank={1} tab={tab} />}
        {third && <PodiumBlock donor={third} rank={3} tab={tab} />}
      </div>

      {rest.length>0 && (
        <div style={{display:'flex',flexDirection:'column',gap:5,padding:'0 1rem'}}>
          {rest.map((donor,i)=>(
            <DonorRow key={donor.id} donor={donor} rank={i+4} gapEUR={donors[i+2]?.amountEUR ? donor.amountEUR - donors[i+2].amountEUR : undefined} />
          ))}
        </div>
      )}

      {tab === 'alltime' && (
        <div style={{padding:'0 1rem',marginTop:'1rem'}}>
          <button
            onClick={()=>setShowFull(!showFull)}
            style={{width:'100%',background:'#111',border:'1px solid #222',borderRadius:12,padding:'11px',fontSize:12,color:'#aaa',cursor:'pointer',fontWeight:500}}
          >
            {showFull ? 'Hide full ranking ↑' : 'Show full ranking — every drop ever ↓'}
          </button>
          {showFull && <FullRanking donors={allDonors} />}
        </div>
      )}
    </div>
  )
}
