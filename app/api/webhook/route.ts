import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// 1. Inizializza Firebase Admin SOLO se non è già stato fatto
// Questo è cruciale per le funzioni serverless di Vercel
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Sostituisci i caratteri di nuova riga escaped con quelli reali
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin Env Vars:', { 
      hasProjectId: !!projectId, 
      hasClientEmail: !!clientEmail, 
      hasPrivateKey: !!privateKey 
    });
    throw new Error('Missing Firebase Admin credentials');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  // Controllo di sicurezza per la firma
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gestisci solo l'evento checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { uid, amount, currency } = session.metadata || {};

    if (!uid || !amount || !currency) {
      console.error('❌ Missing metadata in session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    
    // Conversione semplice in EUR (adatta se necessario)
    const amountEUR = currency === 'EUR' ? numAmount : numAmount * 0.85; 

    try {
      // 1. Recupera il profilo utente
      const profileRef = db.doc(`user_profiles/${uid}`);
      const profileSnap = await profileRef.get();
      const profile = profileSnap.exists ? profileSnap.data()! : {};

      // 2. Recupera la donazione pending
      const pendingRef = db.doc(`pending_donations/${uid}`);
      const pendingSnap = await pendingRef.get();

      if (!pendingSnap.exists) {
        console.warn('⚠️ No pending donation found for uid:', uid);
        // Se non c'è pending, continuiamo ma logghiamo. Potresti voler gestire questo caso diversamente.
      }
      
      const pendingData = pendingSnap.exists ? pendingSnap.data()! : {};

      const donationData = {
        uid,
        displayName: profile.displayName || pendingData.displayName || 'Anonymous',
        photoURL: profile.photoURL || pendingData.photoURL || '',
        country: profile.country || pendingData.country || '',
        flag: profile.flag || pendingData.flag || '🌍',
        instagram: profile.instagram || '',
        twitter: profile.twitter || '',
        twitch: profile.twitch || '',
        wish: pendingData.wish || '',
        amount: numAmount,
        currency,
        amountEUR,
        stripeSessionId: session.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 3. Scrivi nella collezione donations (leaderboard recente)
      await db.collection('donations').add(donationData);
      console.log('✅ Donation added to firestore');

      // 4. Aggiorna la leaderboard all-time
      const alltimeRef = db.doc(`leaderboard_alltime/${uid}`);
      const alltimeSnap = await alltimeRef.get();

      if (alltimeSnap.exists) {
        await alltimeRef.update({
          amountEUR: admin.firestore.FieldValue.increment(amountEUR),
          amount: admin.firestore.FieldValue.increment(numAmount),
          donationCount: admin.firestore.FieldValue.increment(1),
          // Aggiorna info profilo recenti
          displayName: donationData.displayName,
          photoURL: donationData.photoURL,
          country: donationData.country,
          flag: donationData.flag,
          wish: donationData.wish,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await alltimeRef.set({
          ...donationData,
          donationCount: 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      console.log('✅ Leaderboard updated');

      // 5. Elimina il pending
      if (pendingSnap.exists) {
        await pendingRef.delete();
        console.log('✅ Pending donation deleted');
      }

      // 6. Aggiorna ultimo accesso nel profilo
      await profileRef.set({
        lastDonationAt: admin.firestore.FieldValue.serverTimestamp(),
        lastWish: donationData.wish,
      }, { merge: true });

      return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
      console.error('💥 Firestore Error:', error);
      return NextResponse.json({ error: 'Internal DB Error', details: (error as any).message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}