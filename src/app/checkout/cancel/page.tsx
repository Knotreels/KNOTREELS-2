'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/browse');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Redirecting to KnotReels...
    </div>
  );
}
