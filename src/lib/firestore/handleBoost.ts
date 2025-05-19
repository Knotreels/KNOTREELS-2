import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import confetti from 'canvas-confetti';
import { toast } from '@/hooks/use-toast';
import { canUserBoost } from './canUserBoost';

export async function handleBoost(creatorId: string, userId: string) {
  const allowed = await canUserBoost(creatorId, userId);
  if (!allowed) {
    toast({ title: 'You already boosted this creator in the last 24h.' });
    return;
  }

  // Record the boost in a subcollection
  await setDoc(doc(db, 'users', creatorId, 'boosts', userId), {
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', creatorId);
  const userSnap = await getDoc(userRef);
  const creatorData = userSnap.data();
  const currentBoosts = creatorData?.boosts || 0;
  const nextBoost = currentBoosts + 1;

  const milestones: Record<number, any> = {
    10: { badge: 'bronze' },
    20: { badge: 'silver' },
    30: { badge: 'gold', featureHours: 10 },
    40: { badge: 'platinum', featureHours: 15, credits: 15 },
    50: { badge: 'diamond', featureHours: 24, credits: 25 },
    60: { badge: 'onyx', featureHours: 24, gift: true },
    70: { badge: 'sapphire', featureHours: 24, credits: 30 },
    80: { badge: 'ruby', featureHours: 24, credits: 35 },
    90: { badge: 'emerald', featureHours: 24, credits: 35 },
    100: { badge: 'prestige', featureHours: 48, credits: 0, gift: true, cashPrize: 500, reset: true },
  };

  const milestone = milestones[nextBoost];

  if (milestone) {
    // Update with badge and bonus flags
    const updates: any = {
      boosts: milestone.reset ? 0 : increment(1),
      badge: milestone.badge,
      lastMilestone: nextBoost,
      lastMilestoneAt: serverTimestamp(),
    };

    if (milestone.featureHours) updates.isFeatured = true;
    if (milestone.credits) updates.earnedCredits = (creatorData?.earnedCredits || 0) + milestone.credits;
    if (milestone.gift) updates.giftEligible = true;
    if (milestone.cashPrize) updates.cashPrizeEligible = true;

    await updateDoc(userRef, updates);

    toast({
      title: `🎉 ${milestone.badge.toUpperCase()} Milestone!`,
      description: `You've helped this creator reach ${nextBoost} boosts!`,
    });
  } else {
    await updateDoc(userRef, {
      boosts: increment(1),
    });

    toast({
      title: '🚀 Boost sent!',
      description: 'Thank you for supporting this creator.',
    });
  }

  confetti();
}
