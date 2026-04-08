import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function WhyPage() {
  return (
    <main style={{background:'#0a0a0a',minHeight:'100vh',color:'#fff'}}>
      <Navbar />
      <div style={{maxWidth:500,margin:'0 auto',padding:'2rem 1rem'}}>
        <Link href="/" style={{fontSize:13,color:'#aaa',textDecoration:'none',marginBottom:'1.5rem',display:'inline-block'}}>← Back</Link>
        <h1 style={{fontSize:28,fontWeight:500,marginBottom:'1.5rem',color:'#fff'}}>Why does this exist?</h1>
        <div style={{display:'flex',flexDirection:'column',gap:16,color:'#ccc',lineHeight:1.7,fontSize:14}}>
          <p>Money is weird. You work hard for it, but it slowly loses value every year. Governments print more of it, prices go up, and your savings buy a little less each month.</p>
          <p>Most people just ignore this and keep their cash in a bank account doing basically nothing.</p>
          <p style={{color:'#fff',fontWeight:500}}>We thought: what if instead of watching money silently evaporate, you made a statement with it?</p>
          <p>FlexDrop is the world's first public wealth flex leaderboard. You drop whatever you want, in any currency, and your face and message go live for the world to see. Then you challenge someone to beat you.</p>
          <p>It's part social media, part competition, part meme. You decide what you stand for. And you get to show everyone that you actually did something — not just talked about it.</p>
          <p style={{color:'#555',fontSize:12}}>The money goes directly to Alessandro, who created FlexDrop. No middlemen. No overhead. Just a direct flex from you to the wall.</p>
        </div>
        <div style={{marginTop:'2rem'}}>
          <Link href="/donate" style={{background:'#CCFF00',color:'#1a1400',borderRadius:12,padding:'12px 28px',fontSize:14,fontWeight:500,textDecoration:'none',display:'inline-block'}}>
            Flex now
          </Link>
        </div>
      </div>
    </main>
  )
}
