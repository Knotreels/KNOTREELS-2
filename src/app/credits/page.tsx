'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const CREDIT_BUNDLES = [
  { amount: '10', price: 1.99, save: 0 },
  { amount: '25', price: 3.99, save: 20 },
  { amount: '50', price: 6.99, save: 30 },
  { amount: '100', price: 12.99, save: 35, badge: 'Best Value' },
];

export default function BuyCreditsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingBundle, setLoadingBundle] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/dashboard/browse');
    }
  }, [user, loading, router]);

  const handlePurchase = async (bundle: string) => {
    if (!user) return;

    setLoadingBundle(bundle);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, bundle }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Try again.');
    } finally {
      setLoadingBundle(null);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-6 text-black">
      <div className="flex justify-center mb-6">
        <Image
          src="/images/coin.png"
          alt="KnotReels Coin"
          width={140}
          height={140}
        />
      </div>

      <h1 className="text-4xl font-bold text-center mb-2">Buy Exclusive Credits</h1>
      <p className="text-center text-gray-600 mb-10 text-base">
        Credits power your impact! Use them to Tip, Boost, and support the creatives shaping our community.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {CREDIT_BUNDLES.map(({ amount, price, save, badge }) => (
          <div
            key={amount}
            className={`relative bg-blue-600 text-white rounded-xl p-6 text-center shadow-lg hover:scale-[1.03] transition-transform duration-200 ${
              badge ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            {save > 0 && (
              <div className="absolute top-2 left-2 bg-green-500 text-xs px-2 py-1 rounded font-bold">
                Save {save}%
              </div>
            )}
            {badge && (
              <div className="absolute top-2 right-2 bg-white text-blue-600 text-xs px-2 py-1 rounded font-bold">
                {badge}
              </div>
            )}
            <h2 className="text-2xl font-bold mb-1">{amount} Credits</h2>
            <p className="text-sm text-white/80 mb-1">
              £{(price / Number(amount)).toFixed(2)} per credit
            </p>
            <p className="text-lg font-medium mb-4">£{price.toFixed(2)}</p>
            <Button
              onClick={() => handlePurchase(amount)}
              disabled={loadingBundle === amount}
              className="w-full"
            >
              {loadingBundle === amount
                ? 'Redirecting...'
                : `Buy ${amount} Credits`}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
