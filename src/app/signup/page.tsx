'use client';

import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'viewer';

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold">Create your KnotReels account</h1>
        <p className="text-gray-600 text-base">
          Sign up as a <span className="font-semibold text-blue-600">{role}</span> to start your journey.
        </p>
        <AuthForm type="signup" role={role} />
      </div>
    </div>
  );
}
