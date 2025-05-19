'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/browse');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-lg">
      Redirecting to KnotReels...
    </div>
  );
}
