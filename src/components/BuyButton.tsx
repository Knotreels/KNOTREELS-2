'use client';

import { useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface BuyButtonProps {
  postId: string;
  price: number;
}

export default function BuyButton({ postId, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    if (!auth.currentUser) {
      toast({ title: 'Please log in to purchase.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const user = userSnap.data();

      if (!user || user.credits < price) {
        toast({ title: 'Not enough credits.', variant: 'destructive' });
        return;
      }

      // Deduct credits
      await updateDoc(userRef, {
        credits: increment(-price),
      });

      // Save purchase
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'purchases', postId), {
        postId,
        purchasedAt: new Date(),
      });

      toast({ title: 'Purchase successful! 🎉' });
      router.refresh(); // In case you want to update UI

    } catch (err) {
      console.error(err);
      toast({ title: 'Purchase failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {loading ? 'Processing…' : `Buy for ${price} Credits`}
    </button>
  );
}
