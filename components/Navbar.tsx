'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signInWithPopup, signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, googleProvider } from '@/lib/firebase'

export default function Navbar() {
  const [user] = useAuthState(auth)
  const [menuOpen, setMenuOpen] = useState(false)
  const login = async () => { try { await signInWithPopup(auth, googleProvider) } catch(e){} }
  const logout = async () => { await signOut(auth); setMenuOpen(false) }

  return (
    <nav style={{maxWidth:1100,margin:'0 auto',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
        <img src="/logo.svg" alt="FlexDrop" style={{width:36,height:36,borderRadius:'50%',background:'#1a1a1a'}} />
        <span style={{fontSize:'clamp(16px,2.5vw,22px)',fontWeight:700,color:'#fff',letterSpacing:'-.5px',fontFamily:'Arial Black,sans-serif'}}>
          Flex<span style={{color:'#CCFF00'}}>Drop</span>
        </span>
      </Link>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link href="/why" style={{fontSize:13,color:'#666',textDecoration:'none',display:'none'}} className="desktop-only">Why?</Link>
        {user ? (
          <div style={{position:'relative'}}>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{display:'flex',alignItems:'center',gap:8,background:'#1a1a1a',border:'1px solid #333',borderRadius:20,paddingLeft:4,paddingRight:12,paddingTop:4,paddingBottom:4,cursor:'pointer',color:'#fff'}}>
              {user.photoURL
                ? <Image src={user.photoURL} alt="" width={26} height={26} style={{borderRadius:'50%'}} />
                : <div style={{width:26,height:26,borderRadius:'50%',background:'#CCFF00',display:'flex',alignItems:'center',justifyContent:'center',color:'#0a0a0a',fontSize:12,fontWeight:600}}>{user.displayName?.[0]}</div>
              }
              <span style={{fontSize:13,fontWeight:500}}>{user.displayName?.split(' ')[0]}</span>
            </button>
            {menuOpen && (
              <div style={{position:'absolute',right:0,top:42,background:'#1a1a1a',border:'1px solid #333',borderRadius:12,padding:'4px 0',width:160,zIndex:50}}>
                <Link href="/donate" onClick={()=>setMenuOpen(false)} style={{display:'block',padding:'10px 16px',fontSize:13,color:'#fff',textDecoration:'none'}}>Flex now</Link>
                <hr style={{border:'none',borderTop:'1px solid #333',margin:'4px 0'}} />
                <button onClick={logout} style={{width:'100%',textAlign:'left',padding:'10px 16px',fontSize:13,color:'#ff6b6b',background:'none',border:'none',cursor:'pointer'}}>Sign out</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={login} style={{background:'#CCFF00',color:'#0a0a0a',border:'none',borderRadius:20,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}
