'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Battle = {
  id: string
  challenger: { name: string; initials: string; color: string; amount: number; currency: string; flag: string }
  challenged: { name: string; initials: string; color: string; amount: number; currency: string; flag: string }
  status: 'live' | 'pending' | 'ended'
  winner?: 'challenger' | 'challenged'
  expiresAt: number
  progress: number
}

const MOCK_BATTLES: Battle[] = [
  {
    id: '1',
    challenger: { name: 'James K.', initials: 'JK', color: '#D85A30', amount: 750, currency: 'GBP', flag: '🇬🇧' },
    challenged: { name: 'Ravi V.', initials: 'RV', color: '#534AB7', amount: 620, currency: 'EUR', flag: '🇸🇬' },
    status: 'live', progress: 55,
    expiresAt: Date.now() + 3 * 60 * 60 * 1000,
  },
  {
    id: '2',
    challenger: { name: 'Marco P.', initials: 'MP', color: '#185FA5', amount: 200, currency: 'EUR', flag: '🇩🇪' },
    challenged: { name: 'Sofia R.', initials: 'SR', color: '#2a2a2a', amount: 0, currency: 'EUR', flag: '🇮🇹' },
    status: 'pending', progress: 0,
    expiresAt: Date.now() + 18 * 60 * 60 * 1000,
  },
  {
    id: '3',
    challenger: { name: 'Yasmine B.', initials: 'YB', color: '#3B6D11', amount: 300, currency: 'EUR', flag: '🇧🇪' },
    challenged: { name: 'Thomas N.', initials: 'TN', color: '#993C1D', amount: 80, currency: 'EUR', flag: '🇳🇱' },
    status: 'ended', winner: 'challenger', progress: 78,
    expiresAt: Date.now() - 1000,
  },
]

function timeLeft(ms: number) {
  const diff = ms - Date.now()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

function shareChallenge(battle: Battle, platform: string) {
  const winner = battle.winner === 'challenger' ? battle.challenger.name : battle.challenged.name
  const loser = battle.winner === 'challenger' ? battle.challenged.name : battle.challenger.name
  const text = battle.status === 'ended'
    ? `${winner} just outflexed ${loser} on FlexDrop 💸👑 Who's next? flexdrop.io`
    : `${battle.challenger.name} challenged ${battle.challenged.name} on FlexDrop 🔥 Who's gonna fold? flexdrop.io`

  const urls: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    twitch: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    instagram: `https://www.instagram.com/`,
  }
  window.open(urls[platform] || urls.twitter, '_blank')
}

export default function LiveBattles() {
  const [battles] = useState<Battle[]>(MOCK_BATTLES)
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const ShareBtns = ({ battle }: { battle: Battle }) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[
        { id: 'twitter', label: '𝕏', bg: '#000', border: '1px solid #333' },
        { id: 'twitch', label: '🎮', bg: '#6441a5', border: 'none' },
        { id: 'instagram', label: 'ig Story', bg: '#E1306C', border: 'none' },
      ].map(p => (
        <button
          key={p.id}
          onClick={() => shareChallenge(battle, p.id)}
          style={{ padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 500, color: '#fff', background: p.bg, border: p.border, cursor: 'pointer' }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 1rem', marginBottom: '1.25rem' }}>
      {battles.map(battle => (
        <div key={battle.id} style={{
          background: '#111',
          border: `1px solid ${battle.status === 'live' ? '#FFD70066' : battle.status === 'ended' ? '#ff6b6b22' : '#222'}`,
          borderRadius: 12, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: battle.status === 'live' ? 8 : 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: battle.challenger.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff', flexShrink: 0 }}>
                {battle.challenger.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: battle.status === 'ended' && battle.winner === 'challenger' ? '#22c55e' : '#fff' }}>
                  {battle.challenger.name}
                </div>
                <div style={{ fontSize: 10, color: '#FFD700' }}>
                  {battle.challenger.currency} {battle.challenger.amount} {battle.challenger.flag}
                  {battle.status === 'ended' && battle.winner === 'challenger' && ' 👑'}
                </div>
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, padding: '2px 7px', fontSize: 10, color: '#aaa', flexShrink: 0 }}>VS</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: battle.status === 'pending' ? '#2a2a2a' : battle.challenged.color, border: battle.status === 'pending' ? '1px dashed #444' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff', flexShrink: 0, opacity: battle.status === 'ended' && battle.winner === 'challenger' ? 0.5 : 1 }}>
                {battle.status === 'pending' ? '?' : battle.challenged.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: battle.status === 'ended' && battle.winner === 'challenged' ? '#22c55e' : battle.status === 'ended' && battle.winner === 'challenger' ? '#ff6b6b' : battle.status === 'pending' ? '#aaa' : '#fff', textDecoration: battle.status === 'ended' && battle.winner === 'challenger' ? 'line-through' : 'none' }}>
                  {battle.challenged.name}
                </div>
                <div style={{ fontSize: 10, color: battle.status === 'pending' ? '#666' : battle.status === 'ended' && battle.winner === 'challenger' ? '#ff6b6b' : '#FFD700' }}>
                  {battle.status === 'pending' ? 'waiting...' : `${battle.challenged.currency} ${battle.challenged.amount} ${battle.challenged.flag}`}
                  {battle.status === 'ended' && battle.winner === 'challenger' && ' 💀'}
                  {battle.status === 'ended' && battle.winner === 'challenged' && ' 👑'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: battle.status === 'live' && timeLeft(battle.expiresAt).includes('h') && parseInt(timeLeft(battle.expiresAt)) < 5 ? '#ff6b6b' : battle.status === 'ended' ? '#ff6b6b' : '#aaa', flexShrink: 0 }}>
              ⏱ {timeLeft(battle.expiresAt)}
            </div>
          </div>

          {battle.status === 'live' && (
            <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 3, background: '#FFD700', width: `${battle.progress}%` }} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ShareBtns battle={battle} />
            <div style={{ fontSize: 10, color: battle.status === 'ended' && battle.winner ? '#22c55e' : battle.status === 'pending' ? '#FFD700' : '#aaa' }}>
              {battle.status === 'live' && 'James winning 💪'}
              {battle.status === 'pending' && 'Pending 👀'}
              {battle.status === 'ended' && battle.winner === 'challenger' && `${battle.challenger.name.split(' ')[0]} won 👑`}
              {battle.status === 'ended' && battle.winner === 'challenged' && `${battle.challenged.name.split(' ')[0]} won 👑`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
