import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, uid } = await req.json();

    // Recupera il dominio dal header della richiesta (funziona sia in locale che su Vercel)
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://flexdrop.io';
    
    // Assicurati che l'URL abbia lo schema https
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
    
    const successUrl = `${baseUrl}/success?amount=${amount}&currency=${currency}&uid=${uid}`;
    const cancelUrl = `${baseUrl}/donate`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'FlexDrop Donation',
              description: `Donation of ${amount} ${currency}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe vuole i centesimi
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
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}