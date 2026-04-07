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

    // SOLUZIONE ROBUSTA:
    // 1. Prova a prendere l'URL completo dal header specifico di Vercel
    let host = req.headers.get('x-vercel-deployment-url');
    
    // 2. Se non c'è, prova con l'header 'host' standard
    if (!host) {
      host = req.headers.get('host');
    }

    // 3. Fallback estremo (solo per sviluppo locale o errori gravi)
    if (!host) {
      console.warn('Host header missing, usando fallback di sicurezza');
      host = 'flexdropv12.vercel.app'; // O il tuo dominio di produzione fisso se ne hai uno
    }

    // 4. Forza lo schema https:// se manca (CRUCIALE PER STRIPE)
    let baseUrl = host;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}&currency=${currency}&uid=${uid}`;
    const cancelUrl = `${baseUrl}/donate`;

    console.log('✅ URL generati per Stripe:', { successUrl, cancelUrl });

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
    console.error('❌ Stripe Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' }, 
      { status: 500 }
    );
  }
}