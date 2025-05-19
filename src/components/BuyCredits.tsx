'use client';

import { useState } from 'react';
import { auth } from '@/firebase/config';
import { Button } from './ui/button';

interface Props {
  bundle: string;
}

export default function BuyCredits({ bundle }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    const user = auth.currentUser;
    if (!user) return alert('You must be logged in to buy credits.');

    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, bundle }),
      });

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePurchase} disabled={loading} className="w-full">
      {loading ? 'Redirecting...' : `Buy ${bundle} Credits`}
    </Button>
  );
}
