import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { toStripeAmount } from '@/lib/currencies'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, uid } = await req.json()

    if (!amount || !currency || !uid) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const stripeAmount = toStripeAmount(amount, currency)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'FlexDrop — Claim your spot on the wall',
              description: 'Your face, your name, your message — live on the leaderboard.',
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?uid=${uid}&amount=${amount}&currency=${currency}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate`,
      metadata: { uid, amount: String(amount), currency },
      payment_intent_data: {
        metadata: { uid, amount: String(amount), currency },
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
