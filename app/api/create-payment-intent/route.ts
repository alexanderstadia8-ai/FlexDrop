import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Usa il dominio di produzione fisso
const DOMAIN = 'https://flexdropv12.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, uid } = await req.json();

    if (!amount || !currency || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const successUrl = `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&currency=${currency}&uid=${uid}`;
    const cancelUrl = `${DOMAIN}/donate`;

    console.log('🚀 Creazione sessione Stripe per:', { amount, currency, uid });

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
    console.error('💥 Stripe Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' }, 
      { status: 500 }
    );
  }
}