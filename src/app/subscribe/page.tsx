'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SubscribePage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=subscribe');
    }
  }, [loading, currentUser, router]);

  const handleSubscribe = async () => {
    if (loading || isSubmitting) return;

    const email =
      currentUser?.email ||
      currentUser?.providerData?.[0]?.email ||
      null;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      alert('Could not find a valid email. Please sign in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Stripe session failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="flex justify-center mb-6">
        <Image src="/logo-kr.jpg" alt="KnotReels Logo" width={100} height={100} />
      </div>

      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to <span className="text-blue-400">KnotReels</span>
        </h1>

        <p className="text-gray-400">
          We’re a creative platform built for <span className="font-semibold text-white">filmmakers, storytellers, artists, and dreamers</span>.
        </p>

        <p className="text-gray-400">
          Start your <span className="text-green-400 font-semibold">2-month FREE trial</span> — then just <span className="text-blue-300 font-semibold">£2.99/month</span> to stay inspired and connected.
        </p>

        {currentUser && (
          <Button
            onClick={handleSubscribe}
            disabled={loading || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg rounded-md transition"
          >
            {isSubmitting ? 'Processing...' : '🎬 Start Free Trial'}
          </Button>
        )}

        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">Sign in here</a>
        </p>

        <p className="text-sm text-gray-500">
          You won’t be charged until after your free trial ends.
        </p>
      </div>
    </div>
  );
}
