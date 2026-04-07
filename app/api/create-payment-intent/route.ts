import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verifica che la chiave esista
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY non trovata nelle variabili d\'ambiente di Vercel');
      return NextResponse.json({ error: 'Server configuration error: Missing Stripe Key' }, { status: 500 });
    }

    const { amount, currency, uid } = await req.json();

    if (!amount || !currency || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Costruisci l'URL base dinamicamente dall'header della richiesta
    const origin = req.headers.get('origin') || 'https://flexdrop.io'; // Fallback sicuro
    
    // Assicurati che l'URL abbia lo schema https
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
    
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&currency=${currency}&uid=${uid}`;
    const cancelUrl = `${baseUrl}/donate`;

    console.log('🚀 Creazione sessione Stripe:', { amount, currency, successUrl });

    // 3. Crea la sessione
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'FlexDrop Donation',
              description: `Donation of ${currency} ${amount}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe usa i centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        uid,
        amount: amount.toString(),
        currency,
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    // 4. Logga l'errore specifico per vederlo nei log di Vercel
    console.error('💥 Errore Stripe dettagliato:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}