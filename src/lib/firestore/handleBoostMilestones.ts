import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

const MILESTONES = [
  { count: 10, badge: '🥉', id: 'boost-10' },
  { count: 20, badge: '🥈', id: 'boost-20' },
  { count: 30, badge: '🥇', id: 'boost-30', carousel: '10h' },
  { count: 40, badge: '🧊', id: 'boost-40', credits: 15, carousel: '15h' },
  { count: 50, badge: '🔶', id: 'boost-50', credits: 25, carousel: '24h' },
  { count: 60, badge: '🌟', id: 'boost-60', gift: true, carousel: '24h' },
  { count: 70, badge: '🧿', id: 'boost-70', credits: 30, carousel: '24h' },
  { count: 80, badge: '💎', id: 'boost-80', credits: 35, carousel: '24h' },
  { count: 90, badge: '🪙', id: 'boost-90', credits: 35, carousel: '24h' },
  { count: 100, badge: '👑', id: 'boost-100', gift: true, cash: '$500', carousel: '48h' }
];

// Utility: Convert string like "10h" to milliseconds
function hoursToMillis(duration: string): number {
  const hours = parseInt(duration.replace('h', ''), 10);
  return hours * 60 * 60 * 1000;
}

export async function handleBoostMilestones(userId: string, currentBoosts: number) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const userData = snap.data();
  const currentBadges = Array.isArray(userData.badges) ? userData.badges : [];

  for (const milestone of MILESTONES) {
    if (
      currentBoosts >= milestone.count &&
      !currentBadges.includes(milestone.badge)
    ) {
      const updates: any = {
        badges: arrayUnion(milestone.badge),
      };

      // Apply carousel time
      if (milestone.carousel) {
        const now = Timestamp.now();
        const future = Timestamp.fromMillis(
          now.toMillis() + hoursToMillis(milestone.carousel)
        );
        updates.featuredUntil = future;
      }

      // Add credits if available
      if (milestone.credits) {
        updates.credits = (userData.credits || 0) + milestone.credits;
      }

      // Optional: add logs or notification triggers here for gift/cash rewards

      await updateDoc(userRef, updates);
    }
  }
}
