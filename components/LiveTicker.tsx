'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatAmount } from '@/lib/currencies'

export default function LiveTicker() {
  const [events, setEvents] = useState<string[]>([
    '🇬🇧 James K. dropped £750',
    '🔥 Ravi V. challenged James K. — 24h left',
    '🇮🇹 Sofia R. dropped €420',
    '💀 Thomas N. folded',
    '👑 Elena L. all-time record €28,000',
    '🔥 Marco P. challenged Sofia R.',
    '🇫🇷 Aisha L. dropped €300',
  ])

  useEffect(() => {
    const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(10))
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return
      const msgs = snap.docs.map((d) => {
        const data = d.data()
        return `${data.flag ?? ''} ${data.displayName} dropped ${formatAmount(data.amount, data.currency)}`
      })
      if (msgs.length > 0) setEvents(msgs)
    })
    return () => unsub()
  }, [])

  const repeated = [...events, ...events]

  return (
    <div style={{background:'#111',borderTop:'1px solid #222',borderBottom:'1px solid #222',padding:'8px 0',overflow:'hidden',whiteSpace:'nowrap',margin:'1.25rem 0'}}>
      <div style={{display:'inline-block',animation:'scroll 25s linear infinite'}}>
        {repeated.map((e, i) => (
          <span key={i} style={{fontSize:12,marginRight:28,color:'#ddd'}}>{e}</span>
        ))}
      </div>
      <style>{`@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}
