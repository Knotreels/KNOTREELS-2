'use client';

import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import Image from 'next/image';

export default function LoginClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
      <div className="flex justify-center mb-6">
      <Image
  src="/logo-kr.jpg"
  alt="KnotReels Logo"
  width={180}
  height={180}
  priority
  className="rounded-xl"
/>

      </div>

      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold">Sign in to Your Account</h1>
        <p className="text-gray-600 text-base">
          Welcome back to <span className="font-bold">KnotReels</span>. Let’s get you logged in.
        </p>
        <AuthForm type="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
