// src/components/CreditPackButton.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // adjust if your context is different
import { Button } from './ui/button';

export default function CreditPackButton({ amount }: { amount: number }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = async () => {
    if (!user) {
      alert('Please sign in to purchase credits.');
      return;
    }

    const res = await fetch('/api/credits/checkout', {
      method: 'POST',
      body: JSON.stringify({ amount, uid: user.uid }),
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <Button onClick={handleBuy}>
      Buy {amount} Credits
    </Button>
  );
}
