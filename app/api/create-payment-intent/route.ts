import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, uid } = await req.json();

    if (!amount || !currency || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Costruisci l'URL base in modo sicuro per Vercel
    // Usa una variabile d'ambiente NEXT_PUBLIC_APP_URL se impostata, altrimenti fallback su un dominio hardcoded o headers
    const protocol = 'https';
    const host = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'flexdropv12-1yo5pslxn-alexanderstadia8-ais-projects.vercel.app';
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `FlexDrop Donation`,
              description: `Donation of ${currency} ${amount}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe vuole i centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&currency=${currency}&uid=${uid}`,
      cancel_url: `${baseUrl}/donate?canceled=true`,
      metadata: {
        uid,
        amount: amount.toString(),
        currency,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}