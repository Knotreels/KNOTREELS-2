import { getFirestore } from 'firebase-admin/firestore';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { NextResponse } from 'next/server';

if (!getApps().length) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON!);
  initializeApp({ credential: cert(credentials) });
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { tipperId, creatorId, imageId, credits } = await req.json();

    // ✅ Validate inputs to avoid crashing Firebase SDK
    if (
      typeof tipperId !== 'string' || !tipperId ||
      typeof creatorId !== 'string' || !creatorId ||
      typeof imageId !== 'string' || !imageId ||
      typeof credits !== 'number' || credits <= 0
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const tipperRef = db.collection('users').doc(tipperId);
    const creatorRef = db.collection('users').doc(creatorId);
    const imageRef = db.collection('gallery').doc(imageId);

    await db.runTransaction(async (tx) => {
      const tipperSnap = await tx.get(tipperRef);
      const creatorSnap = await tx.get(creatorRef);
      const imageSnap = await tx.get(imageRef);

      if (!tipperSnap.exists || !creatorSnap.exists || !imageSnap.exists) {
        throw new Error('Invalid document reference');
      }

      const tipperCredits = tipperSnap.data()?.credits ?? 0;
      if (tipperCredits < credits) {
        throw new Error('Not enough credits');
      }

      tx.update(tipperRef, { credits: tipperCredits - credits });
      tx.update(creatorRef, {
        credits: (creatorSnap.data()?.credits ?? 0) + credits,
      });
      tx.update(imageRef, {
        creditsReceived: (imageSnap.data()?.creditsReceived ?? 0) + credits,
      });

      tx.set(db.collection('tips').doc(), {
        tipperId,
        creatorId,
        imageId,
        credits,
        timestamp: new Date(),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[TIP_API_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
