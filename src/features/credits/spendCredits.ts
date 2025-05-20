import { getAdminDb } from '@/features/firebase/admin';

export async function spendCredits(userId: string, amount: number) {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);
  await db.runTransaction(async tx => {
    const snap = await tx.get(userRef);
    const current = snap.data()?.credits || 0;
    if (current < amount) {
      throw new Error('Insufficient credits');
    }
    tx.update(userRef, { credits: current - amount });
  });
}
