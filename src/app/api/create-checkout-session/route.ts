import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import Stripe from 'stripe';


  const raw = process.env.GOOGLE_CREDENTIALS_JSON;


if (!raw) {
  throw new Error('GOOGLE_CREDENTIALS_JSON is undefined');
}

const serviceAccount = JSON.parse(raw);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { userId, bundle } = await req.json();

    const CREDIT_BUNDLES = {
      '10': { price: 199, credits: 10 },
      '25': { price: 399, credits: 25 },
      '50': { price: 699, credits: 50 },
      '100': { price: 1299, credits: 100 },
    };

    const creditBundle = CREDIT_BUNDLES[bundle];
    if (!creditBundle) {
      return NextResponse.json({ error: 'Invalid bundle selected' }, { status: 400 });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${creditBundle.credits} KnotReels Credits`,
            },
            unit_amount: creditBundle.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      metadata: {
        userId: userId,
        credits: creditBundle.credits.toString(),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[CHECKOUT_SESSION_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
