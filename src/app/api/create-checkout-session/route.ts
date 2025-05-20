import { type NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/features/credits/purchaseCredits';

export async function POST(req: NextRequest) {
  try {
    const { userId, bundle } = await req.json();
    const session = await createCheckoutSession(userId, bundle);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[CHECKOUT_SESSION_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
