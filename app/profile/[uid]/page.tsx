'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'

type Profile = {
  displayName: string
  photoURL: string
  email?: string
  wish: string
  country: string
  flag: string
  amountEUR: number
  donationCount?: number
  instagram?: string
  twitter?: string
  twitch?: string
  updatedAt?: any
}

export default function ProfilePage() {
  const params = useParams()
  const uid = params.uid as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    // Try leaderboard_alltime first, then user_profiles as fallback
    getDoc(doc(db, 'leaderboard_alltime', uid)).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data() as Profile)
        setLoading(false)
      } else {
        // Fallback to user_profiles
        getDoc(doc(db, 'user_profiles', uid)).then(snap2 => {
          if (snap2.exists()) setProfile(snap2.data() as Profile)
          setLoading(false)
        })
      }
    })
  }, [uid])

  if (loading) return (
    <main style={{background:'#0a0a0a',minHeight:'100vh'}}>
      <Navbar />
      <div style={{textAlign:'center',padding:'4rem',color:'#555',fontSize:13}}>Loading...</div>
    </main>
  )

  if (!profile) return (
    <main style={{background:'#0a0a0a',minHeight:'100vh'}}>
      <Navbar />
      <div style={{textAlign:'center',padding:'4rem',color:'#555',fontSize:13}}>Profile not found.</div>
    </main>
  )

  const joinDate = profile.updatedAt?.toDate
    ? profile.updatedAt.toDate().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})
    : null

  const primarySocial = profile.twitter
    ? `https://twitter.com/${profile.twitter}`
    : profile.instagram
    ? `https://instagram.com/${profile.instagram}`
    : profile.twitch
    ? `https://twitch.tv/${profile.twitch}`
    : null

  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff'}}>
      <Navbar />
      <div style={{maxWidth:480,margin:'0 auto',padding:'1.5rem 1rem 3rem'}}>
        <Link href="/" style={{fontSize:13,color:'#555',textDecoration:'none',marginBottom:'1.5rem',display:'inline-block'}}>← Back to wall</Link>

        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          {profile.photoURL ? (
            <Image src={profile.photoURL} alt={profile.displayName} width={110} height={110}
              style={{borderRadius:'50%',objectFit:'cover',border:'3px solid #CCFF00',cursor:primarySocial?'pointer':'default'}}
              onClick={()=>primarySocial && window.open(primarySocial,'_blank')}
            />
          ) : (
            <div style={{width:110,height:110,borderRadius:'50%',background:'#1a1a1a',border:'3px solid #CCFF00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,fontWeight:500,margin:'0 auto',cursor:primarySocial?'pointer':'default'}}
              onClick={()=>primarySocial && window.open(primarySocial,'_blank')}>
              {profile.displayName?.[0]}
            </div>
          )}
          <h1 style={{fontSize:22,fontWeight:500,marginTop:12,marginBottom:4}}>{profile.displayName}</h1>
          <div style={{fontSize:13,color:'#aaa',marginBottom:joinDate?6:0}}>{profile.flag} {profile.country}</div>
          {joinDate && <div style={{fontSize:11,color:'#555'}}>On the wall since {joinDate}</div>}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1.25rem'}}>
          <div style={{background:'#111',border:'1px solid #222',borderRadius:12,padding:14,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:500,color:'#FFD700'}}>€{Math.round(profile.amountEUR ?? 0).toLocaleString()}</div>
            <div style={{fontSize:10,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Total dropped</div>
          </div>
          <div style={{background:'#111',border:'1px solid #222',borderRadius:12,padding:14,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:500,color:'#FFD700'}}>{profile.donationCount ?? 1}</div>
            <div style={{fontSize:10,color:'#aaa',textTransform:'uppercase',letterSpacing:'.05em',marginTop:2}}>Drops</div>
          </div>
        </div>

        {profile.wish && (
          <div style={{background:'#111',border:'1px solid #222',borderRadius:12,padding:'1rem 1.25rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>What they'd change</div>
            <p style={{fontSize:14,color:'#ddd',lineHeight:1.6,fontStyle:'italic'}}>"{profile.wish}"</p>
          </div>
        )}

        {(profile.twitter||profile.twitch||profile.instagram) && (
          <div style={{background:'#111',border:'1px solid #222',borderRadius:12,padding:'1rem 1.25rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Find them on</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {profile.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:8,background:'#000',border:'1px solid #333',fontSize:13,color:'#fff',textDecoration:'none',fontWeight:500}}>𝕏 @{profile.twitter}</a>}
              {profile.twitch && <a href={`https://twitch.tv/${profile.twitch}`} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:8,background:'#6441a5',fontSize:13,color:'#fff',textDecoration:'none',fontWeight:500}}>🎮 {profile.twitch}</a>}
              {profile.instagram && <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" style={{padding:'8px 14px',borderRadius:8,background:'#E1306C',fontSize:13,color:'#fff',textDecoration:'none',fontWeight:500}}>ig @{profile.instagram}</a>}
            </div>
          </div>
        )}

        <Link href="/donate" style={{display:'block',textAlign:'center',background:'#CCFF00',color:'#0a0a0a',borderRadius:12,padding:13,fontSize:14,fontWeight:600,textDecoration:'none'}}>
          Outflex them
        </Link>
      </div>
    </main>
  )
}
