// src/app/api/webhook/route.ts

import { buffer } from 'micro';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// ✅ Initialize Firebase Admin if not already
if (!getApps().length) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
  initializeApp({ credential: cert(credentials) });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body as any);
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log('🔔 Stripe event received:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits);

    console.log('✅ Metadata from Stripe session:', session.metadata);

    if (!userId|| isNaN(credits)) {
      console.warn('⚠️ Missing or invalid metadata:', session.metadata);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);

    try {
      await db.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);

        if (!userSnap.exists) {
          throw new Error(`User not found for UID: ${userId}`);
        }

        const prevCredits = userSnap.data()?.credits ?? 0;
        tx.update(userRef, { credits: prevCredits + credits });
        console.log(`🎉 Updated credits for user ${userId}: ${prevCredits} → ${prevCredits + credits}`);
      });

      return NextResponse.json({ received: true });
    } catch (firestoreErr: any) {
      console.error('❌ Firestore update failed:', firestoreErr.message);
      return NextResponse.json({ error: 'Firestore error' }, { status: 500 });
    }
  }

  console.log('ℹ️ Unhandled event type:', event.type);
  return NextResponse.json({ ok: true });
}
