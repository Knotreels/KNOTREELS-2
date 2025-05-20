import { type NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/features/credits/purchaseCredits';

export async function POST(req: NextRequest) {
  try {
    const { amount, uid } = await req.json();
    const session = await createCheckoutSession(uid, amount);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[CREDITS_CHECKOUT_ERROR]', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
