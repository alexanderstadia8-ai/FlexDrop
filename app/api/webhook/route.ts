import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { toEUR } from '@/lib/currencies'
import * as admin from 'firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

// Funzione per ottenere l'istanza di Firestore inizializzandola solo se necessario
function getDb() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin environment variables')
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  }
  return admin.firestore()
}

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
    
    if (!uid || !amount || !currency) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    let db: admin.firestore.Firestore
    
    try {
      db = getDb()
    } catch (err) {
      console.error('Firebase Init Error:', err)
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
      // Load user profile (country, socials, photo — set once)
      const profileRef = db.doc(`user_profiles/${uid}`)
      const profileSnap = await profileRef.get()
      const profile = profileSnap.exists ? profileSnap.data()! : {}

      // Load pending donation (wish)
      const pendingRef = db.doc(`pending_donations/${uid}`)
      const pending = await pendingRef.get()
      const pendingData = pending.exists ? pending.data()! : {}

      const numAmount = parseFloat(amount)
      const amountEUR = toEUR(numAmount, currency)

      const donationData: any = {
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      // Write individual donation (today's leaderboard)
      await db.collection('donations').add(donationData)

      // Update all-time leaderboard — cumulative
      const alltimeRef = db.doc(`leaderboard_alltime/${uid}`)
      const alltimeDoc = await alltimeRef.get()

      if (alltimeDoc.exists) {
        await alltimeRef.update({
          amountEUR: admin.firestore.FieldValue.increment(amountEUR),
          amount: admin.firestore.FieldValue.increment(numAmount),
          donationCount: admin.firestore.FieldValue.increment(1),
          // Always keep profile fresh
          displayName: profile.displayName ?? pendingData.displayName ?? '',
          photoURL: profile.photoURL ?? pendingData.photoURL ?? '',
          country: profile.country ?? '',
          flag: profile.flag ?? '🌍',
          instagram: profile.instagram ?? '',
          twitter: profile.twitter ?? '',
          twitch: profile.twitch ?? '',
          wish: pendingData.wish ?? '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        await alltimeRef.set({
          ...donationData,
          donationCount: 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      // Update user profile with latest donation info
      await profileRef.set({
        lastDonationAt: admin.firestore.FieldValue.serverTimestamp(),
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