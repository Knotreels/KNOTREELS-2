// src/app/api/credits/checkout.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  const { amount, uid } = await req.json();

  const prices = {
    10: 199,
    25: 399,
    50: 699,
    100: 1299,
  };

  if (!prices[amount]) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${amount} KnotReels Credits`,
          },
          unit_amount: prices[amount],
        },
        quantity: 1,
      },
    ],
    metadata: {
      uid,
      credits: amount,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  });

  return NextResponse.json({ url: session.url });
}
