import { type NextRequest, NextResponse } from 'next/server';
import { spendCredits } from '@/features/credits/spendCredits';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json();
    await spendCredits(userId, Number(amount));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[SPEND_CREDITS_ERROR]', err);
    return NextResponse.json({ error: 'Unable to spend credits' }, { status: 400 });
  }
}
