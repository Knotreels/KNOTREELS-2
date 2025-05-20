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
          src="images/coin.png"
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

      {/* Info Section */}
      <div className="max-w-4xl mx-auto mt-16 text-center text-gray-700 text-base space-y-6">
        <div className="px-4">
          <h2 className="text-2xl font-semibold mb-2">Why Are Larger Bundles Cheaper?</h2>
          <p>
            At KnotReels, we believe in <strong>rewarding supporters who invest more in the creative community</strong>.
            That’s why our credit system is built on a simple but powerful principle:
          </p>
          <p className="italic text-lg">The more you buy, the better value you get.</p>
          <p>
            Larger bundles lower the cost <strong>per credit</strong>, helping you stretch your impact further —
            whether you’re tipping your favorite creator, boosting someone’s content, or unlocking premium work.
          </p>
          <ul className="list-disc list-inside text-left mt-4">
            <li>Encourages meaningful support over time</li>
            <li>Makes your credits go further</li>
            <li>Supports the sustainability of artists on the platform</li>
          </ul>
        </div>

        <div className="mt-12 px-4">
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">Thank You from KnotReels</h2>
          <p>
            Whether you’re here to create, support, or simply explore — <br />
            <strong>you’re part of a movement</strong> that’s reshaping how we share and celebrate creativity.
          </p>
          <p className="mt-2 font-medium">
            Thank you for helping build the KnotReels community. <br />
            We’re glad you’re here.
          </p>
        </div>
      </div>
    </div>
  );
}
