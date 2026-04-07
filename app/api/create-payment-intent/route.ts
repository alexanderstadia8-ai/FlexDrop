import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe key missing' }, { status: 500 });
    }

    const { amount, currency, uid } = await req.json();

    if (!amount || !currency || !uid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // SOLUZIONE: Prendi l'host dalla richiesta e forza https://
    // Vercel fornisce sempre l'header 'host' (es: flexdropv12-....vercel.app)
    const host = req.headers.get('host');
    
    if (!host) {
      throw new Error('Host header missing');
    }

    // Costruisci l'URL base forzando https (sicuro su Vercel)
    const baseUrl = `https://${host}`;

    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&currency=${currency}&uid=${uid}`;
    const cancelUrl = `${baseUrl}/donate`;

    console.log('Creating session for:', baseUrl);

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
            unit_amount: Math.round(amount * 100),
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
    console.error('Stripe Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' }, 
      { status: 500 }
    );
  }
}