import type Stripe from 'stripe';
import { stripe } from '@/features/stripe/stripe';
import { CREDIT_BUNDLES, type CreditBundleKey } from './types';

export async function createCheckoutSession(userId: string, bundle: CreditBundleKey): Promise<Stripe.Checkout.Session> {
  const creditBundle = CREDIT_BUNDLES[bundle];
  if (!creditBundle) {
    throw new Error('Invalid credit bundle');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: { name: `${creditBundle.credits} KnotReels Credits` },
          unit_amount: creditBundle.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    metadata: {
      userId,
      credits: creditBundle.credits.toString(),
    },
  });

  return session;
}
