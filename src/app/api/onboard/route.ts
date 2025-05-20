import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const account = await stripe.accounts.create({ type: 'express' });

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url, accountId: account.id });
  } catch (err) {
    console.error('[ONBOARD_ERROR]', err);
    return NextResponse.json(
      { error: 'Unable to start onboarding' },
      { status: 500 },
    );
  }
}
