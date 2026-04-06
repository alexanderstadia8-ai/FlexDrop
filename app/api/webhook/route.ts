import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase-admin'
import { toEUR } from '@/lib/currencies'
import { FieldValue } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { uid, amount, currency } = session.metadata ?? {}
    if (!uid || !amount || !currency) return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })

    try {
      // Load user profile (country, socials, photo — set once)
      const profileRef = adminDb.doc(`user_profiles/${uid}`)
      const profileSnap = await profileRef.get()
      const profile = profileSnap.exists ? profileSnap.data()! : {}

      // Load pending donation (wish)
      const pendingRef = adminDb.doc(`pending_donations/${uid}`)
      const pending = await pendingRef.get()
      const pendingData = pending.exists ? pending.data()! : {}

      const numAmount = parseFloat(amount)
      const amountEUR = toEUR(numAmount, currency)

      const donationData = {
        uid,
        displayName: profile.displayName ?? pendingData.displayName ?? '',
        photoURL: profile.photoURL ?? pendingData.photoURL ?? '',
        country: profile.country ?? pendingData.country ?? '',
        flag: profile.flag ?? pendingData.flag ?? '🌍',
        instagram: profile.instagram ?? '',
        twitter: profile.twitter ?? '',
        twitch: profile.twitch ?? '',
        wish: pendingData.wish ?? '',
        amount: numAmount,
        currency,
        amountEUR,
        stripeSessionId: session.id,
        createdAt: FieldValue.serverTimestamp(),
      }

      // Write individual donation (today's leaderboard)
      await adminDb.collection('donations').add(donationData)

      // Update all-time leaderboard — cumulative
      const alltimeRef = adminDb.doc(`leaderboard_alltime/${uid}`)
      const alltimeDoc = await alltimeRef.get()

      if (alltimeDoc.exists) {
        await alltimeRef.update({
          amountEUR: FieldValue.increment(amountEUR),
          amount: FieldValue.increment(numAmount),
          donationCount: FieldValue.increment(1),
          // Always keep profile fresh
          displayName: profile.displayName ?? pendingData.displayName ?? '',
          photoURL: profile.photoURL ?? pendingData.photoURL ?? '',
          country: profile.country ?? '',
          flag: profile.flag ?? '🌍',
          instagram: profile.instagram ?? '',
          twitter: profile.twitter ?? '',
          twitch: profile.twitch ?? '',
          wish: pendingData.wish ?? '',
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        await alltimeRef.set({
          ...donationData,
          donationCount: 1,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }

      // Update user profile with latest donation info
      await profileRef.set({
        lastDonationAt: FieldValue.serverTimestamp(),
        lastWish: pendingData.wish ?? '',
      }, { merge: true })

      await pendingRef.delete()
    } catch (err) {
      console.error('Firestore error:', err)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

export const config = { api: { bodyParser: false } }
