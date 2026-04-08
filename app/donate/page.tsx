// app/donate/page.tsx
'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { stripePromise, toEUR, COUNTRIES } from '@/lib/utils'

export default function DonatePage({ user }: { user: any }) {
  const [wish, setWish] = useState('')
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [country, setCountry] = useState('US')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!user) return
    if (!wish.trim()) { setError('Write your message!'); return }

    setError('')
    setLoading(true)

    try {
      const countryData = COUNTRIES.find(c => c.code === country)
      const profileSnap = await getDoc(doc(db, 'user_profiles', user.uid))
      const savedProfile = profileSnap.exists() ? profileSnap.data() : {}

      await setDoc(doc(db, 'pending_donations', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: savedProfile.photoURL ?? user.photoURL ?? '',
        amount,
        currency,
        amountEUR: toEUR(amount, currency),
        wish: wish.trim(),
        instagram: savedProfile.instagram ?? '',
        twitter: savedProfile.twitter ?? '',
        twitch: savedProfile.twitch ?? '',
        country: savedProfile.country ?? countryData?.name ?? '',
        flag: savedProfile.flag ?? countryData?.flag ?? '🌍',
        updatedAt: serverTimestamp(),
      })

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, uid: user.uid }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || `Errore HTTP: ${res.status}`)
      if (!data.sessionId) throw new Error('Impossibile creare la sessione di pagamento. Controlla le chiavi Stripe su Vercel.')

      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe non è stato caricato correttamente.')

      const result = await stripe.redirectToCheckout({ sessionId: data.sessionId })
      if (result.error) throw new Error(result.error.message)

    } catch(e: any) {
      console.error('💥 Errore durante il checkout:', e)
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Donate</h1>
      <input value={wish} onChange={e => setWish(e.target.value)} placeholder="Your message" />
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Donate'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}